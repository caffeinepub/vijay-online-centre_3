# Vijay Online Centre

## Current State
- User login/register with mobile + password (stored in backend)
- Dashboard with 32 services, searchable/filterable grid
- ServiceForm: customer fills personal details and submits (currently frontend-only simulation, no backend storage)
- Authorization component present (admin/user roles)

## Requested Changes (Diff)

### Add
- Admin Login screen (separate from user login): credentials `vijay@123user` / `vijay@2026`, stored in backend, hardcoded admin check
- Admin session persisted in localStorage (never expires)
- Admin Dashboard showing all submitted service requests with: Customer Name, Mobile Number, Address, Selected Service, Uploaded Documents (filename), Date & Time
- Admin actions: Accept (sets status → "Processing") and Reject (sets status → "Request Rejected") per request
- Backend: `submitServiceRequest` function storing full customer form + service info + timestamp + status
- Backend: `getAllServiceRequests` admin-only function to fetch all requests
- Backend: `updateRequestStatus` admin-only function to set status (Processing / Rejected)
- Backend: `getMyServiceRequests` for customers to view their own request status
- Customer form submission saves to backend (replaces fake simulation)
- After submission, customer can see status (Pending / Processing / Request Rejected)
- "Admin Login" link on the user login screen

### Modify
- App.tsx: add new views — "adminLogin" and "adminDashboard"
- ServiceForm.tsx: wire submission to `submitServiceRequest` backend call; show status after submission
- LoginScreen.tsx: add small "Admin Login" link at the bottom

### Remove
- Nothing removed

## Implementation Plan
1. Generate new Motoko backend with:
   - Existing user auth (register/login)
   - `adminLogin(userId, password)` — validates hardcoded admin credentials, returns Bool
   - `ServiceRequest` type: id, customerName, mobile, address, serviceName, documents (text list), submittedAt (Int timestamp), status (Pending/Processing/Rejected)
   - `submitServiceRequest(request)` — any logged-in user can submit
   - `getAllServiceRequests()` — admin only
   - `updateRequestStatus(id, status)` — admin only
   - `getMyServiceRequests(mobile)` — returns requests matching mobile
2. Update App.tsx: add "adminLogin" and "adminDashboard" views, admin session in localStorage
3. Create AdminLoginScreen.tsx component
4. Create AdminDashboard.tsx component with request table/cards, accept/reject buttons
5. Update ServiceForm.tsx to call backend submitServiceRequest and show status
6. Update LoginScreen.tsx to add Admin Login link
