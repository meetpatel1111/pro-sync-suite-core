
# ProSync Suite Documentation

Welcome to the ProSync Suite documentation. This comprehensive project management solution includes 10 integrated applications designed to streamline workflows and boost productivity.

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Applications](#applications)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Development](#development)
- [Deployment](#deployment)

## Overview

ProSync Suite is a modern web-based project management platform built with React, TypeScript, and Supabase. It provides a unified workspace for teams to collaborate, track progress, and manage resources efficiently.

### Key Features

- **10 Integrated Apps** - Complete project management ecosystem
- **Real-time Collaboration** - Live updates and notifications
- **Cross-App Integration** - Seamless data flow between applications
- **Modern UI/UX** - Built with Tailwind CSS and Shadcn/UI
- **Enterprise Ready** - Scalable architecture with role-based access
- **AI-Powered Features** - Smart automation and insights
- **API Management** - RESTful APIs for all applications

## Getting Started

1. **Authentication** - Sign up or sign in to access the platform
2. **Dashboard** - Your central hub for accessing all applications
3. **Quick Actions** - Perform common tasks directly from the dashboard
4. **App Navigation** - Use the sidebar or app cards to navigate between tools

## Applications

| App | Description | Status | API Endpoints |
|-----|-------------|---------|---------------|
| [TaskMaster](./apps/taskmaster.md) | Task & Workflow Management | ✅ Active | `/api/taskmaster/*` |
| [TimeTrackPro](./apps/timetrackpro.md) | Time Tracking & Productivity | ✅ Active | `/api/timetrack/*` |
| [CollabSpace](./apps/collabspace.md) | Team Communication & Collaboration | ✅ Active | `/api/collab/*` |
| [PlanBoard](./apps/planboard.md) | Project Planning & Gantt Charts | ✅ Active | `/api/planboard/*` |
| [FileVault](./apps/filevault.md) | Document & File Management | ✅ Active | `/api/filevault/*` |
| [BudgetBuddy](./apps/budgetbuddy.md) | Budgeting & Expense Tracking | ✅ Active | `/api/budget/*` |
| [InsightIQ](./apps/insightiq.md) | Analytics & Reporting | ✅ Active | `/api/insights/*` |
| [ClientConnect](./apps/clientconnect.md) | Client & Stakeholder Engagement | ✅ Active | `/api/clients/*` |
| [RiskRadar](./apps/riskradar.md) | Risk & Issue Tracking | ✅ Active | `/api/risks/*` |
| [ResourceHub](./apps/resourcehub.md) | Resource Allocation & Management | ✅ Active | `/api/resources/*` |

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Icons**: Lucide React
- **API**: RESTful APIs with Supabase Edge Functions

## API Reference

All APIs are documented and testable through the [API Management interface](./api-reference.md).

**Base URL**: `https://pro-sync-suite-core.lovable.app`

## Development

For development setup and contribution guidelines, see [Development Guide](./development.md).

## Support

For technical support or questions, please refer to the individual app documentation or contact the development team.

**Live Demo**: [https://pro-sync-suite-core.lovable.app](https://pro-sync-suite-core.lovable.app)
