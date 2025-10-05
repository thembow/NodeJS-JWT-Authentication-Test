const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {expressjwt: exjwt} = require('express-jwt');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const secretKey = 'your_secret_key';
const jwtMW = exjwt({ secret: secretKey, algorithms: ['HS256'] });

let users = [
    {
        id: 1,
        username: 'user1',
        password: 'pass1'
    },
    {
        id: 2,
        username: 'user2',
        password: 'pass2'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`);
    for (let user of users) {
        if (user.username === username && user.password === password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        } else {
            res.status(401).json({
                success: false,
                err: 'Invalid credentials',
                token: null
            });
        }
    }
    res.json({ message: 'Login successful' });

});

app.get('/api/auth/validate', jwtMW, (req, res) => {
  res.json({ valid: true });
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    console.log(req);
    res.json({ success: true, myContent: 'secret dashboard content' });
}
);

app.get('/api/prices', jwtMW, (req, res) => {
    console.log(req);
    res.json({ success: true, myContent: 'This is the price $3.99' });
});

app.get('/api/settings', jwtMW, (req, res) => {
    const settings = {
        success: true,
        myContent: 'These are your settings',
    };
    return res.json(settings);
}
);

app.use((req, res, next) => {
  // let any /api routes continue to their handlers
  if (req.path.startsWith('/api')) return next();

  // serve the SPA landing page for everything else
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function (err, req, res, next) {
    if (err && err.name === 'UnauthorizedError') {
    if (err.inner && err.inner.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, err: 'TokenExpired', message: 'JWT expired' });
    }
    return res.status(401).json({ success: false, officialErr: err, err: 'Invalid token' });
  }
  next(err);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}
);