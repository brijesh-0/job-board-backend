# Job Board Backend API

REST API for a job board with candidates and employers.  
Built with **Node.js + Express + TypeScript + MongoDB**.

## Features

- Secure login (JWT + HttpOnly cookies)
- Two roles: Candidate & Employer
- Post & Manage Jobs
- Apply with resume (PDF upload via Cloudinary)
- Track application status
- Full-text job search
- Email notifications
- filters

## Tech Stack

- Node.js 18+
- Express + TypeScript
- MongoDB
- JWT + bcrypt
- Cloudinary (resumes)
- Nodemailer (emails)

## Quick Start

```bash
git clone <your-repo-url>
cd job-board-backend
npm install
cp .env.example .env
# modify the .env with your credentials
```

Start server:

```bash
npm run dev
```

API runs at: http://localhost:5000/api

## Test Accounts

- **Candidate**: candidate@example.com / password123
- **Employer**: employer@example.com / password123

## Main API Routes

| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| POST   | /api/auth/register           | Register (choose role)       |
| POST   | /api/auth/login              | Login → sets HttpOnly cookie |
| GET    | /api/auth/me                 | Get current user             |
| GET    | /api/jobs                    | Search & filter jobs         |
| GET    | /api/jobs/:id                | Job details                  |
| POST   | /api/jobs (employer)         | Create job                   |
| POST   | /api/applications            | Apply to job + upload resume |
| GET    | /api/applications            | My applications              |
| PUT    | /api/applications/:id/status | Update status (employer)     |

## Notes

- Frontend: https://github.com/brijesh-0/job-board-frontend
- Resumes: PDF only, max 5MB
- No real-time updates (refresh to see changes)
- No password reset yet
- Currency: INR only
