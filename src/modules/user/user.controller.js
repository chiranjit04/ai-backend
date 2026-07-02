import { getStudentsByTeacher, getTeachersRepo, deleteStudentService } from "./user.repository.js";

export const deleteStudent =
  async (
    req,
    res
  ) => {

    try {

      const result =
        await deleteStudentService(
          req.params.id
        );

      res.status(200).json(
        result
      );

    } catch (err) {

      res.status(500).json({
        error:
          err.message,
      });
    }
  };

export const getMyStudents = async (req, res) => {
  try {
    const students = await getStudentsByTeacher(req.user.id);

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await getTeachersRepo();

    res.json(teachers);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};