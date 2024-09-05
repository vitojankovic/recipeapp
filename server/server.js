const express = require('express');
const app = express()
const cookieParser = require("cookie-parser");
const session = require('express-session');
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require("mysql2")
const jwt = require('jsonwebtoken');



app.set('trust proxy', 1) // trust first proxy


app.use(cookieParser());
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))


const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "7EDs8Gphmysql24816",
  database: "mb_database"
});

// Check database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database');
    return;
  }
  console.log('Connected to the database!');
  connection.release(); // Release the connection
});

// Register part

app.post('/register', (req, res) => {

  const uName = req.body.user_name
  const uMail = req.body.user_mail
  const uPassword = req.body.user_password

  const sqlInsert = "INSERT INTO user (username, usermail, userpassword) VALUES (?, ?, ?)";
  pool.query(sqlInsert, [uName, uMail, uPassword], (err, result) => {
    if (err) {
      console.log(err);
    } else {

      const payload = {
        userId: result.userId,
        userName: uName,
        userMail: uMail,
        userPassword: uPassword
      }
    
      const secretKey = 'hrewjhropwjh4o25pjhtejntewio'; // Replace with your own secret key
      const token = jwt.sign(payload, secretKey); // Create JWT using payload and secret key
      // You can send the user ID back in the response or use it for further processing
      res.json({ token: token });
    }
  });
});

app.post("/login", (req, res) => {

  const logmail = req.body.email;
  const logpass = req.body.password;

  pool.query(
    "SELECT * FROM user WHERE usermail = ? AND userpassword = ?",
    [logmail, logpass],
    (err, result) => {
      if(err){
        res.send(err);
      }
      if(result.length > 0){
        const user = result[0];
        const payload = { 
          userId: user.userid,
          userName: user.username,
          userMail: user.usermail,
          userPassword: user.userpassword,
        }
        const secretKey = '189i6ndhgwbhioywq'; // Replace with your own secret key
        const token = jwt.sign(payload, secretKey);

        res.send({ result: result, token: token });
      }else{
        res.send({message: "Wrong username/password combination!"})
      }
    }
  );
})


app.get('/account/:userid/:username', (req, res) => {

  const user_name = req.params.username;

  const sqlQuery = 'SELECT * FROM user WHERE username = ?';
  pool.query(sqlQuery, [user_name], (err, result) => {
    if (err) {
      console.error(err);
      res.send({ error: 'Error checking account existence' });
    } if (result.length > 0) {
      // Account exists
      res.send({
        exists: true,
        userId: result[0].userid,
        username: result[0].username,
        email: result[0].usermail,
        password: result[0].userpassword
      });
    } else {
      // Account doesn't exist
      res.send({ exists: false });
    }
  });
});


app.get('/LandPage', (req, res) => {
  const token = req.headers.authorization.split('')[1];
})


app.post('/recipe', (req, res) => {


  const recAuthor = req.body.author;
  const recName = req.body.name;
  const recDesc = req.body.description;
  const recTutorial = req.body.tutorial;
  const food = req.body.food;

  const sqlInsert = "INSERT INTO recipe (recipe_author, recipe_name, recipe_description, recipe_tutorial, food) VALUES (?, ?, ?, ?, ?)";
  pool.query(sqlInsert, [recAuthor, recName, recDesc, recTutorial, JSON.stringify(food)], (err, result)=> {
    if (err) {
      console.log(err);
      res.status(500).send("Error occurred while saving the recipe.");
    } else {
      console.log(result);
      res.status(200).send("Recipe saved successfully.");
    }
  });
})



app.get('/recipe/:recipe_name', (req, res) => {


  const recName = req.body.name;
  const recDesc = req.body.description;
  const recTutorial = req.body.tutorial;
  const food = req.body.food;

  const sqlInsert = "SELECT * FROM recipe WHERE recipe_name = ?";
  pool.query(sqlInsert, [recName], (err, result)=> {
    if (err) {
      console.log(err);
      res.status(500).send("Error occurred while saving the recipe.");
    } else {
      console.log(result);
      res.send(result);
      res.send({
        /*exists: true,
        recipeId: result[0].recipe_id,
        recipe_Name: result[0].recipe_name,
        recipe_Description: result[0].recipe_description,
        tutorial_Link: result[0].recipe_tutorial,
        food: result[0].food,*/
      });
    }
  });
})

app.listen(5000, ()=> {
  console.log('Running on PORT 5000!');
});