import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const department =
      searchParams.get("department")?.trim() || "";
    const semesterParam =
      searchParams.get("semester")?.trim() || "";

    const semester =
      semesterParam && semesterParam !== "all"
        ? Number(semesterParam)
        : undefined;

    const courses = await prisma.course.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  code: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(department && department !== "all"
          ? {
              department: {
                equals: department,
                mode: "insensitive",
              },
            }
          : {}),

        ...(semester !== undefined &&
        !Number.isNaN(semester)
          ? {
              semester,
            }
          : {}),
      },

      orderBy: [
        {
          name: "asc",
        },
      ],

      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        credits: true,
        department: true,
        semester: true,

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

        _count: {
          select: {
            enrollments: true,
            assignments: true,
            exams: true,
          },
        },
      },
    });

    const departments = await prisma.course.findMany({
      where: {
        department: {
          not: null,
        },
      },
      select: {
        department: true,
      },
      distinct: ["department"],
      orderBy: {
        department: "asc",
      },
    });

    const semesters = await prisma.course.findMany({
      where: {
        semester: {
          not: null,
        },
      },
      select: {
        semester: true,
      },
      distinct: ["semester"],
      orderBy: {
        semester: "asc",
      },
    });

    return NextResponse.json({
      success: true,

      courses,

      filters: {
        departments: departments
          .map((item) => item.department)
          .filter(
            (value): value is string => Boolean(value)
          ),

        semesters: semesters
          .map((item) => item.semester)
          .filter(
            (value): value is number => value !== null
          ),
      },

      total: courses.length,
    });
  } catch (error) {
    console.error("Courses API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load courses",
      },
      { status: 500 }
    );
  }
}