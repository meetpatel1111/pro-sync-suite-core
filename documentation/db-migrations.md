# Database Migrations Documentation

This document provides a detailed overview of all SQL migration files in the `/db/migrations` folder. Each migration is responsible for evolving the database schema to support new features, integrations, and data requirements in the Pro Sync Suite Core application.

## How Database Migrations Work
- Migrations are SQL scripts applied in sequence to update the database schema.
- Each migration file typically creates or alters tables, indexes, constraints, or other database objects.
- Migrations are essential for versioning and reproducibility of the database structure.

## Migration Files Overview

### 20250420_add_collabspace_features.sql
- Adds features and schema changes required for collaborative workspace functionality.

### 20250420_create_meetings.sql
- Introduces tables and fields related to meeting scheduling and management.

### 20250420_create_resource_allocations.sql
- Adds tables for tracking resource allocations to projects and tasks.

### 20250420_dashboard_stats_dependencies.sql
- Supports dashboard statistics and dependencies for reporting features.

### migration_clientconnect_riskradar.sql
- Integrates client connection and risk radar features, including relevant tables and relationships.

### migration_collabspace.sql
- Initial schema for collaborative workspace, channels, and messaging.

### migration_filevault_budgetbuddy.sql
- Introduces file vault and budget management features.

### migration_fix_check_table_exists.sql
- Fixes logic for checking table existence in migrations.

### migration_insightiq_resourcehub.sql
- Adds InsightIQ analytics and ResourceHub management tables.

### migration_prosync_integration.sql
- Supports integrations with external tools and automation.

### migration_resourcehub_extend.sql
- Extends ResourceHub with additional fields and relationships.

### migration_resources.sql
- Creates core resources tables for user and asset management.

### migration_resources_extend.sql
- Adds more fields to resources for extended tracking.

### migration_task_settings.sql
- Introduces settings related to task management.

### migration_user_settings.sql
- Creates the user_settings table for storing user and organization preferences.

### migration_user_settings_extend.sql
- Extends the user_settings table with more configuration options.

### migration_users.sql
- Creates the users table for authentication and profile management.

---

## Best Practices
- Always apply migrations in order to avoid schema conflicts.
- Review each migration file before applying to production.
- Use migrations to document schema changes for future maintainers.

---

For detailed SQL, see each file in `/db/migrations`.
