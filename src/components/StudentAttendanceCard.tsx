import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  let attendance: Array<{ present: boolean }> = [];
  try {
    attendance = (await prisma.attendance.findMany({
      where: {
        studentId: id,
        date: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
      select: { present: true },
    })) as any;
  } catch (err) {
    // Allows Vercel build to succeed even if DB isn't reachable during build
    console.error("StudentAttendanceCard findMany failed:", err);
    attendance = [];
  }

  const totalDays = attendance.length;
  const presentDays = attendance.filter((day) => day.present).length;
  const percentage = (presentDays / totalDays) * 100;
  return (
    <div className="">
      <h1 className="text-xl font-semibold">{percentage || "-"}%</h1>
      <span className="text-sm text-gray-400">Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
