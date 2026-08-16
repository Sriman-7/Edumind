import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const auth = await getCurrentUser();

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    if (auth.role !== "TEACHER") {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher access required.",
        },
        { status: 403 }
      );
    }

    const { id: assignmentId } = await context.params;

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        maxMarks: true,
        teacherId: true,

        course: {
          select: {
            id: true,
            code: true,
            name: true,
            teacherId: true,
          },
        },

        submissions: {
          orderBy: {
            submittedAt: "desc",
          },
          select: {
            id: true,
            studentId: true,
            submittedAt: true,
            content: true,
            fileUrl: true,
            marks: true,
            feedback: true,
            status: true,

            student: {
              select: {
                id: true,
                rollNumber: true,
                department: true,
                semester: true,

                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found.",
        },
        { status: 404 }
      );
    }

    const teacherOwnsAssignment =
      assignment.teacherId === auth.userId ||
      assignment.course.teacherId === auth.userId;

    if (!teacherOwnsAssignment) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not assigned to this assignment.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        teacherId: undefined,
        course: {
          id: assignment.course.id,
          code: assignment.course.code,
          name: assignment.course.name,
        },
      },
    });
  } catch (error) {
    console.error("Teacher assignment API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load assignment.",
      },
      { status: 500 }
    );
  }
}