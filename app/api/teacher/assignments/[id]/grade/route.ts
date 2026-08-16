import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type GradeBody = {
  submissionId?: string;
  marks?: number;
  feedback?: string;
};

export async function POST(
  request: Request,
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

    const body = (await request.json()) as GradeBody;

    const submissionId = body.submissionId?.trim();
    const marks = body.marks;
    const feedback = body.feedback?.trim() || null;

    if (!submissionId || marks === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "submissionId and marks are required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(marks) || marks < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Marks must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        id: true,
        title: true,
        maxMarks: true,
        teacherId: true,
        course: {
          select: {
            teacherId: true,
            code: true,
            name: true,
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

    if (marks > assignment.maxMarks) {
      return NextResponse.json(
        {
          success: false,
          message: `Marks cannot exceed ${assignment.maxMarks}.`,
        },
        { status: 400 }
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

    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId,
      },
      select: {
        id: true,
        assignmentId: true,
        studentId: true,
        status: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission not found.",
        },
        { status: 404 }
      );
    }

    if (submission.assignmentId !== assignment.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission does not belong to this assignment.",
        },
        { status: 400 }
      );
    }

    const updatedSubmission = await prisma.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        marks,
        feedback,
        status: "GRADED",
      },
      select: {
        id: true,
        assignmentId: true,
        studentId: true,
        marks: true,
        feedback: true,
        status: true,
        submittedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment graded successfully.",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Teacher grading error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to grade assignment.",
      },
      { status: 500 }
    );
  }
}