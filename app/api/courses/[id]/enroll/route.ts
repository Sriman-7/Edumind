import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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
          message: "Please sign in to enroll in a course.",
        },
        { status: 401 }
      );
    }

    if (auth.role !== "STUDENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only students can enroll in courses.",
        },
        { status: 403 }
      );
    }

    const { id: courseId } = await context.params;

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required.",
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
        semester: true,
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

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        code: true,
        name: true,
        semester: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found.",
        },
        { status: 404 }
      );
    }

    if (
      course.semester !== null &&
      student.semester !== null &&
      course.semester !== student.semester
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `This course is for Semester ${course.semester}.`,
        },
        { status: 400 }
      );
    }

    const existingEnrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
      });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        message: `You are already enrolled in ${course.name}.`,
        enrollment: existingEnrollment,
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        semester: course.semester ?? student.semester,
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
    });

    return NextResponse.json(
      {
        success: true,
        alreadyEnrolled: false,
        message: `Successfully enrolled in ${course.name}.`,
        enrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course enrollment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete enrollment.",
      },
      { status: 500 }
    );
  }
}