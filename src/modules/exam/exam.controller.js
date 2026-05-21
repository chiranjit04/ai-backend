import {
  createExamRepo,
  assignStudentsRepo,
  addQuestionsRepo,
  getExamsForStudent,
  getExamListRepo,
  getExamQuestionsRepo,
  getQuestionOptionsRepo,
  getStudentExamRepo,
} from "./exam.repository.js";

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


export const getExamQuestions = async (req, res) => {
  try {
    const { exam_id } = req.body;

    const questions = await getExamQuestionsRepo(exam_id);

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

    res.json(finalQuestions);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};


export const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      duration_minutes,
      total_marks,
      passing_marks,
      start_time,
      end_time,
      domain_id,

      allow_late_entry_minutes,
      allow_pause_resume,
      attempt_limit,
      auto_submit_on_timeup,

      is_published,
      negative_marking,
      partial_marking_enabled,

      randomize_options,
      randomize_questions,

      status,
    } = req.body;

    const [result] = await db.execute(
      `
      INSERT INTO exams (
        title,
        description,
        duration_minutes,
        total_marks,
        passing_marks,
        start_time,
        end_time,
        domain_id,

        allow_late_entry_minutes,
        allow_pause_resume,
        attempt_limit,
        auto_submit_on_timeup,

        is_published,
        negative_marking,
        partial_marking_enabled,

        randomize_options,
        randomize_questions,

        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        duration_minutes,
        total_marks,
        passing_marks,
        start_time,
        end_time,
        domain_id,

        allow_late_entry_minutes,
        allow_pause_resume,
        attempt_limit,
        auto_submit_on_timeup,

        is_published,
        negative_marking,
        partial_marking_enabled,

        randomize_options,
        randomize_questions,

        status,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Exam created successfully",
      exam_id: result.insertId,
    });
  } catch (err) {
    console.error("CREATE EXAM ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getExamList = async (req, res) => {
  try {
    const exams = await getExamListRepo();

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