import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // ───────────────────
    // ──────────────────────────
    // AUTHENTICATION
    // ─────────────────────────────────────────────

    const auth = await getCurrentUser();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Only students can access this dashboard
    if (auth.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Student access required",
        },
        { status: 403 }
      );
    }

    // ─────────────────────────────────────────────
    // GET STUDENT PROFILE
    // ─────────────────────────────────────────────

    const student = await prisma.studentProfile.findUnique({
      where: {
        userId: auth.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student profile not found",
        },
        { status: 404 }
      );
    }

    // ─────────────────────────────────────────────
    // ATTENDANCE
    // ─────────────────────────────────────────────

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
      },
      select: {
        status: true,
      },
    });

    const totalAttendance = attendanceRecords.length;

    const presentCount = attendanceRecords.filter(
      (record) => record.status === "PRESENT"
    ).length;

    const lateCount = attendanceRecords.filter(
      (record) => record.status === "LATE"
    ).length;

    const absentCount = attendanceRecords.filter(
      (record) => record.status === "ABSENT"
    ).length;

    const excusedCount = attendanceRecords.filter(
      (record) => record.status === "EXCUSED"
    ).length;

    // PRESENT + LATE are considered attended
    const attendedCount = presentCount + lateCount;

    const attendanceRate =
      totalAttendance > 0
        ? Math.round((attendedCount / totalAttendance) * 100)
        : 0;

    // ─────────────────────────────────────────────
    // COURSES
    // ─────────────────────────────────────────────

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            department: true,
            semester: true,
          },
        },
      },
    });

    const courses = enrollments.map((enrollment) => enrollment.course);

    const courseIds = courses.map((course) => course.id);

    // ─────────────────────────────────────────────
    // ASSIGNMENTS
    // ─────────────────────────────────────────────

    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: {
          in: courseIds.length > 0 ? courseIds : ["__none__"],
        },
      },
      include: {
        submissions: {
          where: {
            studentId: student.id,
          },
          select: {
            id: true,
            status: true,
            marks: true,
            submittedAt: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Assignment is pending when:
    // 1. Student has no submission
    // OR
    // 2. Submission is still pending
    const pendingAssignments = assignments.filter((assignment) => {
      if (assignment.submissions.length === 0) {
        return true;
      }

      return assignment.submissions.some(
        (submission) => submission.status === "PENDING"
      );
    });

    // ─────────────────────────────────────────────
    // GRADES
    // ─────────────────────────────────────────────

    const grades = await prisma.grade.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalGrades = grades.length;

    const totalScore = grades.reduce(
      (sum, grade) => sum + grade.score,
      0
    );

    const averageScore =
      totalGrades > 0
        ? Math.round((totalScore / totalGrades) * 100) / 100
        : 0;

    // ─────────────────────────────────────────────
    // EXAM RESULTS
    // ─────────────────────────────────────────────

    const examResults = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
      },
      select: {
        marks: true,
        grade: true,
        exam: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            examDate: true,
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ─────────────────────────────────────────────
    // AI ANALYSIS
    // ─────────────────────────────────────────────

    const latestRiskAnalysis = await prisma.aIAnalysis.findFirst({
      where: {
        studentId: student.id,
        type: "RISK",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        riskScore: true,
        overallScore: true,
        attendanceRate: true,
        weakSubjects: true,
        summary: true,
        createdAt: true,
      },
    });

    // ─────────────────────────────────────────────
    // FALLBACK AI RISK CALCULATION
    // ─────────────────────────────────────────────
    //
    // Until we connect an actual AI model, calculate
    // a meaningful academic risk score.
    //
    // Higher score = higher academic risk.
    // ─────────────────────────────────────────────

    let riskScore = 0;

    // Attendance risk
    if (attendanceRate < 50) {
      riskScore += 40;
    } else if (attendanceRate < 65) {
      riskScore += 30;
    } else if (attendanceRate < 75) {
      riskScore += 20;
    } else if (attendanceRate < 85) {
      riskScore += 10;
    }

    // Academic performance risk
    if (averageScore < 40) {
      riskScore += 40;
    } else if (averageScore < 50) {
      riskScore += 30;
    } else if (averageScore < 60) {
      riskScore += 20;
    } else if (averageScore < 70) {
      riskScore += 10;
    }

    // Assignment risk
    if (pendingAssignments.length >= 5) {
      riskScore += 20;
    } else if (pendingAssignments.length >= 3) {
      riskScore += 15;
    } else if (pendingAssignments.length >= 1) {
      riskScore += 5;
    }

    // Never exceed 100
    riskScore = Math.min(riskScore, 100);

    // If an actual AI risk analysis exists, use it
    if (latestRiskAnalysis?.riskScore !== null &&
        latestRiskAnalysis?.riskScore !== undefined) {
      riskScore = latestRiskAnalysis.riskScore;
    }

    // ─────────────────────────────────────────────
    // RISK LEVEL
    // ─────────────────────────────────────────────

    let riskLevel: "LOW" | "MEDIUM" | "HIGH";

    if (riskScore >= 70) {
      riskLevel = "HIGH";
    } else if (riskScore >= 40) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    // ─────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────

    return NextResponse.json({
      success: true,

      student: {
        id: student.id,
        userId: student.user.id,
        name: student.user.name,
        email: student.user.email,
        role: student.user.role,
        status: student.user.status,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester,
        year: student.year,
      },

      summary: {
        attendance: attendanceRate,
        totalAttendance,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        excused: excusedCount,

        courses: courses.length,

        assignments: assignments.length,
        pendingAssignments: pendingAssignments.length,

        averageScore,

        exams: examResults.length,

        aiRiskScore: riskScore,
        aiRiskLevel: riskLevel,
      },

      courses,

      attendance: {
        rate: attendanceRate,
        total: totalAttendance,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        excused: excusedCount,
      },

      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxMarks: assignment.maxMarks,

        course: assignment.course,

        submission:
          assignment.submissions.length > 0
            ? assignment.submissions[0]
            : null,
      })),

      grades: grades.map((grade) => ({
        id: grade.id,
        score: grade.score,
        grade: grade.grade,
        semester: grade.semester,
        remarks: grade.remarks,
        course: grade.course,
      })),

      exams: examResults,

      ai: {
        riskScore,
        riskLevel,
        analysis: latestRiskAnalysis
          ? {
              overallScore: latestRiskAnalysis.overallScore,
              attendanceRate: latestRiskAnalysis.attendanceRate,
              weakSubjects: latestRiskAnalysis.weakSubjects,
              summary: latestRiskAnalysis.summary,
              createdAt: latestRiskAnalysis.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Student dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load student dashboard",
      },
      { status: 500 }
    );
  }
}