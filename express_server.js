const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set('view engine', "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: "session",
  keys: ["123456","09876"]
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.ca",
    userID: "userRandomID"
  },
  "9sm3xK": {
    longURL: "http://www.google.ca",
    userID: "user2RandomID"
  }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "bobby.brice@gmail.com",
    password: bcrypt.hashSync("test", saltRounds),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds),
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

const addNewUser = (email, password) => {
  // Generate a random id
  const userId = generateRandomString();
  console.log("password: ", password);
  
  const newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, saltRounds),
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
  // after the loop, return false so it can complete each iteration
  return false;
};

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email);

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};

const urlsForUser = function(userID) {
  const urlsForUsersDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      urlsForUsersDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlsForUsersDatabase;
};

// {
//   "9sm3xK": {
//     longURL: "http://www.google.ca",
//     userID: "aJ482W"
//   }
// }

// GENERIC ROUTES

// If we have a GET request asking for the path of '/', callback = "hello"
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

//---------------------------------------BEGIN URL SPECIFIC ROUTES------------------------

//renders the new URL shortener page that takes in the address to be shortened
app.get("/urls/new", (req, res) => {
  const user = req.session["user_id"]; //users[req.cookies["user_id"]];
  let templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//redirects short URLs to long URL
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL); //external site
});

//takes a request from the shortURL page
//input is a newURL and a form submit button
//updates the existing shortURL with a new longURL
app.post("/urls/:shortURL", (req, res) => {

  let shortURL = req.params.shortURL;
  let longURL = req.body.newURL;
  const user = users[req.session["user_id"]];   //[req.cookies["user_id"]];
  if (user) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  }
});

// In the event of a GET request, asking for /urls/somethingIDontKnowYet, do the callback
// :shortURL is a route parameter, accessible in req.params
//retrieves the id pointing to the short URL and populates the long url for reference
app.get("/urls/:shortURL", (req, res) => {
  // Declare an object called templateVars
  // Populate the object with : the value of req.params.shortURL, in the key called shortURL
  // Populate the object with : the value of the urlDatabse, at the key of req.params.shortURL, in the key called longURL
  let templateVars = {
    user: users[req.session["user_id"]],    //[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"]
  };

  res.render("urls_show", templateVars);
});

//route shows our short url and long url table
app.get("/urls", (req, res) => {
  // Declare an object called templateVars, and we assign to the key urls, the value of the variable urlDatabase\
  const user = users[req.session["user_id"]];  //[req.cookies["user_id"]];

  if (user) {
    let templateVars = {
      user,
      urls: urlsForUser(user.id)
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
  // Render the template (or complete the template) with the values provided by the object called templateVars
  // res.render("urls_index", templateVars);
});

//takes a request from
app.post("/urls", (req, res) => {
  
  const tinyURL = generateRandomString(); //produces the key
  const longURL = req.body.longURL; //gets the value from the response body
  const userID = users[req.session["user_id"]];     //[req.cookies["user_id"]];
  
  const newURLObj = {
     
    "longURL": longURL,
    "userID": userID.id
    
  };
  urlDatabase[tinyURL] = newURLObj;
  // console.log("urlDatabase", urlDatabase);

  res.redirect(`/urls/${tinyURL}`);
});

//Takes a delete request from the form in urls_index
//redirects to the same page as a form of refresh
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params);
  const user = users[req.session["user_id"]];             //[req.cookies["user_id"]];
  if (user) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.status(403).send("no can do!");
});

//---------------------------------------END URL SPECIFIC ROUTES------------------------

//---------------------------------------BEGIN REGISTRATION------------------------
//show the registration page if a user requests 'register' from the header form
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],            //[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

//needs to check if a user is registered, if they are - return an error/redirect to login.
//If they are a new user - set the cookie and update our users object.
app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  
  
  const user = findUserByEmail(email); //function in the global scope

  if (email === "" || password === "") {
    return res.status(404).send("Please provide a valid email & password");
  } else if (!user) {
    const userID = addNewUser(email, password);
    req.session["user_id"] = userID;
    res.redirect("/urls");
  } else {
    return res.status(404).send("You have already registered, please login.");
  }
});

//---------------------------------------END REGISTRATION------------------------

//---------------------------------------BEGIN LOGIN & LOGOUT------------------------
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],            //[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});
//handles a post from the nav-form for user login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //authenticates the user with the helper Fn
  const user = authenticateUser(email, password);

  if (user) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send('You have provided invalid credentials');
  }
  //if the user passes authentication, set the cookie and redirect to home
  //if the user fails authentication, response is a 403
  res.redirect("/urls");
});

//handles a post from the nav-form for user login
app.post("/logout", (req, res) => {
  // console.log(req.body);
  req.session["user_id"] = null;
  res.redirect("/urls");
});

//---------------------------------------END LOGIN & LOGOUT------------------------

// Trigger a listen action, on a specific port (8080) and do a callback if it worked
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
