import bcrypt from "bcrypt";
const password = "arjun123";

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});

//API's

//http://localhost:5000/api/auth/login - teacher - integrated
//http://localhost:5000/api/auth/register - teacher - integrated
//http://localhost:5000/api/users/students - integrated
//http://localhost:5000/api/domains - integrated
//http://localhost:5000/api/users/teachers
//http://localhost:5000/api/exam/listOfExams
//http://localhost:5000/api/exam/create - exam
//http://localhost:5000/api/exam/student/current - students exam