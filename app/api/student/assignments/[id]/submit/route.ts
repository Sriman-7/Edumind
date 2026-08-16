import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type SubmitBody = {
  content?: string;
  fileUrl?: string;
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
          message: "Please sign in first.",
        },
        { status: 401 }
      );
    }

    if (auth.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only students can submit assignments.",
        },
        { status: 403 }
      );
    }

    const { id: assignmentId } = await context.params;

    if (!assignmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment ID is required.",
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as SubmitBody;

    const content = body.content?.trim() || null;
    const fileUrl = body.fileUrl?.trim() || null;

    if (!content && !fileUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide submission content or a file URL.",
        },
        { status: 400 }
      );
    }

    const student = await prisma.studentProfile.findUnique({
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

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
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

    const now = new Date();

    const isLate = now > assignment.dueDate;

    const submission =
      await prisma.submission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId: student.id,
          },
        },

        update: {
          content,
          fileUrl,
          submittedAt: now,
          status: isLate ? "LATE" : "SUBMITTED",
        },

        create: {
          assignmentId,
          studentId: student.id,
          content,
          fileUrl,
          submittedAt: now,
          status: isLate ? "LATE" : "SUBMITTED",
        },

        select: {
          id: true,
          assignmentId: true,
          studentId: true,
          content: true,
          fileUrl: true,
          submittedAt: true,
          status: true,
          marks: true,
          feedback: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: isLate
        ? "Assignment submitted late."
        : "Assignment submitted successfully.",
      submission,
    });
  } catch (error) {
    console.error("Assignment submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit assignment.",
      },
      { status: 500 }
    );
  }
}