import {
  createExamRepo,
  assignStudentsRepo,
  addQuestionsRepo,
  getExamsForStudent,
  getExamListRepo,
  getExamQuestionsRepo,
  getQuestionOptionsRepo,
  getStudentExamRepo,
  deleteExamRepo,
  updateExamRepo
} from "./exam.repository.js";
import { createExamService,getExamQuestionsService, deleteExamService, updateExamService, getStudentExamService, submitExamService  } from "./exam.service.js";

export const submitExam = async (req, res) => {
  const result = await submitExamService(req.body, req.user.id);

  if (result.success === false) {
    return res.status(409).json({
      error: result.message,
    });
  }

  return res.status(200).json(result);
};

export const getExamQuestions =
  async (
    req,
    res
  ) => {

    try {

      const result =
        await getExamQuestionsService(
          req.params.examId
        );

      res
        .status(200)
        .json(result);

    } catch (err) {

      console.error(
        err
      );

      res
        .status(400)
        .json({
          error:
            err.message,
        });
    }
  };

export const getMyExam = async (req, res) => {
  try {
    const exam = await getStudentExamRepo(req.user.id);

    if (!exam) {
      return res.status(404).json({
        error: "No exam assigned",
      });
    }

    const questions = await getExamQuestionsRepo(
      exam.exam_id
    );

    const finalQuestions = [];

    for (const question of questions) {
      const options = await getQuestionOptionsRepo(
        question.question_id
      );

      finalQuestions.push({
        ...question,
        options,
      });
    }

    res.json({
      exam,
      questions: finalQuestions,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};


// export const getExamQuestions = async (req, res) => {
//   try {
//     const { exam_id } = req.body;

//     const questions = await getExamQuestionsRepo(exam_id);

//     const finalQuestions = [];

//     for (const question of questions) {
//       const options = await getQuestionOptionsRepo(
//         question.question_id
//       );

//       finalQuestions.push({
//         ...question,
//         options,
//       });
//     }

//     res.json(finalQuestions);
//   } catch (err) {
//     console.error(err);

//     res.status(500).json({
//       error: err.message,
//     });
//   }
// };


export const createExam = async (
  req,
  res
) => {
  try {
    const result =
      await createExamService(
        req.body,
        req.user.id
      );

    res.status(201).json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const deleteExam =
  async (req, res) => {

    try {

      const result =
        await deleteExamRepo(
          req.params.examId,
          req.user.id
        );

      res.json(result);

    } catch (err) {

      res.status(400).json({
        error: err.message,
      });
    }
  };

  export const updateExam = async (req, res) => {
  try {

    const result =
      await updateExamService(
        req.params.examId,
        req.body,
        req.user.id
      );

    res.status(200).json(result);

  } catch (err) {

    console.error(err);

    res.status(400).json({
      error: err.message,
    });
  }
};

export const getExamList = async (req, res) => {
  try {
    const exams = await getExamListRepo(req.user.id);

    res.json(exams);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const assignStudents = async (req, res) => {
  const { examId, students } = req.body;
  await assignStudentsRepo(examId, students);
  res.json({ message: "Assigned" });
};

export const addQuestions = async (req, res) => {
  const { examId, questions } = req.body;
  await addQuestionsRepo(examId, questions);
  res.json({ message: "Questions added" });
};

export const myExams = async (req, res) => {
  const exams = await getExamsForStudent(req.user.id);
  res.json(exams);
};

export const getStudentExam = async (
  req,
  res
) => {

  try {

    const result =
      await getStudentExamService(
        req.user.id
      );

    res.status(200).json(result);

  } catch (err) {

    console.error(err);

    res.status(400).json({
      error: err.message,
    });
  }
};