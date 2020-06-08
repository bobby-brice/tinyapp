const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//ROUTES
//renders the new URL shortener page that takes in the address to be shortened
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//redirects short URLs to long URL
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//retrieves the id pointing to the short URL and populates the long url for reference
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});


//route shows our short url and long url table
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//POST
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const tinyURL = generateRandomString(); //produces the key
  const longURL = req.body.longURL; //gets the value from the response body
  urlDatabase[tinyURL] = longURL;

  res.redirect(`/urls/${tinyURL}`);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



//PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
