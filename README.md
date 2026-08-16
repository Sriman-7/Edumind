EduMind

AI-Powered Education Management Portal
WEB DEVELOPMENT × INTEGRATED AI
LIVE DEMO
https://edumind-7.vercel.app/

DEMO CREDENTIALS

Student
Email: student@edumind.com
Password: <student password>

Teacher
Email: teacher@edumind.com
Password: Teacher12345

Admin
Email: admin@edumind.com
Password: Admin12345

SOURCE CODE
https://github.com/Sriman-7/Edumind

EduMind is a full-stack education management platform designed to connect students, teachers, and administrators through one intelligent academic workspace.

Instead of only storing academic records, EduMind turns attendance, assignments, examinations, grades, and academic activity into actionable academic intelligence through risk analysis, weak-subject detection, and personalized recommendations.

🎯 Hackathon Vision

EduMind addresses a simple problem:

Academic information is often scattered across different systems, making it difficult for students, teachers, and administrators to understand performance early and act on it.

EduMind brings these workflows together:

Academic Data
     ↓
Attendance + Assignments + Exams + Grades
     ↓
Academic Intelligence
     ↓
Risk Detection + Weak Areas + Trends
     ↓
Personalized Recommendations
     ↓
Better Academic Decisions

✨ Key Highlights

👨‍🎓 Student Intelligence

Students can:

View their academic dashboard

Explore courses and academic information

Track attendance

View assignments and deadlines

Submit assignments

View submission status

View marks and teacher feedback

View examination results

View course grades

Track academic progress

View AI-generated risk information

Identify weak academic areas

Receive personalized recommendations

👨‍🏫 Teacher Intelligence

Teachers can:

Access a dedicated teaching dashboard

Monitor student performance

View academic risk information

Record attendance

Mark students as Present, Late, Absent, or Excused

Review student assignments

Evaluate submissions

Enter marks

Provide feedback

Mark submissions as graded

Monitor academic activity

🏛️ Administrator Intelligence

Administrators can:

Monitor the education platform

View students and teachers

Manage user status

Review courses and classes

Create courses

Monitor assignments

Monitor examinations

Review academic records

View reports and analytics

Compare academic resource metrics

Monitor platform activity

View AI risk distribution

Monitor system health

🤖 AI Academic Intelligence

EduMind analyzes academic signals such as:

Attendance

Academic scores

Assignment completion

Pending assignments

Examination performance

The system can produce:

Academic risk score

LOW / MEDIUM / HIGH risk classification

Weak-subject indicators

Academic summaries

Personalized recommendations

Early-warning information

Academic decision-support insights

Important: The current implementation provides academic intelligence through implemented risk-analysis and recommendation logic. It does not falsely claim a specific external LLM or model where one is not actually integrated.

🧭 Product Experience

Public Portal

/
├── Home
├── Courses
│   └── Course Details
└── Contact

Courses

Students can search and filter courses using:

Course name / code

Department

Semester

Course details expose:

Description

Teacher

Department

Semester

Credits

Schedule

Syllabus

Assignments

Examinations

Enrollment

👨‍🎓 Student Portal

Main route

/student/dashboard

Assignment submission

/student/assignments/[id]

Student workflow:

Dashboard
   ↓
Upcoming Assignment
   ↓
Assignment Details
   ↓
Submit Work
   ↓
Submission Status
   ↓
Marks + Teacher Feedback

👨‍🏫 Teacher Portal

Dashboard

/teacher/dashboard

Attendance

/teacher/attendance

Assignment review / grading

/teacher/assignments/[id]

Teacher workflow:

Teacher Dashboard
      ↓
Select Class
      ↓
Record Attendance
      ↓
Review Assignment
      ↓
Enter Marks
      ↓
Add Feedback
      ↓
Grade Submission

🏛️ Administrator Portal

Dashboard

/admin/dashboard

Management Center

/admin/management

Reports

/admin/reports

Administrator workflow:

Admin Dashboard
      ↓
Management Center
      ├── Students
      ├── Teachers
      ├── Courses
      ├── Classes
      ├── Assignments
      ├── Examinations
      └── Academic Records

      ↓
Reports & Analytics
      ├── Risk Analysis
      ├── Activity Monitoring
      ├── Comparative Metrics
      └── AI Insights

🧠 AI Architecture

EduMind separates academic data management from academic intelligence.

                    ┌────────────────────┐
                    │   Academic Data    │
                    │                    │
                    │ Attendance         │
                    │ Assignments        │
                    │ Exams              │
                    │ Grades             │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Academic Analysis  │
                    └─────────┬──────────┘
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
       Risk Analysis    Weak Areas       Performance
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                    ┌────────────────────┐
                    │ Recommendations    │
                    └────────────────────┘

AI Risk

/api/ai/risk

AI Advisor

/api/ai/advisor

The student dashboard surfaces these insights in the user interface.

📊 Academic Analytics

EduMind provides visibility into:

Performance

Average academic score

Grades

Examination marks

Assignment performance

Attendance

Attendance rate

Present

Late

Absent

Excused

Risk

Risk score

Risk level

High-risk students

Medium-risk students

Low-risk students

Activity

Active users

Inactive users

Suspended users

Course count

Class count

Assignment count

Examination count

🗃️ Data Model

