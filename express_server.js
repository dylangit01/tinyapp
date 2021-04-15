const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8080;
const alert = require('alert');

const allHelperFnClosure = require('./views/helpers');

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
    password: '$2b$10$0Rd2NqGDNHeQtsGiBI5hkeXqltUw5VBvahJoWUuHiPGh0kRVmdq1W',
  },
  JAc4Kn: {
    id: 'JAc4Kn',
    email: 'user02@gmail.com',
    password: '$2b$10$i11xOK.GU2EwgH3NCIm1YukhD4jbqEdWmdrU604s/ij1bolK6XDZu',
  },
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user03@gmail.com',
    password: '$2b$10$/msnEHRHDN9v7Z6BlnGBDebKTKfXpjqP3tlDliG5DN0sQt3DEEth2',
  },
};

// Require helper fns:
const { generateRandomString, urlsForUser, createNewUser, validateLogin } = allHelperFnClosure(users, urlDatabase);

// For testing route:
// app.get('/hello', (req, res) => {
//   const templateVars = {
//     greeting: 'Hello World!!!!!!',
//     userEmail: users[req.session.user_id].email,
//   };
//   res.render('hello_world', templateVars);
// });

const userMiddleParser = (req, res, next) => {
  const userID = req.session.user_id;
  req.userId = userID;
  next()
}
app.use(userMiddleParser);

// Registration template route:
app.get('/register', (req, res) => {
  if (!req.userId) {
    res.render('user_registration');
  } else res.redirect('/urls');
});

// Register route:
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = createNewUser(email, hashedPassword);
  if (result.error) {
    return res.status(403).send(`<h1>Error ${res.statusCode}: ${result.error}</h1>`);
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
    return res.status(403).send(`<h1>Error ${res.statusCode}: ${result.error}</h1>`);
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
      userEmail: users[req.userId].email,
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
    const templateVars = { userEmail: users[req.userId].email };
    res.render('urls_new', templateVars);
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Create new url:
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.userId };
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
          userEmail: users[req.userId].email,
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
app.post('/urls/:id', (req, res) => {
  if (req.userId) {
    const urlID = req.params.id;
    if (req.body.longURL) {
      urlDatabase[urlID].longURL = req.body.longURL
    } else {
      return alert('URL cannot be empty')
    }
    res.redirect('/urls');
  } else {
    alert('Please login or register a new account');
    res.redirect('/login');
  }
});

// Delete a url:
app.post('/urls/:shortURL/delete', (req, res) => {
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
  res.json(users);
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
