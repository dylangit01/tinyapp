const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const alert = require('alert');
const allHelperFnClosure = require('./helps/helpers');
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
app.set('view engine', 'ejs');

// Require helper fns:
const { generateRandomString, urlsForUser, createNewUser, validateLogin } = allHelperFnClosure(
  usersDatabase,
  urlDatabase
);

const userURLMiddleParser = (req, res, next) => {
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  req.userId = userID;
  req.longURL = longURL;
  next();
};
app.use(userURLMiddleParser);

app.get('/', (req, res) => {
  if (req.userId) {
    res.redirect('/urls');
  } else {
    alert('Please login to access your account');
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  if (!req.userId) {
    res.render('user_registration');
  } else res.redirect('/urls');
});

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

app.get('/login', (req, res) => {
  if (req.userId) {
     return res.redirect('/urls')
  }
  return res.render('user_login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const result = validateLogin(email, password);
  if (result.error) {
    const templateVars = {
      staCode: res.status(403).statusCode,
      error: result.error,
    };
    return res.render('error_Msg', templateVars);
  }
  req.session.user_id = result.data.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

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

app.post('/urls', (req, res) => {
  if (req.userId) {
    const shortURL = generateRandomString();
    if (req.longURL) {
      urlDatabase[shortURL] = { longURL: req.longURL, userID: req.userId };
    } else {
      alert('URL cannot be empty');
      return res.redirect('/urls/new');
    }
    res.redirect(`/urls/${shortURL}`);
  } else {
    alert('The user is not logged in, please log in first!');
    res.redirect('/login');
  }
});

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
    alert(`shortURL: ${shortURL} does not belong to this user`);
    res.redirect('/urls');
  } else {
    alert('The user is not logged in, please login or register a new account');
    res.redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]?.longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    alert(`No URL matches: ${req.params.shortURL}`);
    res.redirect('/');
  }
});

app.put('/urls/:id', (req, res) => {
  if (req.userId) {
    const urlID = req.params.id;
    const ownerUrls = urlsForUser(req.userId);
    for (const key in ownerUrls) {
      if (key === urlID) {
        if (req.longURL) {
          ownerUrls[urlID].longURL = req.longURL;
          return res.redirect(`/urls/${urlID}`);
        } else {
          alert('URL cannot be empty');
          return res.redirect(`/urls/${urlID}`);
        }
      }
    }
    alert(`shortURL: ${urlID} does not belong to this user`);
    res.redirect('/urls');
  } else {
    alert('The user is not logged in, please login or register a new account');
    res.redirect('/login');
  }
});

app.delete('/urls/:shortURL/delete', (req, res) => {
  if (req.userId) {
    const shortURL = req.params.shortURL;
    const ownerUrls = urlsForUser(req.userId);
    for (let key in ownerUrls) {
      if (key === shortURL) {
        delete urlDatabase[key];
        return res.redirect('/urls');
      }
    }
    alert(`shortURL: ${shortURL} does not belong to this user`);
    return res.redirect('/urls');
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
