const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
const alert = require('alert');

// Setup cookie middleware:
app.use(cookieParser());

// for body-parser:
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Set EJS engine:
app.set('view engine', 'ejs');

// Random string generator:
const generateRandomString = () => {
  const stringList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i <= 5; i++) {
    let randomNum = Math.floor(Math.random() * stringList.length);
    let randomLetter = stringList[randomNum];
    randomString += randomLetter;
  }
  return randomString;
  // return Math.random()*toString(16).substring(2, 8)
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

// Database:
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' },
};

// User Database:
const users = {
  rHrJoy: {
    id: 'rHrJoy',
    email: 'user01@gmail.com',
    password: 'user01',
  },
  JAc4Kn: {
    id: 'JAc4Kn',
    email: 'user02@gmail.com',
    password: 'user02',
  },
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user03@gmail.com',
    password: 'user03',
  },
};

// For testing route:
app.get('/hello', (req, res) => {
  const templateVars = {
    greeting: 'Hello World!!!!!!',
    userEmail: req.cookies['user_id'],
  };
  res.render('hello_world', templateVars);
});

// Registration template route:
app.get('/register', (req, res) => {
  res.render('user_registration');
});

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

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const result = createNewUser(email, password);
  if (result.error) {
    return res.status(403).json({ ErrorMsg: result.error });
  }
  console.log(users);
  res.cookie('user_id', result.data.userID);
  res.redirect('/urls');
});

// Render user template:
app.get('/login', (req, res) => {
  res.render('user_login');
});

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

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const result = validateLogin(email, password);
  if (result.error) {
    return res.status(403).json({ ErrorMsg: result.error });
  }
  res.cookie('user_id', result.data.id);
  res.redirect('/urls');
});

// Logout user:
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// Show all urls:
app.get('/urls', (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = {
      urls: urlsForUser(req.cookies['user_id']),
      userID: req.cookies['user_id'],
    };
    res.render('urls_index', templateVars);
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Add new url:(this route must be placed before '/urls/:shortURL')
app.get('/urls/new', (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = { userID: req.cookies['user_id'] };
    res.render('urls_new', templateVars);
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Create new url:
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies['user_id'] };
  res.redirect(`/urls/${shortURL}`);
});

// Show added shortURL:
app.get('/urls/:shortURL', (req, res) => {
  if (req.cookies['user_id']) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      userID: req.cookies['user_id'],
    };
    res.render('urls_show', templateVars);
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Redirect to longURL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Update a url:
app.post('/urls/:id', (req, res) => {
  if (req.cookies['user_id']) {
    const urlID = req.params.id;
    urlDatabase[urlID].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Delete a url:
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies['user_id']) {
    const key = req.params.shortURL;
    delete urlDatabase[key];
    res.redirect('/urls');
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
