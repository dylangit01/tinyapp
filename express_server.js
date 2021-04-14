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

// Database:
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' },
};

// User Database:
const users = {
  user01: {
    id: '',
    email: '',
    password: '',
  },
  user02: {
    id: '',
    email: '',
    password: '',
  },
};

// For testing route:
app.get('/hello', (req, res) => {
  const templateVars = {
    greeting: 'Hello World!!!!!!',
    userEmail: JSON.parse(req.cookies['user_id']).email,
  };
  res.render('hello_world', templateVars);
});

// Registration template route:
app.get('/register', (req, res) => {
  res.render('user_registration');
});

// Registration handler route:
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).json({ ErrorMsg: `${res.statusCode}, please enter valid email and password.` });
  }
  if (req.cookies['user_id']) {
    const existedEmail = JSON.parse(req.cookies['user_id']).email;
    if (email === existedEmail) {
      return res
        .status(400)
        .json({ ErrorMsg: `${res.statusCode}, User with ${email} already exist, please login or register new user.` });
    }
  }
  const userRandomID = `user${generateRandomString()}`;
  users[userRandomID] = { id: `${userRandomID}`, email, password };
  const userStr = JSON.stringify(users[userRandomID]);
  // console.log(users);
  res.cookie('user_obj', userStr);
  res.cookie('user_id', `${userRandomID}`);
  res.redirect('/urls');
});

// Login user template:
app.get('/login', (req, res) => {
  res.render('user_login');
});

// Login user:
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!req.cookies['user_obj']) {
    res.redirect('/register');
  } else {
    const existedEmail = JSON.parse(req.cookies['user_obj']).email;
    const existedPassword = JSON.parse(req.cookies['user_obj']).password;
    if (!existedEmail) {
      return res.status(403).json({ ErrorMsg: `${res.statusCode} user with ${email} cannot be found` });
    } else {
      if (email !== existedEmail) {
        return res.status(403).json({ ErrorMsg: `${res.statusCode} user email do NOT match` });
      } else if (email === existedEmail && password !== existedPassword) {
        return res.status(403).json({ ErrorMsg: `${res.statusCode} password do NOT match` });
      } else {
        res.cookie('user_id', JSON.parse(req.cookies['user_obj']).id);
        res.redirect('/urls');
      }
    }
  }
});

// Logout user:
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// Show all urls:
app.get('/urls', (req, res) => {
  if (req.cookies['user_id']) {
    const urlsOjb = {};
    for (let key in urlDatabase) {
      if (urlDatabase[key].userID === req.cookies['user_id']) {
        urlsOjb[key] = urlDatabase[key];
      }
    }
    const templateVars = {
      urls: urlsOjb,
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
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: req.cookies['user_id'],
  };
  res.render('urls_show', templateVars);
});

// Redirect to longURL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Update a url:
app.post('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  urlDatabase[urlID].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Delete a url:
app.post('/urls/:shortURL/delete', (req, res) => {
  const key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
