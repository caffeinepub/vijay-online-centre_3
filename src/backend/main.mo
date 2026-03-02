import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type Mobile = Text;
  type Password = Text;
  type HashedPassword = Text;
  type TimestampNanos = Int;
  type RequestId = Nat;

  type Registration = {
    mobile : Mobile;
    password : Password;
  };

  type Credentials = {
    mobile : Mobile;
    password : Text;
  };

  public type UserProfile = {
    mobile : Mobile;
  };

  public type AdminCredentials = {
    userId : Text;
    password : Text;
  };

  module Credentials {
    public func compare(c1 : Credentials, c2 : Credentials) : Order.Order {
      Text.compare(c1.mobile, c2.mobile);
    };
  };

  public type ServiceStatus = {
    #pending;
    #processing;
    #rejected;
  };

  public type ServiceRequest = {
    id : Text;
    customerName : Text;
    mobile : Text;
    fatherName : Text;
    dob : Text;
    address : Text;
    district : Text;
    state : Text;
    pincode : Text;
    aadhaar : Text;
    serviceName : Text;
    serviceHindiName : Text;
    documents : [Text];
    submittedAt : TimestampNanos;
    status : ServiceStatus;
  };

  type NewServiceRequest = {
    customerName : Text;
    mobile : Text;
    fatherName : Text;
    dob : Text;
    address : Text;
    district : Text;
    state : Text;
    pincode : Text;
    aadhaar : Text;
    serviceName : Text;
    serviceHindiName : Text;
    documents : [Text];
  };

  // State
  let credentialsDb = Map.empty<Mobile, HashedPassword>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var requestCounter = 0; // Used to generate unique request IDs

  // Service Requests State
  var nextRequestId : RequestId = 1;
  let serviceRequests = Map.empty<RequestId, ServiceRequest>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Authentication System

  public query ({ caller }) func getAllCredentials() : async [Credentials] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all credentials");
    };
    credentialsDb.entries().toArray().map(
      func((mobile, password)) { { mobile; password } }
    ).sort();
  };

  // Public registration - anyone can register
  public shared ({ caller }) func register(credentials : Registration) : async () {
    if (credentialsDb.containsKey(credentials.mobile)) {
      Runtime.trap("Mobile " # credentials.mobile # " is already registered with a password");
    };
    credentialsDb.add(credentials.mobile, credentials.password);

    // Assign user role to the caller after successful registration
    AccessControl.assignRole(accessControlState, caller, caller, #user);

    // Create user profile
    let profile : UserProfile = {
      mobile = credentials.mobile;
    };
    userProfiles.add(caller, profile);
  };

  // Public login - anyone can attempt to login
  public shared ({ caller }) func login(credentials : Credentials) : async Bool {
    switch (credentialsDb.get(credentials.mobile)) {
      case (null) { false };
      case (?password) {
        let isValid = password == credentials.password;
        if (isValid) {
          // Assign user role to the caller after successful login
          AccessControl.assignRole(accessControlState, caller, caller, #user);

          // Create or update user profile if it doesn't exist
          if (not userProfiles.containsKey(caller)) {
            let profile : UserProfile = {
              mobile = credentials.mobile;
            };
            userProfiles.add(caller, profile);
          };
        };
        isValid;
      };
    };
  };

  // Get current user's profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get another user's profile (admin only or own profile)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save current user's profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin Authentication
  public shared ({ caller }) func adminLogin(credentials : AdminCredentials) : async Bool {
    let isValid = credentials.userId == "vijay@123user" and credentials.password == "vijay@2026";
    if (isValid) {
      // Assign admin role to the caller after successful admin login
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    };
    isValid;
  };

  // Service Request Management

  // Anyone can submit a service request
  public shared ({ caller }) func submitServiceRequest(newRequest : NewServiceRequest) : async Text {
    let id = nextRequestId;
    nextRequestId += 1;

    let serviceRequest : ServiceRequest = {
      id = id.toText();
      customerName = newRequest.customerName;
      mobile = newRequest.mobile;
      fatherName = newRequest.fatherName;
      dob = newRequest.dob;
      address = newRequest.address;
      district = newRequest.district;
      state = newRequest.state;
      pincode = newRequest.pincode;
      aadhaar = newRequest.aadhaar;
      serviceName = newRequest.serviceName;
      serviceHindiName = newRequest.serviceHindiName;
      documents = newRequest.documents;
      submittedAt = Time.now();
      status = #pending;
    };

    serviceRequests.add(id, serviceRequest);
    id.toText();
  };

  // Admin-only: Get all service requests
  public query ({ caller }) func getAllServiceRequests() : async [ServiceRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all service requests");
    };
    let requests = serviceRequests.values().toArray();
    requests.sort(
      func(a, b) {
        if (a.submittedAt > b.submittedAt) {
          return #less;
        };
        if (a.submittedAt < b.submittedAt) {
          return #greater;
        };
        #equal;
      }
    );
  };

  // Admin-only: Update request status
  public shared ({ caller }) func updateRequestStatus(requestId : Text, status : ServiceStatus) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update request status");
    };

    let id = switch (Nat.fromText(requestId)) {
      case (null) { return false };
      case (?id) { id };
    };

    switch (serviceRequests.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated = {
          existing with status
        };
        serviceRequests.add(id, updated);
        true;
      };
    };
  };

  // Get service requests for a specific mobile number
  // Users can only query their own requests, admins can query any
  public query ({ caller }) func getMyServiceRequests(mobile : Text) : async [ServiceRequest] {
    // Verify caller has permission to view this mobile's requests
    switch (userProfiles.get(caller)) {
      case (null) {
        // Caller has no profile - check if admin
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You must be logged in to view service requests");
        };
        // Admin can proceed
      };
      case (?profile) {
        // User has profile - verify they're querying their own mobile or they're admin
        if (profile.mobile != mobile and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own service requests");
        };
      };
    };

    Array.fromIter(
      serviceRequests.values().filter(
        func(req) {
          req.mobile == mobile;
        }
      )
    ).sort(
      func(a, b) {
        if (a.submittedAt > b.submittedAt) {
          return #less;
        };
        if (a.submittedAt < b.submittedAt) {
          return #greater;
        };
        #equal;
      }
    );
  };
};