EduMind uses PostgreSQL with Prisma ORM.

Core entities:

User
StudentProfile
TeacherProfile
Course
Class
Enrollment
Attendance
Assignment
Submission
Exam
ExamQuestion
ExamResult
Grade
AIAnalysis
AIRecommendation
Report

Relationships support real academic workflows between:

Students
   ↕
Enrollments
   ↕
Courses
   ↕
Classes / Assignments / Exams / Grades
   ↕
Academic Intelligence

🧩 API Surface

Authentication

POST /api/auth/login
GET  /api/auth/me
POST /api/auth/register

Courses

GET  /api/courses
GET  /api/courses/[id]
POST /api/courses/[id]/enroll

Student

GET  /api/student/dashboard
GET  /api/student/assignments/[id]
POST /api/student/assignments/[id]/submit

Teacher

GET  /api/teacher/dashboard
GET  /api/teacher/attendance
POST /api/teacher/attendance

GET  /api/teacher/assignments/[id]
POST /api/teacher/assignments/[id]/grade

Administrator

GET   /api/admin/dashboard
GET   /api/admin/management
POST  /api/admin/management
PATCH /api/admin/management

AI

GET /api/ai/risk
GET /api/ai/advisor

🏗️ Technology Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

Next.js App Router

Backend

Next.js Route Handlers

TypeScript

Role-based authentication

Protected server-side APIs

Database

PostgreSQL

Prisma ORM

Prisma migrations

Development

Node.js

npm

ESLint

TypeScript

🔐 Access Control

EduMind uses role-based access control.

STUDENT
  → Student workflows

TEACHER
  → Teaching workflows

ADMIN
  → Platform administration

Protected API operations validate the authenticated role before allowing the operation.

📱 Responsive & UI

EduMind is designed for:

Desktop

Tablet

Mobile

The application also supports:

Dark mode

Light mode

Responsive navigation

Mobile-friendly dashboards

Consistent academic UI patterns

🧪 Demo / Seed Data

The repository includes Prisma seed scripts for hackathon demonstration data.

Example seeded academic data includes:

Test student

Test teacher

Test administrator

CSE courses

Classes

Attendance

Assignments

Submissions

Grades

Examinations

Exam results

AI analysis

AI recommendations

Seed

npx tsx prisma/seed.ts

Additional role-specific seed scripts are available in:

prisma/
├── seed.ts
├── seed-teacher.ts
└── seed-admin.ts

🚀 Getting Started

1. Install dependencies

npm install

2. Configure environment variables

Create:

.env.local

Use the required database and authentication environment variables for your local setup.

Never commit real secrets.

3. Generate Prisma Client

npx prisma generate

4. Apply migrations

npx prisma migrate dev

5. Seed demonstration data

npx tsx prisma/seed.ts

6. Start development server

npm run dev

Open:

http://localhost:3000

✅ Verification

Before submission:

npx tsc --noEmit

and:

npm run build

The project should complete both checks without errors.

🧪 Suggested AI-Judge Demo Flow

The fastest way to evaluate EduMind is:

1. Open /
       ↓
2. Open /courses
       ↓
3. Open a course
       ↓
4. Login
       ↓
5. Open /student/dashboard
       ↓
6. Open an assignment
       ↓
7. Submit assignment
       ↓
8. Login as Teacher
       ↓
9. Open /teacher/attendance
       ↓
10. Record attendance
       ↓
11. Review / grade an assignment
       ↓
12. Login as Admin
       ↓
13. Open /admin/management
       ↓
14. Open /admin/reports
       ↓
15. Review AI risk / analytics

🏆 Hackathon Requirement Mapping

Hackathon Requirement

EduMind Implementation

Home

/

Courses

/courses

Contact

/contact

Course Details

/courses/[id]

Search

Courses page

Filtering

Courses page

Schedules

Course Details

Enrollment

/api/courses/[id]/enroll

Student Courses

Student Dashboard

Assignment Submission

/student/assignments/[id]

Attendance

Student Dashboard / Teacher Attendance

Results

Student Dashboard

Progress

Student Dashboard

AI Recommendations

/api/ai/advisor

AI Risk Analysis

/api/ai/risk

Weak Subjects

Student AI section

Teacher Dashboard

/teacher/dashboard

Attendance Recording

/teacher/attendance

Assignment Evaluation

/teacher/assignments/[id]

Examination Support

Course / Student / Admin workflows

Academic Records

Admin Management

Student Management

Admin Management

Teacher Management

Admin Management

Course Management

Admin Management

Class Management

Admin Management

Assignment Management

Admin Management

Examination Monitoring

Admin Management

Performance Analytics

Admin Reports

Comparative Reports

Admin Reports

Activity Monitoring

Admin Reports

AI Insights

Student + Admin Reports

🔭 Product Direction

EduMind is designed as a foundation for a larger intelligent academic platform.

Future extensions can include:

Richer predictive analytics

Real-time academic alerts

Advanced recommendation models

Automated report generation

More granular institutional analytics

Advanced examination workflows

File storage and document processing

Learning-path recommendations

📌 Project Status

Hackathon MVP — Full-stack, role-based, AI-enabled education management platform.

Built with:

Next.js + React + TypeScript + PostgreSQL + Prisma

Focused on:

Manage education data → understand academic performance → identify risk → recommend action.
