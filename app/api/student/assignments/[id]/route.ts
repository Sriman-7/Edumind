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

    if (auth.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Student access required.",
        },
        { status: 403 }
      );
    }

    const { id: assignmentId } = await context.params;

    const student =
      await prisma.studentProfile.findUnique({
        where: {
          userId: auth.userId,
        },
        select: {
          id: true,
        },
      });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    const assignment =
      await prisma.assignment.findUnique({
        where: {
          id: assignmentId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          maxMarks: true,

          course: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },

          submissions: {
            where: {
              studentId: student.id,
            },
            select: {
              id: true,
              status: true,
              content: true,
              fileUrl: true,
              submittedAt: true,
              marks: true,
              feedback: true,
            },
            take: 1,
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

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        submission:
          assignment.submissions[0] || null,
      },
    });
  } catch (error) {
    console.error(
      "Assignment details API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load assignment.",
      },
      { status: 500 }
    );
  }
}