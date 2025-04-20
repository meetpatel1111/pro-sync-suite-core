# Pro Sync Suite Core Documentation

Welcome to the documentation for the Pro Sync Suite Core application. This documentation provides both functional and technical details to help developers, contributors, and users understand the architecture, features, and inner workings of the app.

---

## Table of Contents
1. [Overview](#overview)
2. [Functional Documentation](#functional-documentation)
   - [User Authentication](#user-authentication)
   - [Collaborative Workspace](#collaborative-workspace)
   - [Resource Management](#resource-management)
   - [User Settings](#user-settings)
   - [Notifications & Feedback](#notifications--feedback)
3. [Technical Documentation](#technical-documentation)
   - [Project Structure](#project-structure)
   - [State Management & Contexts](#state-management--contexts)
   - [Services & Data Layer](#services--data-layer)
   - [UI Components](#ui-components)
   - [Integration & APIs](#integration--apis)
   - [Environment Variables](#environment-variables)
   - [Security](#security)
4. [Extending & Contributing](#extending--contributing)
5. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Overview
Pro Sync Suite Core is a modern, collaborative productivity platform featuring real-time workspace management, resource allocation, and robust user settings. It leverages Supabase for authentication and data, and is built with React, TypeScript, and a modular, context-driven architecture.

---

## Functional Documentation
### User Authentication
- Secure signup and login using Supabase Auth.
- Session management and profile handling.
- Feedback via toast notifications for login, logout, and errors.

### Collaborative Workspace
- Real-time chat, file sharing, and channel management.
- Workspace CRUD (create, list, delete) for authenticated users.
- State management for channels, messages, and members.

### Resource Management
- Add, edit, and delete resources.
- Skills matrix, utilization reports, and availability tracking.
- Tabbed interface for resource-related features.

### User Settings
- Manage user and organization preferences (theme, notifications, security, etc.).
- Settings are fetched and saved using the backend service.
- Live UI updates for appearance and accessibility settings.

### Notifications & Feedback
- Toasts and alerts for user actions and errors.
- In-app notifications for due tasks, project milestones, and more.

---

## Technical Documentation
### Project Structure
- `src/pages`: Main app pages (Auth, CollabSpace, ResourceHub, UserSettings, etc.)
- `src/context`: Context providers for authentication, integration, settings, etc.
- `src/services`: Data access and integration services (dbService, integrationService, etc.)
- `src/components/ui`: UI primitives and reusable components.
- `src/hooks`: Custom React hooks for state and logic.

### State Management & Contexts
- Uses React Context API for global state (auth, settings, integrations).
- Custom hooks (`useAuth`, `useSettings`, etc.) encapsulate logic and state.

### Services & Data Layer
- `dbService` provides CRUD for users, settings, tasks, etc., via Supabase.
- Robust error handling and consistent return structures.

### UI Components
- Modular, accessible, and reusable UI components.
- Atomic design for form controls, feedback, navigation, and layout.

### Integration & APIs
- Supabase for authentication and data storage.
- Integration context for project/task automation and document linking.

### Environment Variables
- Configure Supabase URL, API keys, and other secrets in environment files.

### Security
- All sensitive actions gated behind authentication.
- Type safety and context checks throughout the app.

---

## Extending & Contributing
- Fork the repository and submit pull requests for new features or fixes.
- Follow the established code style and architectural patterns.
- Add documentation for any new modules or features.

---

## Troubleshooting & FAQ
- **Settings not loading?** Ensure user_id matches the logged-in user and the backend returns the expected data structure.
- **TypeScript errors?** Check type definitions in context, hooks, and service layers.
- **Authentication issues?** Confirm environment variables and Supabase configuration.

---

For more details, see additional markdown files in this folder for specific modules, features, or troubleshooting guides.
