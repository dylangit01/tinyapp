const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const alert = require('alert');
const allHelperFnClosure = require('./views/helpers');
const { urlDatabase, usersDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

// Setup rest api middleware:
app.use(methodOverride('_method'));

// Setup cookie middleware:
app.use(
  cookieSession({
    name: 'session',
    keys: ['user_id'],
  })
);

// for body-parser:
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Set EJS engine:
app.set('view engine', 'ejs');

// Require helper fns:
const { generateRandomString, urlsForUser, createNewUser, validateLogin } = allHelperFnClosure(
  usersDatabase,
  urlDatabase
);

const userURLMiddleParser = (req, res, next) => {
  const userID = req.session.user_id;
  const longURL = req.body.longURL
  req.userId = userID;
  req.longURL = longURL;
  next();
};
app.use(userURLMiddleParser);

// For testing route:
// app.get('/hello', (req, res) => {
//   const templateVars = {
//     greeting: 'Hello World!!!!!!',
//     userEmail: usersDatabase[req.userId].email,
//   };
//   res.render('hello_world', templateVars);
// });

// For '/' route:
app.get('/', (req, res) => {
  if (req.userId) {
    res.redirect('/urls');
  } else {
    alert('Please login to access your account');
    res.redirect('/login');
  }
});

// Registration template route:
app.get('/register', (req, res) => {
  if (!req.userId) {
    res.render('user_registration');
  } else res.redirect('/urls');
});

// Register route:
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const result = createNewUser(email, password);
  if (result.error) {
    const templateVars = {
      staCode: res.status(403).statusCode,
      error: result.error,
    };
    return res.render('error_Msg', templateVars);
  }
  req.session.user_id = result.data.userID;
  res.redirect('/urls');
});

// Login template route:
app.get('/login', (req, res) => {
  res.render('user_login');
});

// Login route:
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const result = validateLogin(email, password);
  if (result.error) {
    const templateVars = {
      staCode: res.status(403).statusCode,
      error: result.error
    }
    return res.render('error_Msg', templateVars);
  }
  req.session.user_id = result.data.id;
  res.redirect('/urls');
});

// Logout route:
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

// Show all urls:
app.get('/urls', (req, res) => {
  if (req.userId) {
    const templateVars = {
      urls: urlsForUser(req.userId),
      userEmail: usersDatabase[req.userId].email,
    };
    res.render('urls_index', templateVars);
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Add new url:(this route must be placed before '/urls/:shortURL')
app.get('/urls/new', (req, res) => {
  if (req.userId) {
    const templateVars = { userEmail: usersDatabase[req.userId].email };
    res.render('urls_new', templateVars);
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Create new url:
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  if (req.longURL) {
    urlDatabase[shortURL] = { longURL: req.longURL, userID: req.userId };
  } else {
    alert('URL cannot be empty');
    return res.redirect('/urls/new');
  }
  res.redirect(`/urls/${shortURL}`);
});

// Show added shortURL:
app.get('/urls/:shortURL', (req, res) => {
  if (req.userId) {
    const shortURL = req.params.shortURL;
    const result = urlsForUser(req.userId);
    for (let shortKey in result) {
      if (shortKey === shortURL) {
        const templateVars = {
          shortURL: req.params.shortURL,
          longURL: result[req.params.shortURL].longURL,
          userEmail: usersDatabase[req.userId].email,
        };
        return res.render('urls_show', templateVars);
      }
    }
    alert(`shortURL: ${shortURL} does not exist`);
    res.redirect('/urls');
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Redirect to longURL:
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]?.longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    alert(`No URL matches shortURL: ${req.params.shortURL}`);
    res.redirect('/login');
  }
});

// Update a url:
app.put('/urls/:id', (req, res) => {
  if (req.userId) {
    const urlID = req.params.id;
    if (req.longURL) {
      urlDatabase[urlID].longURL = req.longURL;
    } else {
      alert('URL cannot be empty');
      return res.redirect(`/urls/${urlID}`)
    }
    res.redirect('/urls');
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Delete a url:
app.delete('/urls/:shortURL/delete', (req, res) => {
  if (req.userId) {
    const key = req.params.shortURL;
    delete urlDatabase[key];
    res.redirect('/urls');
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

app.get('/users', (req, res) => {
  res.json(usersDatabase);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
