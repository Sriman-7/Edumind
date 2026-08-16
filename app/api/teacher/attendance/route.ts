import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type AttendanceBody = {
  classId?: string;
  studentId?: string;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  date?: string;
  remarks?: string;
};

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const classId = url.searchParams.get("classId");

    const classes = await prisma.class.findMany({
      where: {
        OR: [
          { teacherId: auth.userId },
          {
            course: {
              teacherId: auth.userId,
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        section: true,
        room: true,
        schedule: true,
        courseId: true,
        course: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!classId) {
      return NextResponse.json({
        success: true,
        classes,
        students: [],
      });
    }

    const selectedClass = classes.find(
      (item) => item.id === classId
    );

    if (!selectedClass) {
      return NextResponse.json(
        {
          success: false,
          message: "Class not found or access denied.",
        },
        { status: 404 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: selectedClass.courseId,
      },
      orderBy: {
        student: {
          rollNumber: "asc",
        },
      },
      select: {
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
    });

    const attendanceDate = new Date();

    const dateStart = new Date(
      attendanceDate.getFullYear(),
      attendanceDate.getMonth(),
      attendanceDate.getDate()
    );

    const attendance = await prisma.attendance.findMany({
      where: {
        classId,
        date: dateStart,
      },
      select: {
        studentId: true,
        status: true,
        remarks: true,
      },
    });

    return NextResponse.json({
      success: true,
      classes,
      students: enrollments.map((item) => {
        const record = attendance.find(
          (entry) => entry.studentId === item.student.id
        );

        return {
          ...item.student,
          attendanceStatus: record?.status ?? null,
          attendanceRemarks: record?.remarks ?? null,
        };
      }),
    });
  } catch (error) {
    console.error("Teacher attendance GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load attendance data.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = (await request.json()) as AttendanceBody;

    const classId = body.classId?.trim();
    const studentId = body.studentId?.trim();
    const status = body.status;
    const remarks = body.remarks?.trim() || null;

    if (!classId || !studentId || !status) {
      return NextResponse.json(
        {
          success: false,
          message:
            "classId, studentId and attendance status are required.",
        },
        { status: 400 }
      );
    }

    const attendanceDate = body.date
      ? new Date(body.date)
      : new Date();

    if (Number.isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid attendance date.",
        },
        { status: 400 }
      );
    }

    const classRecord = await prisma.class.findUnique({
      where: {
        id: classId,
      },
      select: {
        id: true,
        courseId: true,
        teacherId: true,
        course: {
          select: {
            teacherId: true,
          },
        },
      },
    });

    if (!classRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Class not found.",
        },
        { status: 404 }
      );
    }

    const teacherOwnsClass =
      classRecord.teacherId === auth.userId ||
      classRecord.course.teacherId === auth.userId;

    if (!teacherOwnsClass) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not assigned to this class.",
        },
        { status: 403 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: classRecord.courseId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This student is not enrolled in this course.",
        },
        { status: 400 }
      );
    }

    const date = new Date(
      attendanceDate.getFullYear(),
      attendanceDate.getMonth(),
      attendanceDate.getDate()
    );

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId,
          classId,
          date,
        },
      },
      update: {
        status,
        remarks,
      },
      create: {
        studentId,
        classId,
        date,
        status,
        remarks,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            name: true,
            section: true,
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully.",
      attendance,
    });
  } catch (error) {
    console.error("Teacher attendance error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to record attendance.",
      },
      { status: 500 }
    );
  }
}