# EduMind — AI Judge Demo Guide

EduMind is an AI-powered Education Management Portal for students,
teachers, and administrators.

## 1. Start the Project

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev