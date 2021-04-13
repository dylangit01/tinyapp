const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

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
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  '4jYxmV': 'https://ca.yahoo.com/',
};

// User Database:
const users = {
  user01: {
    id: 1,
    email: 'user01@example.com',
    password: 'user01',
  },
  user02: {
    id: 2,
    email: 'user02@example.com',
    password: 'user02',
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
      return res.status(400).json({ ErrorMsg: `${res.statusCode}, User with ${email} already exist, please login or register new user.` });
    }
  }
  const userRandomID = `user${generateRandomString()}`;
  users[userRandomID] = { id: `${userRandomID}`, email, password };
  const userStr = JSON.stringify(users[userRandomID]);
  console.log(JSON.parse(userStr));
  res.cookie('user_id', userStr);
  // console.log(users);
  res.redirect('urls');
});

// Login user template:
app.get('/login', (req, res) => {
  res.render('user_login')
})

// Login user:
// app.post('/login', (req, res) => {
//   res.cookie('username', req.body.username);
//   res.redirect('urls');
// });

// Logout user:
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// Show all urls:
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userEmail: req.cookies['user_id'] && JSON.parse(req.cookies['user_id']).email,
  };
  res.render('urls_index', templateVars);
});

// Add new url:(this route must be placed before '/urls/:shortURL')
app.get('/urls/new', (req, res) => {
  const templateVars = { userEmail: req.cookies['user_id'] && JSON.parse(req.cookies['user_id']).email };
  res.render('urls_new', templateVars);
});

// Create new url:
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Show added shortURL:
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userEmail: req.cookies['user_id'] && JSON.parse(req.cookies['user_id']).email,
  };
  res.render('urls_show', templateVars);
});

// Redirect to longURL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Update a url:
app.post('/urls/:id', (req, res) => {
  const urlID = req.params.id;
  urlDatabase[urlID] = req.body.longURL;
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
