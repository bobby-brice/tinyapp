const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {
  findUserByEmail,
  generateRandomString
} = require("./helpers");

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
  userRandomID: {
    id: "userRandomID",
    email: "bobby.brice@gmail.com",
    password: bcrypt.hashSync("test", saltRounds),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds),
  },
};


const addNewUser = (email, password) => {
  // Generate a random id
  const userId = generateRandomString();
  
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

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email, users);
  
  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
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


//---------------------------------------BEGIN URL SPECIFIC ROUTES------------------------
//renders the new URL shortener page that takes in the address to be shortened
app.get("/urls/new", (req, res) => {
  const user = req.session["user_id"];
  let templateVars = {
    user
  };

  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//redirects short URLs to long URL
app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (shortURL) {
    res.redirect(longURL); //external site
  } else {
    res.status(403).send("sorry, that url does not exist!");
  }
});

//takes a request from the shortURL page
//input is a newURL and a form submit button
//updates the existing shortURL with a new longURL
app.post("/urls/:shortURL", (req, res) => {
  const loggedInID = req.session["user_id"];
  const userForUrl = urlDatabase[req.params.shortURL].userID;

  let shortURL = req.params.shortURL;
  let longURL = req.body.newURL;
  const user = users[req.session["user_id"]];

  if (user && (loggedInID === userForUrl)) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(401).send("sorry, that url does not exist!");
  }
});

// In the event of a GET request, asking for /urls/somethingIDontKnowYet, do the callback
// :shortURL is a route parameter, accessible in req.params
//retrieves the id pointing to the short URL and populates the long url for reference
app.get("/urls/:shortURL", (req, res) => {

  const user = users[req.session["user_id"]];
  console.log("user: ", user);
  const loggedInID = req.session["user_id"];
  const userForUrl =  urlDatabase[req.params.shortURL].userID;
  
  //tests to ensure only logged in user can view short url
  if (user && (loggedInID === userForUrl)) {
    let templateVars = {
      user: users[req.session["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send("sorry, that url does not exist!");
  }

});

//route shows our short url and long url table
app.get("/urls", (req, res) => {
  //user object
  const user = users[req.session["user_id"]];
  //check that they are a user
  if (user) {
    let templateVars = {
      user,
      urls: urlsForUser(user.id)
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }

});

//takes a request from main/index
app.post("/urls", (req, res) => {
  
  const tinyURL = generateRandomString(); //produces the random key
  const longURL = req.body.longURL;
  const userID = users[req.session["user_id"]].id; //target the ID directly and clean up urlObj
  
  const newURLObj = {
    "longURL": longURL,
    userID
  };
  urlDatabase[tinyURL] = newURLObj;

  res.redirect(`/urls/${tinyURL}`);
});

//Takes a delete request from the form in urls_index
//redirects to the same page as a form of refresh
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session["user_id"]];
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
    user: users[req.session["user_id"]],
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
    res.redirect("/error");
  } else if (!user) {
    const userID = addNewUser(email, password);
    req.session["user_id"] = userID;
    res.redirect("/urls");
  } else {
    res.redirect("/error");
  }
});

//---------------------------------------END REGISTRATION------------------------

//---------------------------------------BEGIN LOGIN & LOGOUT------------------------
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
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
    res.redirect("/error");
  }
});

//handles a post from the nav-form for user login
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

app.get("/error", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_error", templateVars);
});
//---------------------------------------END LOGIN & LOGOUT------------------------

// Trigger a listen action, on a specific port (8080) and do a callback if it worked
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
