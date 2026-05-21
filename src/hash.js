import bcrypt from "bcrypt";

const password = "admin123";

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});

//API's

//http://localhost:5000/api/auth/login - teacher
//http://localhost:5000/api/auth/register - teacher
//http://localhost:5000/api/users/students - 
//http://localhost:5000/api/question/create
//http://localhost:5000/api/domains
//http://localhost:5000/api/users/teachers
//http://localhost:5000/api/exam/listOfExams