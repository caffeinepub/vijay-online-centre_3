import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ServiceRequest {
    id: string;
    dob: string;
    customerName: string;
    status: ServiceStatus;
    serviceName: string;
    serviceHindiName: string;
    documents: Array<string>;
    submittedAt: TimestampNanos;
    aadhaar: string;
    district: string;
    state: string;
    fatherName: string;
    address: string;
    mobile: string;
    pincode: string;
}
export interface NewServiceRequest {
    dob: string;
    customerName: string;
    serviceName: string;
    serviceHindiName: string;
    documents: Array<string>;
    aadhaar: string;
    district: string;
    state: string;
    fatherName: string;
    address: string;
    mobile: string;
    pincode: string;
}
export type Mobile = string;
export type TimestampNanos = bigint;
export type Password = string;
export interface Registration {
    password: Password;
    mobile: Mobile;
}
export interface Credentials {
    password: string;
    mobile: Mobile;
}
export interface AdminCredentials {
    userId: string;
    password: string;
}
export interface UserProfile {
    mobile: Mobile;
}
export enum ServiceStatus {
    pending = "pending",
    rejected = "rejected",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminLogin(credentials: AdminCredentials): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllCredentials(): Promise<Array<Credentials>>;
    getAllServiceRequests(): Promise<Array<ServiceRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyServiceRequests(mobile: string): Promise<Array<ServiceRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(credentials: Credentials): Promise<boolean>;
    register(credentials: Registration): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitServiceRequest(newRequest: NewServiceRequest): Promise<string>;
    updateRequestStatus(requestId: string, status: ServiceStatus): Promise<boolean>;
}
