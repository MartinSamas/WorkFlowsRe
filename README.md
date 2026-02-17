# Holiday Request App - Architecture

## Tech Stack
- **Frontend**: React (TypeScript)
- **Database**: SQLite (for development and production)
- **Backend**: Node.js + Express (or Next.js API routes)
- **Authentication**: Google OAuth 2.0
- **APIs**: Google Calendar API, Gmail API (or nodemailer)

## Key Components

### Frontend (React)
1. Authentication flow
2. Request submission form
3. Request list/calendar view
4. Admin approval dashboard
5. User profile/permissions

### Backend (Node.js)
1. REST API endpoints
2. Database models & migrations
3. Google API integration
4. Email service
5. Authorization middleware

### Database Schema
- users (id, email, name, role, google_id)
- holiday_requests (id, user_id, start_date, end_date, status, type)
- approvals (id, request_id, approver_id, status, timestamp)
- permissions (id, user_id, role, can_approve)
