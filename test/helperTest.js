const { assert } = require('chai');
const allHelperFnClosure = require('../views/helpers');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};
const { getUserByEmail } = allHelperFnClosure(testUsers);

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if a user with an email not in the database', () => {
    const user = getUserByEmail('userxxx@example.com', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if no email provided', () => {
    const user = getUserByEmail('', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
