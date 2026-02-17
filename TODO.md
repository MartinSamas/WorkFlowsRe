# Setup Checklist

## 1. Project Initialization
- [ ] Create React app: `npx create-react-app holiday-app --template typescript`
    - OR use Vite: `npm create vite@latest holiday-app -- --template react-ts`
    - OR use Next.js: `npx create-next-app@latest holiday-app`
- [ ] Set up backend folder structure
- [ ] Initialize Git repository

## 2. Google Cloud Console Setup
- [ ] Create new project at console.cloud.google.com
- [ ] Enable Google Calendar API
- [ ] Enable Gmail API (or use nodemailer with SMTP)
- [ ] Create OAuth 2.0 credentials
    - Web application type
    - Add authorized redirect URIs
    - Download credentials JSON
- [ ] Set up OAuth consent screen

## 3. Development Environment
```bash
# Backend dependencies
npm install express sqlite cors dotenv
npm install @google-cloud/local-auth googleapis
npm install nodemailer jsonwebtoken bcrypt

# Frontend dependencies
npm install axios react-router-dom
npm install @tanstack/react-query
npm install date-fns # for date handling
```

## 4. Environment Variables
```env name=.env.example
# Backend .env
PORT=3001
DATABASE_URL=./database.sqlite
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000

# Frontend .env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```
