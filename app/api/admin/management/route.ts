import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type CreateCourseBody = {
  code?: string;
  name?: string;
  description?: string;
  credits?: number;
  department?: string;
  semester?: number;
};

type UpdateUserBody = {
  userId?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

async function requireAdmin() {
  const auth = await getCurrentUser();

  if (!auth) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      ),
    };
  }

  if (auth.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      ),
    };
  }

  return { auth };
}

export async function GET() {
  try {
    const authCheck = await requireAdmin();

    if (authCheck.error) {
      return authCheck.error;
    }

    const [
      students,
      teachers,
      courses,
      classes,
      assignments,
      exams,
      grades,
    ] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: "STUDENT",
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          studentProfile: {
            select: {
              rollNumber: true,
              department: true,
              semester: true,
            },
          },
        },
      }),

      prisma.user.findMany({
        where: {
          role: "TEACHER",
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          teacherProfile: {
            select: {
              employeeId: true,
              department: true,
            },
          },
        },
      }),

      prisma.course.findMany({
        orderBy: {
          code: "asc",
        },
        select: {
          id: true,
          code: true,
          name: true,
          department: true,
          semester: true,
          credits: true,
          teacher: {
            select: {
              name: true,
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
      }),

      prisma.class.findMany({
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          section: true,
          room: true,
          schedule: true,
          course: {
            select: {
              code: true,
              name: true,
            },
          },
          teacher: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.assignment.findMany({
        orderBy: {
          dueDate: "asc",
        },
        take: 20,
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
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      }),

      prisma.exam.findMany({
        orderBy: {
          examDate: "asc",
        },
        take: 20,
        select: {
          id: true,
          title: true,
          examDate: true,
          duration: true,
          totalMarks: true,
          course: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),

      prisma.grade.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          score: true,
          grade: true,
          semester: true,
          student: {
            select: {
              rollNumber: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          course: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      students,
      teachers,
      courses,
      classes,
      assignments,
      exams,
      grades,
    });
  } catch (error) {
    console.error("Admin management GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load management data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAdmin();

    if (authCheck.error) {
      return authCheck.error;
    }

    const body = (await request.json()) as CreateCourseBody;

    const code = body.code?.trim();
    const name = body.name?.trim();

    if (!code || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Course code and name are required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.course.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "A course with this code already exists.",
        },
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description: body.description?.trim() || null,
        credits: Number.isFinite(body.credits)
          ? body.credits
          : null,
        department: body.department?.trim() || null,
        semester: Number.isFinite(body.semester)
          ? body.semester
          : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully.",
        course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin course creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create course.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authCheck = await requireAdmin();

    if (authCheck.error) {
      return authCheck.error;
    }

    const body = (await request.json()) as UpdateUserBody;

    const userId = body.userId?.trim();
    const status = body.status;

    if (!userId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "userId and status are required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User status updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Admin user update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update user.",
      },
      { status: 500 }
    );
  }
}