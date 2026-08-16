import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
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

    if (auth.role !== "TEACHER") {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher access required",
        },
        { status: 403 }
      );
    }

    const teacher = await prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,

        teacherProfile: {
          select: {
            employeeId: true,
            department: true,
          },
        },

        coursesTaught: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true,
            department: true,
            semester: true,

            enrollments: {
              select: {
                student: {
                  select: {
                    id: true,
                    rollNumber: true,
                    user: {
                      select: {
                        name: true,
                        email: true,
                      },
                    },

                    attendanceRecords: {
                      select: {
                        status: true,
                      },
                    },

                    grades: {
                      select: {
                        score: true,
                        courseId: true,
                      },
                    },

                    submissions: {
                      select: {
                        status: true,
                      },
                    },
                  },
                },
              },
            },

            assignments: {
              select: {
                id: true,
                title: true,
                dueDate: true,
              },
            },

            exams: {
              select: {
                id: true,
                title: true,
                examDate: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher not found",
        },
        { status: 404 }
      );
    }

    const studentMap = new Map<
      string,
      {
        id: string;
        rollNumber: string;
        name: string;
        email: string;
        attendance: number;
        averageScore: number;
        riskScore: number;
        riskLevel: "LOW" | "MEDIUM" | "HIGH";
      }
    >();

    for (const course of teacher.coursesTaught) {
      for (const enrollment of course.enrollments) {
        const student = enrollment.student;

        if (studentMap.has(student.id)) {
          continue;
        }

        const attendance = student.attendanceRecords;

        const totalAttendance = attendance.length;

        const present = attendance.filter(
          (record) => record.status === "PRESENT"
        ).length;

        const late = attendance.filter(
          (record) => record.status === "LATE"
        ).length;

        const attendanceRate =
          totalAttendance > 0
            ? Math.round(
                ((present + late * 0.5) /
                  totalAttendance) *
                  100
              )
            : 0;

        const grades = student.grades;

        const averageScore =
          grades.length > 0
            ? Number(
                (
                  grades.reduce(
                    (sum, grade) => sum + grade.score,
                    0
                  ) / grades.length
                ).toFixed(2)
              )
            : 0;

        const submissions = student.submissions;

        const completedAssignments =
          submissions.filter(
            (submission) =>
              submission.status === "SUBMITTED" ||
              submission.status === "GRADED"
          ).length;

        const assignmentCompletion =
          submissions.length > 0
            ? (completedAssignments /
                submissions.length) *
              100
            : 100;

        const rawRisk =
          100 -
          averageScore * 0.45 -
          attendanceRate * 0.3 -
          assignmentCompletion * 0.25;

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

        studentMap.set(student.id, {
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.user.name,
          email: student.user.email,
          attendance: attendanceRate,
          averageScore,
          riskScore,
          riskLevel,
        });
      }
    }

    const students = Array.from(studentMap.values()).sort(
      (a, b) => b.riskScore - a.riskScore
    );

    const highRisk = students.filter(
      (student) => student.riskLevel === "HIGH"
    ).length;

    const mediumRisk = students.filter(
      (student) => student.riskLevel === "MEDIUM"
    ).length;

    const lowRisk = students.filter(
      (student) => student.riskLevel === "LOW"
    ).length;

    const totalStudents = students.length;

    const averageAttendance =
      totalStudents > 0
        ? Number(
            (
              students.reduce(
                (sum, student) =>
                  sum + student.attendance,
                0
              ) / totalStudents
            ).toFixed(2)
          )
        : 0;

    const averagePerformance =
      totalStudents > 0
        ? Number(
            (
              students.reduce(
                (sum, student) =>
                  sum + student.averageScore,
                0
              ) / totalStudents
            ).toFixed(2)
          )
        : 0;

    const totalAssignments =
      teacher.coursesTaught.reduce(
        (sum, course) =>
          sum + course.assignments.length,
        0
      );

    const totalExams =
      teacher.coursesTaught.reduce(
        (sum, course) =>
          sum + course.exams.length,
        0
      );

    return NextResponse.json({
      success: true,

      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        status: teacher.status,
        employeeId:
          teacher.teacherProfile?.employeeId ?? null,
        department:
          teacher.teacherProfile?.department ?? null,
      },

      summary: {
        totalStudents,
        totalCourses: teacher.coursesTaught.length,
        totalAssignments,
        totalExams,

        averageAttendance,
        averagePerformance,

        highRisk,
        mediumRisk,
        lowRisk,
      },

      courses: teacher.coursesTaught.map((course) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        department: course.department,
        semester: course.semester,
        studentCount: course.enrollments.length,
        assignmentCount: course.assignments.length,
        examCount: course.exams.length,
      })),

      students,
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load teacher dashboard",
      },
      { status: 500 }
    );
  }
}