import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        try {
          const subjectTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          });
          relatedData = { teachers: subjectTeachers };
        } catch (err) {
          console.error("FormContainer subject teachers load failed:", err);
          relatedData = { teachers: [] };
        }
        break;
      case "class":
        try {
          const classGrades = await prisma.grade.findMany({
            select: { id: true, level: true },
          });
          const classTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          });
          relatedData = { teachers: classTeachers, grades: classGrades };
        } catch (err) {
          console.error("FormContainer class related data load failed:", err);
          relatedData = { teachers: [], grades: [] };
        }
        break;
      case "teacher":
        try {
          const teacherSubjects = await prisma.subject.findMany({
            select: { id: true, name: true },
          });
          relatedData = { subjects: teacherSubjects };
        } catch (err) {
          console.error("FormContainer teacher subjects load failed:", err);
          relatedData = { subjects: [] };
        }
        break;
      case "student":
        try {
          const studentGrades = await prisma.grade.findMany({
            select: { id: true, level: true },
          });
          const studentClasses = await prisma.class.findMany({
            include: { _count: { select: { students: true } } },
          });
          relatedData = { classes: studentClasses, grades: studentGrades };
        } catch (err) {
          console.error("FormContainer student related data load failed:", err);
          relatedData = { classes: [], grades: [] };
        }
        break;
      case "exam":
        try {
          const examLessons = await prisma.lesson.findMany({
            where: {
              ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
            },
            select: { id: true, name: true },
          });
          relatedData = { lessons: examLessons };
        } catch (err) {
          console.error("FormContainer exam lessons load failed:", err);
          relatedData = { lessons: [] };
        }
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
