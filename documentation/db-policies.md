# Database Policies Documentation

This document describes the database policies defined in the `/db/policies` folder. Policies are used to enforce access control, row-level security, and other rules at the database level.

## How Database Policies Work
- Policies are typically written in SQL and are applied to tables to control who can read, write, or modify data.
- They are critical for enforcing security and privacy requirements, especially in multi-tenant and collaborative applications.

## Folder Overview
- The `/db/policies` folder contains all policy definitions for the database.
- Each file or script applies one or more policies to tables such as `users`, `user_settings`, `resources`, etc.

## Example Use Cases
- Restricting access to user settings to only the owner.
- Allowing only workspace members to access certain channels or messages.
- Enforcing read/write permissions based on user roles or organization membership.

---

For detailed policy SQL, see each file in `/db/policies`.
