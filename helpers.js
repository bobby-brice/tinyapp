const findUserByEmail = function(email, users) {
  for (let userID in users) {
    // compare the emails, if they match return the user obj
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  // after the loop, if no user is found, return undefined
  return undefined;
};

//Function to generate the shortened URL
// eslint-disable-next-line func-style
function generateRandomString() {
  let result = "";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}

module.exports = {findUserByEmail, generateRandomString};