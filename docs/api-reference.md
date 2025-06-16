
# ProSync Suite API Reference

This document provides comprehensive API documentation for all ProSync Suite applications.

## Base Information

**Base URL**: `https://pro-sync-suite-core.lovable.app`
**Authentication**: Bearer token (Supabase Auth)
**Content-Type**: `application/json`

## Authentication

All API endpoints require authentication using Supabase Auth tokens:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     https://pro-sync-suite-core.lovable.app/api/endpoint
```

## TaskMaster API

### Projects

#### Get All Projects
```http
GET /api/taskmaster/projects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

#### Get All Tasks
```http
GET /api/taskmaster/tasks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "todo",
      "priority": "medium",
      "assignee_id": "uuid",
      "project_id": "uuid",
      "due_date": "2024-01-01",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "per_page": 50
}
```

## TimeTrackPro API

#### Get Time Entries
```http
GET /api/timetrack/entries
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "task_id": "uuid",
      "project_id": "uuid",
      "description": "Work description",
      "time_spent": 120,
      "date": "2024-01-01T00:00:00Z",
      "billable": true,
      "project": "Project Name",
      "tags": ["development", "frontend"],
      "notes": "Additional notes"
    }
  ],
  "total": 100
}
```

#### Get Time Summary
```http
GET /api/timetrack/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_hours": 160.5,
    "billable_hours": 140.0,
    "projects_count": 5,
    "current_week": 40.0,
    "this_month": 160.5
  }
}
```

## BudgetBuddy API

#### Get Expenses
```http
GET /api/budget/expenses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 150.00,
      "currency": "USD",
      "category_id": "equipment",
      "description": "Office supplies",
      "project_id": "uuid",
      "date": "2024-01-01T00:00:00Z",
      "receipt_url": "https://...",
      "user_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "status": "approved"
    }
  ],
  "total": 100,
  "total_amount": 15000.00
}
```

#### Get Budgets
```http
GET /api/budget/budgets
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "total_budget": 50000.00,
      "spent_amount": 35000.00,
      "remaining_amount": 15000.00,
      "currency": "USD",
      "period": "monthly",
      "status": "on-track",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

## CollabSpace API

#### Get Channels
```http
GET /api/collab/channels
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "general",
      "description": "General discussion",
      "type": "public",
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "project_id": "uuid",
      "about": "Channel description",
      "member_count": 15
    }
  ],
  "total": 25
}
```

#### Get Messages
```http
GET /api/collab/messages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "channel_id": "uuid",
      "user_id": "uuid",
      "content": "Message content",
      "message_type": "text",
      "thread_id": "uuid",
      "mentions": ["uuid1", "uuid2"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100
}
```

## FileVault API

#### Get Files
```http
GET /api/filevault/files
```

#### Get Folders
```http
GET /api/filevault/folders
```

## PlanBoard API

#### Get Projects
```http
GET /api/planboard/projects
```

#### Get Milestones
```http
GET /api/planboard/milestones
```

## ClientConnect API

#### Get Contacts
```http
GET /api/clients/contacts
```

#### Get Interactions
```http
GET /api/clients/interactions
```

## ResourceHub API

#### Get Allocations
```http
GET /api/resources/allocations
```

#### Get Availability
```http
GET /api/resources/availability
```

## InsightIQ API

#### Get Reports
```http
GET /api/insights/reports
```

#### Get Analytics
```http
GET /api/insights/analytics
```

## RiskRadar API

#### Get Assessments
```http
GET /api/risks/assessments
```

#### Get Mitigations
```http
GET /api/risks/mitigations
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "data": []
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

APIs are rate-limited to prevent abuse:
- 1000 requests per hour per user
- 100 requests per minute per endpoint

## Testing APIs

Use the built-in API Management interface in ProSync Suite to test all endpoints with real authentication and see live responses.
