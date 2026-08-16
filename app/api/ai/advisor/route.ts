import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Recommendation = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  action: string;
};

export async function GET() {
  try {
    const auth = await getCurrentUser();

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (auth.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Student access required" },
        { status: 403 }
      );
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: auth.userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        grades: {
          include: {
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        attendanceRecords: {
          select: {
            status: true,
          },
        },
        enrollments: {
          include: {
            course: {
              include: {
                assignments: {
                  select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    maxMarks: true,
                    courseId: true,
                    course: {
                      select: {
                        code: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        submissions: {
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                dueDate: true,
                maxMarks: true,
                course: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        examResults: {
          include: {
            exam: {
              select: {
                title: true,
                totalMarks: true,
                course: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student profile not found" },
        { status: 404 }
      );
    }

    const grades = student.grades;
    const attendance = student.attendanceRecords;
    const submissions = student.submissions;
    const examResults = student.examResults;

    const averageScore =
      grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade.score, 0) /
          grades.length
        : 0;

    const present = attendance.filter(
      (record) => record.status === "PRESENT"
    ).length;

    const late = attendance.filter(
      (record) => record.status === "LATE"
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "ABSENT"
    ).length;

    const attendanceRate =
      attendance.length > 0
        ? Math.round(
            ((present + late) / attendance.length) * 100
          )
        : 0;

    const allAssignments = student.enrollments.flatMap(
      (enrollment) => enrollment.course.assignments
    );

    const totalAssignments = allAssignments.length;
    const completedAssignmentIds = new Set(
      submissions
        .filter(
          (submission) =>
            submission.status === "SUBMITTED" ||
            submission.status === "GRADED"
        )
        .map((submission) => submission.assignmentId)
    );

    const completedAssignments = allAssignments.filter((assignment) =>
      completedAssignmentIds.has(assignment.id)
    ).length;

    const assignmentCompletionRate =
      totalAssignments > 0
        ? Math.round(
            (completedAssignments / totalAssignments) * 100
          )
        : 0;

    const averageExamScore =
      examResults.length > 0
        ? Math.round(
            examResults.reduce(
              (sum, result) =>
                sum +
                (result.exam.totalMarks > 0
                  ? (result.marks / result.exam.totalMarks) * 100
                  : 0),
              0
            ) / examResults.length
          )
        : 0;

    const weakSubjects = grades
      .filter((grade) => grade.score < 75)
      .sort((a, b) => a.score - b.score)
      .map(
        (grade) =>
          `${grade.course.name} (${Math.round(grade.score)}%)`
      );

    const strengths = grades
      .filter((grade) => grade.score >= 85)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(
        (grade) =>
          `${grade.course.name} (${Math.round(grade.score)}%)`
      );

    const recommendations: Recommendation[] = [];

    if (attendanceRate < 75) {
      recommendations.push({
        priority: "HIGH",
        title: "Improve attendance immediately",
        message: `Your attendance is ${attendanceRate}%. Missing more classes may increase academic risk.`,
        action: "Aim for at least 85% attendance from now on.",
      });
    } else if (attendanceRate < 85) {
      recommendations.push({
        priority: "MEDIUM",
        title: "Maintain stronger attendance",
        message: `Your attendance is ${attendanceRate}%. You are doing reasonably well, but there is room for improvement.`,
        action: "Target 90%+ attendance for the upcoming classes.",
      });
    } else {
      recommendations.push({
        priority: "LOW",
        title: "Keep your attendance strong",
        message: `Your ${attendanceRate}% attendance is supporting your academic performance.`,
        action: "Continue attending classes consistently.",
      });
    }

    if (weakSubjects.length > 0) {
      recommendations.push({
        priority: "HIGH",
        title: "Focus on your weakest subject",
        message: `${weakSubjects[0]} is currently your lowest-performing area.`,
        action: "Schedule two focused revision sessions this week.",
      });
    }

    const now = new Date();

    const pendingAssignments = allAssignments
      .filter((assignment) => !completedAssignmentIds.has(assignment.id))
      .filter((assignment) => new Date(assignment.dueDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime()
      );

    if (pendingAssignments.length > 0) {
      const next = pendingAssignments[0];

      recommendations.push({
        priority: "HIGH",
        title: "Complete your next assignment",
        message: `"${next.title}" is the next pending deadline.`,
        action: `Complete ${next.course.code} before ${new Date(
          next.dueDate
        ).toLocaleDateString("en-IN")}.`,
      });
    } else if (assignmentCompletionRate < 100) {
      recommendations.push({
        priority: "MEDIUM",
        title: "Finish remaining assignments",
        message: `Your assignment completion is ${assignmentCompletionRate}%.`,
        action: "Clear all remaining submissions before their deadlines.",
      });
    }

    if (averageScore < 70) {
      recommendations.push({
        priority: "HIGH",
        title: "Raise your overall academic score",
        message: `Your current average is ${averageScore.toFixed(1)}%.`,
        action: "Create a weekly revision plan around your weakest subjects.",
      });
    } else if (averageScore < 85) {
      recommendations.push({
        priority: "MEDIUM",
        title: "Push your average higher",
        message: `Your current average is ${averageScore.toFixed(1)}%.`,
        action: "Use targeted revision to move your average above 85%.",
      });
    } else {
      recommendations.push({
        priority: "LOW",
        title: "Maintain your academic momentum",
        message: `Your current average is ${averageScore.toFixed(1)}%, which is strong.`,
        action: "Keep the same study consistency and prepare early for exams.",
      });
    }

    if (examResults.length > 0 && averageExamScore < 75) {
      recommendations.push({
        priority: "HIGH",
        title: "Prepare more for examinations",
        message: `Your average exam performance is ${averageExamScore}%.`,
        action: "Practice previous questions and revise weak concepts.",
      });
    }

    const rawRisk =
      100 -
      averageScore * 0.45 -
      attendanceRate * 0.3 -
      assignmentCompletionRate * 0.15 -
      averageExamScore * 0.1;

    const riskScore = Math.max(
      0,
      Math.min(100, Math.round(rawRisk))
    );

    const riskLevel =
      riskScore >= 60
        ? "HIGH"
        : riskScore >= 30
          ? "MEDIUM"
          : "LOW";

    const prediction =
      averageScore >= 85 &&
      attendanceRate >= 85 &&
      assignmentCompletionRate >= 80
        ? "88–92%"
        : averageScore >= 75
          ? "80–87%"
          : "70–79%";

    const summary =
      riskLevel === "LOW"
        ? `You are performing well overall with a ${Math.round(
            averageScore
          )}% average and ${attendanceRate}% attendance. Keep your current consistency and focus on upcoming deadlines.`
        : riskLevel === "MEDIUM"
          ? `Your overall performance is stable, but some areas need attention. Focus on attendance, assignments and your weaker subjects to reduce academic risk.`
          : `Your current academic indicators show elevated risk. Prioritize attendance, pending assignments and weak subjects immediately.`;

    return NextResponse.json({
      success: true,
      advisor: {
        student: {
          name: student.user.name,
          rollNumber: student.rollNumber,
        },
        summary,
        riskScore,
        riskLevel,
        prediction,
        metrics: {
          attendanceRate,
          averageScore: Number(averageScore.toFixed(2)),
          assignmentCompletionRate,
          averageExamScore,
          present,
          late,
          absent,
        },
        strengths,
        weakSubjects,
        recommendations: recommendations.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("AI advisor error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate AI academic advice",
      },
      { status: 500 }
    );
  }
}