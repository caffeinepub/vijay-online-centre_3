# Vijay Online Centre

## Current State

The app has a working Motoko backend with `register` and `login` functions that store mobile numbers and passwords in a `credentialsDb` map. The frontend `LoginScreen.tsx` calls `actor.register()` and `actor.login()` correctly, but:

1. After registration, the user is NOT auto-logged in — the app just switches back to login mode requiring a manual second step.
2. The catch block shows a generic "Something went wrong" error which is shown even for benign errors (e.g. duplicate mobile number registrations throw a backend trap).
3. Session persistence: `loggedInMobile` is stored only in React state (lost on page refresh). There is no localStorage persistence for the user session.
4. App.tsx reads `adminSession` from localStorage for admin, but nothing equivalent exists for regular users.

## Requested Changes (Diff)

### Add
- After successful registration, automatically call `login` and proceed directly to the dashboard (auto-login).
- Persist user session in localStorage: save `userMobile` on login/register, read it on app init to restore session.
- Better error messages from backend traps (parse trap message for "already registered" case).

### Modify
- `LoginScreen.tsx` register flow: after `actor.register()` succeeds, call `actor.login()` and invoke `onLoginSuccess`.
- `LoginScreen.tsx` catch block: improve error message — detect "already registered" trap message and show "This mobile number is already registered. Please login." instead of generic error.
- `App.tsx`: restore user session from localStorage on load (similar to admin session), and save/clear it on login/logout.

### Remove
- Generic "Something went wrong. Please try again." toast — replace with meaningful messages.

## Implementation Plan

1. Update `App.tsx` to read `userMobile` from localStorage on init and restore user session.
2. Update `handleLoginSuccess` in `App.tsx` to save `userMobile` to localStorage.
3. Update `handleLogout` in `App.tsx` to remove `userMobile` from localStorage.
4. Update `LoginScreen.tsx` register flow to auto-login after registration.
5. Update `LoginScreen.tsx` catch block to show specific error messages based on backend trap content.
