const findUserByEmail = function(email, users) {
  // const user = Object.values(usersDb).find(userObj => userObj.email === email)
  //  return user;
  // loop through the usersDb object
  for (let userID in users) {
    // compare the emails, if they match return the user obj
    if (users[userID].email === email) {
      return users[userID].id;
    }
  }
  // after the loop, return false so it can complete each iteration
  return undefined;
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

module.exports = {findUserByEmail, generateRandomString};