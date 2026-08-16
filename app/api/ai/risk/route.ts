import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Get logged-in user
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

    // 2. Only students can use this API
    if (auth.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Student access required",
        },
        { status: 403 }
      );
    }

    // 3. Find student profile
    const student = await prisma.studentProfile.findUnique({
      where: {
        userId: auth.userId,
      },
      include: {
        attendanceRecords: true,
        grades: {
          include: {
            course: true,
          },
        },
        submissions: true,
        examResults: true,
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

    // ─────────────────────────────────────────
    // ATTENDANCE
    // ─────────────────────────────────────────

    const attendance = student.attendanceRecords;

    const totalAttendance = attendance.length;

    const present = attendance.filter(
      (record) => record.status === "PRESENT"
    ).length;

    const late = attendance.filter(
      (record) => record.status === "LATE"
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "ABSENT"
    ).length;

    const excused = attendance.filter(
      (record) => record.status === "EXCUSED"
    ).length;

    const attendanceRate =
      totalAttendance > 0
        ? ((present + late * 0.5) / totalAttendance) * 100
        : 0;

    // ─────────────────────────────────────────
    // ACADEMIC PERFORMANCE
    // ─────────────────────────────────────────

    const grades = student.grades;

    const averageScore =
      grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade.score, 0) /
          grades.length
        : 0;

    // ─────────────────────────────────────────
    // ASSIGNMENTS
    // ─────────────────────────────────────────

    const submissions = student.submissions;

    const totalAssignments = submissions.length;

    const completedAssignments = submissions.filter(
      (submission) =>
        submission.status === "SUBMITTED" ||
        submission.status === "GRADED"
    ).length;

    const pendingAssignments = submissions.filter(
      (submission) => submission.status === "PENDING"
    ).length;

    const assignmentCompletionRate =
      totalAssignments > 0
        ? (completedAssignments / totalAssignments) * 100
        : 100;

    // ─────────────────────────────────────────
    // EXAM PERFORMANCE
    // ─────────────────────────────────────────

    const exams = student.examResults;

    const averageExamScore =
      exams.length > 0
        ? exams.reduce((sum, exam) => sum + exam.marks, 0) /
          exams.length
        : averageScore;

    // ─────────────────────────────────────────
    // AI RISK CALCULATION
    // ─────────────────────────────────────────

    let riskScore = 0;

    // Attendance risk
    if (attendanceRate < 50) {
      riskScore += 35;
    } else if (attendanceRate < 65) {
      riskScore += 25;
    } else if (attendanceRate < 75) {
      riskScore += 15;
    } else if (attendanceRate < 85) {
      riskScore += 8;
    }

    // Academic performance risk
    if (averageScore < 40) {
      riskScore += 35;
    } else if (averageScore < 50) {
      riskScore += 28;
    } else if (averageScore < 60) {
      riskScore += 20;
    } else if (averageScore < 70) {
      riskScore += 12;
    } else if (averageScore < 80) {
      riskScore += 6;
    }

    // Assignment completion risk
    if (assignmentCompletionRate < 50) {
      riskScore += 20;
    } else if (assignmentCompletionRate < 70) {
      riskScore += 12;
    } else if (assignmentCompletionRate < 85) {
      riskScore += 6;
    }

    // Exam risk
    if (averageExamScore < 40) {
      riskScore += 10;
    } else if (averageExamScore < 60) {
      riskScore += 7;
    } else if (averageExamScore < 75) {
      riskScore += 3;
    }

    // Keep score between 0 and 100
    riskScore = Math.min(100, Math.max(0, Math.round(riskScore)));

    // ─────────────────────────────────────────
    // RISK LEVEL
    // ─────────────────────────────────────────

    let riskLevel: "LOW" | "MEDIUM" | "HIGH";

    if (riskScore >= 60) {
      riskLevel = "HIGH";
    } else if (riskScore >= 30) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    // ─────────────────────────────────────────
    // WEAK SUBJECTS
    // ─────────────────────────────────────────

    const weakSubjects = grades
      .filter((grade) => grade.score < 70)
      .map((grade) => ({
        course: grade.course.name,
        code: grade.course.code,
        score: grade.score,
      }));

    // ─────────────────────────────────────────
    // AI SUMMARY
    // ─────────────────────────────────────────

    let summary = "";

    if (riskLevel === "LOW") {
      summary =
        "Student is performing well academically with good attendance and consistent academic progress.";
    } else if (riskLevel === "MEDIUM") {
      summary =
        "Student shows moderate academic risk. Improving attendance, assignments and weaker subjects can improve performance.";
    } else {
      summary =
        "Student is at high academic risk. Immediate attention is recommended for attendance, assignments and academic performance.";
    }

    // ─────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────

    return NextResponse.json({
      success: true,

      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester,
        year: student.year,
      },

      analysis: {
        riskScore,
        riskLevel,

        attendanceRate: Number(attendanceRate.toFixed(2)),

        averageScore: Number(averageScore.toFixed(2)),

        assignmentCompletionRate: Number(
          assignmentCompletionRate.toFixed(2)
        ),

        averageExamScore: Number(
          averageExamScore.toFixed(2)
        ),

        weakSubjects,

        summary,
      },
    });
  } catch (error) {
    console.error("AI risk calculation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to calculate AI risk",
      },
      { status: 500 }
    );
  }
}