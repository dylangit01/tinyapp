const allHelperFnClosure = (users, urlDatabase) => {
  // Random string generator:
  const generateRandomString = () => {
    // const stringList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // let randomString = '';
    // for (let i = 0; i <= 5; i++) {
    //   let randomNum = Math.floor(Math.random() * stringList.length);
    //   let randomLetter = stringList[randomNum];
    //   randomString += randomLetter;
    // }
    // return randomString;
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

  // createNewUser fn:
  const createNewUser = (email, password) => {
    for (let userKey in users) {
      if (users[userKey].email === email) {
        return { error: `User with ${email} already exist, please login or register new user`, data: null };
      }
    }
    if (!email || !password) {
      return { error: 'please enter valid email and password', data: null };
    }
    const userID = generateRandomString();
    users[userID] = { id: userID, email, password };
    return { error: null, data: { userID, email, password } };
	};

	const validateLogin = (email, password) => {
    for (let key in users) {
      if (users[key].email === email) {
        if (users[key].password === password) {
          return { error: null, data: users[key] };
        } else {
          return { error: 'Password do NOT match', data: null };
        }
      }
    }
    return { error: `User with ${email} cannot be found`, data: null };
  };
  return { urlsForUser, createNewUser, validateLogin };
}

module.exports = allHelperFnClosure;