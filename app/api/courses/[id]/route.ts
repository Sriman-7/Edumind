import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Course ID is required",
        },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        credits: true,
        department: true,
        semester: true,
        schedule: true,
        syllabus: true,

        teacher: {
          select: {
            name: true,

            teacherProfile: {
              select: {
                department: true,
              },
            },
          },
        },

        assignments: {
          orderBy: {
            dueDate: "asc",
          },

          select: {
            id: true,
            title: true,
            dueDate: true,
            maxMarks: true,
          },
        },

        exams: {
          orderBy: {
            examDate: "asc",
          },

          select: {
            id: true,
            title: true,
            examDate: true,
            duration: true,
            totalMarks: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Course details API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load course details",
      },
      { status: 500 }
    );
  }
}