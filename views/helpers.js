const bcrypt = require('bcrypt');

const allHelperFnClosure = (users, urlDatabase) => {
  // Random string generator:
  const generateRandomString = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  // Help fun: filter urlsObj only for matched userID
  const urlsForUser = (id) => {
    const urlsObj = {};
    for (let key in urlDatabase) {
      if (urlDatabase[key].userID === id) {
        urlsObj[key] = urlDatabase[key];
      }
    }
    return urlsObj;
  };

  const getUserByEmail = (email) => {
    for (let userKey in users) {
      if (users[userKey].email === email) {
        return users[userKey];
      }
    }
    return undefined;
  };

  // createNewUser fn:
  const createNewUser = (email, password) => {
    if (!email || !password) {
      return { error: 'Email and Password cannot be empty', data: null };
    }
    // for (let userKey in users) {
    //   if (users[userKey].email === email) {
    //     return { error: `User with ${email} already exist, please login or register new user`, data: null };
    //   }
    // }
    const user = getUserByEmail(email);
    if (user) {
      return { error: `User with ${email} already exists, please login or register new account`, data: null };
    }
    const userID = generateRandomString();
    users[userID] = { id: userID, email, password };
    return { error: null, data: { userID, email, password } };
  };

  const validateLogin = (email, password) => {
    const user = getUserByEmail(email);
    if (!user) {
      return { error: 'User not found', data: null };
    }
    const result = bcrypt.compareSync(password, user.password);
    return user && result ? { error: null, data: user } : { error: 'Passwords do NOT match', data: null };
  };

  return { generateRandomString, urlsForUser, getUserByEmail, createNewUser, validateLogin };
};

module.exports = allHelperFnClosure;








// Old version:
// const generateRandomString = () => {
// const stringList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
// let randomString = '';
// for (let i = 0; i <= 5; i++) {
//   let randomNum = Math.floor(Math.random() * stringList.length);
//   let randomLetter = stringList[randomNum];
//   randomString += randomLetter;
// }
// return randomString;
// };

// const validateLogin = (email, password) => {
// for (let key in users) {
//   if (users[key].email === email) {
//     const res = bcrypt.compareSync(password, users[key].password);
//     if (res) {
//       return { error: null, data: users[key] };
//     } else {
//       return { error: 'Password do NOT match', data: null };
//     }
//   }
// }
// return { error: `User with ${email} cannot be found`, data: null };
// };
