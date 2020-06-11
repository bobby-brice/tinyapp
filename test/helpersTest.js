const {
  assert
} = require('chai');

const {
  findUserByEmail
} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return the user object with the valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput, "expected user to equal userRandomID");
  });
  it('should return undefined without a valid email', function() {
    const user = findUserByEmail("bobby@example.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput, "expected user to equal userRandomID");
  });
});
