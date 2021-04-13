const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

app.use(cookieParser());

// for body-parser:
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  '4jYxmV': 'https://ca.yahoo.com/',
};

// app.get('/', (req, res) => {
//   res.send('Hello!');
// });

app.get('/hello', (req, res) => {
  const templateVars = {
    greeting: 'Hello World!!!!!!',
    username: req.cookies['username'],
  };
  res.render('hello_world', templateVars);
});

const generateRandomString = () => {
  const stringList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = 0; i <= 5; i++) {
    let randomNum = Math.floor(Math.random() * stringList.length);
    let randomLetter = stringList[randomNum];
    randomString += randomLetter;
  }
  return randomString;
};

// Login user:
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('urls')
})

// Logout user:
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
})

// Show all urls:
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
  };
  res.render('urls_index', templateVars);
});

// Add new url:
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'] };
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
    username: req.cookies['username'],
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
