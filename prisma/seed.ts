import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  console.log("🌱 Starting EduMind database seed...");

  // ─────────────────────────────────────────────
  // EXISTING TEST STUDENT
  // ─────────────────────────────────────────────

  const student = await prisma.studentProfile.findUnique({
    where: {
      id: "student_test_001",
    },
  });

  if (!student) {
    throw new Error(
      "StudentProfile student_test_001 not found. Create the student profile first."
    );
  }

  console.log(`👨‍🎓 Student: ${student.rollNumber}`);

  // ─────────────────────────────────────────────
  // COURSES
  // ─────────────────────────────────────────────

const courses = [
  {
    id: "course_cyber_001",
    code: "CS401",
    name: "Cybersecurity Fundamentals",
    description:
      "Fundamentals of cybersecurity and information security.",
    credits: 4,
    department: "CSE",
    semester: 1,
    schedule: "Monday 10:00 AM – 12:00 PM",
    syllabus:
      "Network security, cryptography, authentication, malware, threat modeling, ethical hacking and information security.",
  },

  {
    id: "course_ai_001",
    code: "CS402",
    name: "Artificial Intelligence",
    description:
      "Introduction to artificial intelligence and intelligent systems.",
    credits: 4,
    department: "CSE",
    semester: 1,
    schedule: "Tuesday 11:00 AM – 1:00 PM",
    syllabus:
      "Intelligent agents, uninformed search, informed search, game playing, knowledge representation, reasoning, Bayesian networks and natural language processing.",
  },

  {
    id: "course_dbms_001",
    code: "CS403",
    name: "Database Management Systems",
    description:
      "Database design, SQL and database systems.",
    credits: 4,
    department: "CSE",
    semester: 1,
    schedule: "Wednesday 9:00 AM – 11:00 AM",
    syllabus:
      "Relational databases, ER modeling, normalization, SQL, transactions, indexing, query optimization and database security.",
  },

  {
    id: "course_fsd_001",
    code: "CS404",
    name: "Full Stack Development",
    description:
      "Modern frontend and backend web development.",
    credits: 4,
    department: "CSE",
    semester: 1,
    schedule: "Thursday 2:00 PM – 4:00 PM",
    syllabus:
      "HTML, CSS, JavaScript, React, Next.js, REST APIs, authentication, databases, deployment and full-stack application architecture.",
  },
];

  for (const course of courses) {
    await prisma.course.upsert({
      where: {
        id: course.id,
      },
      update: course,
      create: course,
    });
  }

  console.log("📚 Courses created");

  // ─────────────────────────────────────────────
  // ENROLLMENTS
  // ─────────────────────────────────────────────

  for (const course of courses) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id,
        },
      },
      update: {
        semester: 1,
      },
      create: {
        studentId: student.id,
        courseId: course.id,
        semester: 1,
      },
    });
  }

  console.log("📝 Enrollments created");

  // ─────────────────────────────────────────────
  // CLASSES
  // ─────────────────────────────────────────────

  const classes = [
    {
      id: "class_cyber_001",
      name: "Cybersecurity Fundamentals",
      section: "A",
      room: "CSE-101",
      schedule: "Monday 10:00 AM",
      courseId: "course_cyber_001",
    },
    {
      id: "class_ai_001",
      name: "Artificial Intelligence",
      section: "A",
      room: "CSE-102",
      schedule: "Tuesday 11:00 AM",
      courseId: "course_ai_001",
    },
    {
      id: "class_dbms_001",
      name: "Database Management Systems",
      section: "A",
      room: "CSE-103",
      schedule: "Wednesday 9:00 AM",
      courseId: "course_dbms_001",
    },
    {
      id: "class_fsd_001",
      name: "Full Stack Development",
      section: "A",
      room: "LAB-01",
      schedule: "Thursday 2:00 PM",
      courseId: "course_fsd_001",
    },
  ];

  for (const classData of classes) {
    await prisma.class.upsert({
      where: {
        id: classData.id,
      },
      update: classData,
      create: classData,
    });
  }

  console.log("🏫 Classes created");

  // ─────────────────────────────────────────────
  // ATTENDANCE
  // ─────────────────────────────────────────────

  const attendanceStatuses = [
    "PRESENT",
    "PRESENT",
    "PRESENT",
    "PRESENT",
    "LATE",
  ] as const;

  const classList = classes;

  for (let i = 0; i < 20; i++) {
    const classData = classList[i % classList.length];

    const date = new Date();
    date.setDate(date.getDate() - (20 - i));

    // Make most attendance present
    let status: "PRESENT" | "ABSENT" | "LATE";

    if (i === 6 || i === 15) {
      status = "ABSENT";
    } else {
      status = attendanceStatuses[i % attendanceStatuses.length];
    }

    await prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId: student.id,
          classId: classData.id,
          date,
        },
      },
      update: {
        status,
      },
      create: {
        studentId: student.id,
        classId: classData.id,
        date,
        status,
        remarks:
          status === "LATE"
            ? "Student arrived late"
            : status === "ABSENT"
              ? "Absent"
              : "Regular attendance",
      },
    });
  }

  console.log("📅 Attendance records created");

  // ─────────────────────────────────────────────
  // ASSIGNMENTS
  // ─────────────────────────────────────────────

  const assignments = [
    {
      id: "assignment_001",
      title: "Network Security Report",
      description: "Prepare a report on common network security threats.",
      courseId: "course_cyber_001",
      maxMarks: 100,
    },
    {
      id: "assignment_002",
      title: "Cyber Attack Analysis",
      description: "Analyze a recent cybersecurity attack.",
      courseId: "course_cyber_001",
      maxMarks: 100,
    },
    {
      id: "assignment_003",
      title: "AI Search Algorithms",
      description: "Implement BFS, DFS and A* search.",
      courseId: "course_ai_001",
      maxMarks: 100,
    },
    {
      id: "assignment_004",
      title: "Machine Learning Report",
      description: "Explain supervised and unsupervised learning.",
      courseId: "course_ai_001",
      maxMarks: 100,
    },
    {
      id: "assignment_005",
      title: "SQL Query Practice",
      description: "Write SQL queries for a student database.",
      courseId: "course_dbms_001",
      maxMarks: 100,
    },
    {
      id: "assignment_006",
      title: "Database Design",
      description: "Design a normalized relational database.",
      courseId: "course_dbms_001",
      maxMarks: 100,
    },
    {
      id: "assignment_007",
      title: "Next.js Application",
      description: "Build a responsive Next.js application.",
      courseId: "course_fsd_001",
      maxMarks: 100,
    },
    {
      id: "assignment_008",
      title: "REST API Project",
      description: "Create a REST API using Next.js.",
      courseId: "course_fsd_001",
      maxMarks: 100,
    },
  ];

  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + i - 2);

    await prisma.assignment.upsert({
      where: {
        id: assignment.id,
      },
      update: {
        title: assignment.title,
        description: assignment.description,
        courseId: assignment.courseId,
        maxMarks: assignment.maxMarks,
        dueDate,
      },
      create: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        courseId: assignment.courseId,
        maxMarks: assignment.maxMarks,
        dueDate,
      },
    });
  }

  console.log("📋 Assignments created");

  // ─────────────────────────────────────────────
  // SUBMISSIONS
  // ─────────────────────────────────────────────

  const submissionData = [
    {
      assignmentId: "assignment_001",
      marks: 88,
      status: "GRADED" as const,
    },
    {
      assignmentId: "assignment_002",
      marks: 92,
      status: "GRADED" as const,
    },
    {
      assignmentId: "assignment_003",
      marks: 85,
      status: "GRADED" as const,
    },
    {
      assignmentId: "assignment_004",
      marks: 78,
      status: "GRADED" as const,
    },
    {
      assignmentId: "assignment_005",
      marks: 90,
      status: "GRADED" as const,
    },
    {
      assignmentId: "assignment_006",
      marks: null,
      status: "SUBMITTED" as const,
    },
  ];

  for (const submission of submissionData) {
    await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: submission.assignmentId,
          studentId: student.id,
        },
      },
      update: {
        marks: submission.marks,
        status: submission.status,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: submission.assignmentId,
        studentId: student.id,
        marks: submission.marks,
        status: submission.status,
        submittedAt: new Date(),
        content: "Student submission for academic evaluation.",
      },
    });
  }

  console.log("📤 Submissions created");

  // ─────────────────────────────────────────────
  // GRADES
  // ─────────────────────────────────────────────

  const grades = [
    {
      id: "grade_cyber_001",
      courseId: "course_cyber_001",
      score: 88,
      grade: "A",
    },
    {
      id: "grade_ai_001",
      courseId: "course_ai_001",
      score: 82,
      grade: "A",
    },
    {
      id: "grade_dbms_001",
      courseId: "course_dbms_001",
      score: 91,
      grade: "A+",
    },
    {
      id: "grade_fsd_001",
      courseId: "course_fsd_001",
      score: 86,
      grade: "A",
    },
  ];

  for (const grade of grades) {
    await prisma.grade.upsert({
      where: {
        id: grade.id,
      },
      update: {
        score: grade.score,
        grade: grade.grade,
      },
      create: {
        id: grade.id,
        studentId: student.id,
        courseId: grade.courseId,
        semester: 1,
        score: grade.score,
        grade: grade.grade,
        remarks: "Good academic performance",
      },
    });
  }

  console.log("📊 Grades created");

  // ─────────────────────────────────────────────
  // EXAM
  // ─────────────────────────────────────────────

  const exam = await prisma.exam.upsert({
    where: {
      id: "exam_midterm_001",
    },
    update: {},
    create: {
      id: "exam_midterm_001",
      title: "Semester Midterm Examination",
      description: "Midterm examination for semester 1.",
      examDate: new Date(),
      duration: 120,
      totalMarks: 100,
      courseId: "course_cyber_001",
    },
  });

  console.log("📝 Exam created");

  // ─────────────────────────────────────────────
  // EXAM RESULT
  // ─────────────────────────────────────────────

  await prisma.examResult.upsert({
    where: {
      examId_studentId: {
        examId: exam.id,
        studentId: student.id,
      },
    },
    update: {
      marks: 87,
      grade: "A",
    },
    create: {
      examId: exam.id,
      studentId: student.id,
      marks: 87,
      grade: "A",
      feedback: "Excellent performance.",
    },
  });

  console.log("🎓 Exam result created");

  // ─────────────────────────────────────────────
  // AI ANALYSIS
  // ─────────────────────────────────────────────

  await prisma.aIAnalysis.upsert({
    where: {
      id: "ai_analysis_test_001",
    },
    update: {
      overallScore: 86,
      attendanceRate: 90,
      riskScore: 18,
      summary:
        "Student is performing well academically with strong attendance and consistent assignment performance.",
    },
    create: {
      id: "ai_analysis_test_001",
      studentId: student.id,
      type: "RISK",
      overallScore: 86,
      attendanceRate: 90,
      riskScore: 18,
      weakSubjects: [],
      performanceData: {
        averageScore: 86.75,
        attendance: 90,
        pendingAssignments: 2,
      },
      summary:
        "Student is performing well academically with strong attendance and consistent assignment performance.",
    },
  });

  console.log("🤖 AI analysis created");

  // ─────────────────────────────────────────────
  // AI RECOMMENDATIONS
  // ─────────────────────────────────────────────

  const recommendations = [
    {
      id: "recommendation_001",
      type: "STUDY" as const,
      priority: "MEDIUM" as const,
      title: "Maintain your study routine",
      message:
        "Your academic performance is strong. Continue your current study routine.",
      action: "Maintain your weekly study schedule.",
    },
    {
      id: "recommendation_002",
      type: "ASSIGNMENT" as const,
      priority: "HIGH" as const,
      title: "Complete pending assignments",
      message:
        "You have assignments that still need to be completed.",
      action: "Review your pending assignments.",
    },
    {
      id: "recommendation_003",
      type: "ATTENDANCE" as const,
      priority: "LOW" as const,
      title: "Keep your attendance high",
      message:
        "Your attendance is currently healthy. Continue attending classes regularly.",
      action: "Maintain attendance above 85%.",
    },
  ];

  for (const recommendation of recommendations) {
    await prisma.aIRecommendation.upsert({
      where: {
        id: recommendation.id,
      },
      update: {
        type: recommendation.type,
        priority: recommendation.priority,
        title: recommendation.title,
        message: recommendation.message,
        action: recommendation.action,
      },
      create: {
        id: recommendation.id,
        studentId: student.id,
        type: recommendation.type,
        priority: recommendation.priority,
        title: recommendation.title,
        message: recommendation.message,
        action: recommendation.action,
      },
    });
  }

  console.log("💡 AI recommendations created");

  console.log("");
  console.log("======================================");
  console.log("🎉 EduMind seed completed successfully!");
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });