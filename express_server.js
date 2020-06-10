const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.set('view engine', "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};


//Function to generate the shortened URL
// eslint-disable-next-line func-style
function generateRandomString() {
  let result = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charsLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}

const addNewUser = (name, email, password) => {
  // Generate a random id
  const userId = generateRandomString();

  const newUser = {
    id: userId,
    name,
    email,
    password,
  };

  // Add the user Object into the usersDb
  users[userId] = newUser;
  // return the id of the user
  return userId;
};
const findUserByEmail = email => {
  // const user = Object.values(usersDb).find(userObj => userObj.email === email)
  //  return user;
  // loop through the usersDb object
  for (let userID in users) {
    // compare the emails, if they match return the user obj
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  // after the loop, return false
  return false;
};

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email);

  // if we got a user back and the passwords match then return the userObj
  if (user && user.password === password) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};


// Generic routes

// If we have a GET request asking for the path of '/', do the callback
app.get("/", (req, res) => {
  res.send("Hello!");
});

// In the event of a GET request, asking for /hello, we send back hello world in HTML in the callback
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// If we have a GET request, asking for /urls.json, we do the callback
app.get("/urls.json", (req, res) => {
  // res.json stringifies the object then sends it back
  res.json(urlDatabase);
});

// If we have a GET request, asking for /users.json, we do the callback
app.get("/users.json", (req, res) => {
  // res.json stringifies the object then sends it back
  res.json(users);
});

//---------------------------------------URL specific ROUTES------------------------

//renders the new URL shortener page that takes in the address to be shortened
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_new", templateVars);
});

//redirects short URLs to long URL
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);

  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// In the event of a GET request, asking for /urls/somethingIDontKnowYet, do the callback
// :shortURL is a route parameter, accessible in req.params (like a wildcard)
//retrieves the id pointing to the short URL and populates the long url for reference
app.get("/urls/:shortURL", (req, res) => {
  // Declare an object called templateVars
  // Populate the object with : the value of req.params.shortURL, in the key called shortURL
  // Populate the object with : the value of the urlDatabse, at the key of req.params.shortURL, in the key called longURL
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


//route shows our short url and long url table
app.get("/urls", (req, res) => {
  console.log("the cookie", req.cookies);
  
  // Declare an object called templateVars, and we assign to the key urls, the value of the variable urlDatabase
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  // Render the template (or complete the template) with the values provided by the object called templateVars
  res.render("urls_index", templateVars);
});

//show the registration page if a user requests 'register' from the header form
app.get("/register", (req, res) => {
  const templateVars = {currentUser: null};
  res.render("urls_register", templateVars);
});

//needs to check if a user is registered, if they are - return an error/redirect to login.
//If they are a new user - set the cookie and update our users object.
app.post("/register", (req, res) => {
  const name = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  
  const user = findUserByEmail(email); //function in the global scope

  if (email === "" || password === "") {
    return res.status(404).send("Please provide a valid email & password");
  } else if (!user) {
    const userID = addNewUser(name, email, password);
    res.cookie("user_id", userID);
    res.redirect("/urls");
  } else {
    res.redirect("/login"); //needs to pass users data obj
  }
  
});


app.get("/login", (req, res) => {
  const templateVars = {currentUser: null};
  res.render("urls_login", templateVars);
});

//POST Requests

//takes a request from
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const tinyURL = generateRandomString(); //produces the key
  const longURL = req.body.longURL; //gets the value from the response body
  urlDatabase[tinyURL] = longURL;

  res.redirect(`/urls/${tinyURL}`);
});

//Takes a delete request from the form in urls_index
//redirects to the same page as a form of refresh
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);
  
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//takes a request from the shortURL page
//input is a newURL and a submit button FORM
//updates the existing shortURL with a new longURL
app.post("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  console.log(req.body);
  let shortURL = req.params.shortURL;
  let longURL = req.body.newURL;
  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");
});


//LOGIN & LOGOUT ROUTES
//handles a post from the nav-form for user login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //authenticates the user with the helper Fn
  const user = authenticateUser(email, password);

  //if the user passes authentication, set the cookie and redirect to home
  
  res.redirect("/urls");
});

//handles a post from the nav-form for user login
app.post("/logout", (req, res) => {
  // console.log(req.body);
  res.clearCookie("user_id", null);
  res.redirect("/urls");
});


// Trigger a listen action, on a specific port (8080) and do a callback if it worked
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
