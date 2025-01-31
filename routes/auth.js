const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connectToDatabase = require('../db');

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

//Create a set of rules to ensure that the username is a valid username
const usernameRegex = /^[a-zA-Z0-9]{5,12}$/;
const passwordRegex = /^[a-zA-Z0-9]{5,12}$/;


// Middleware to ensure authentication
function authenticateToken(req, res, next) {
    const token = req.cookies ? req.cookies.auth_token : null;

    if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
}


//User Sign Up
router.post('/signup', async (req, res) => {
    const {username, password} = req.body;
    console.log(username, password);
    if (!username || !password) {
        return res.status(400).send('Missing required information_test');
    }  
    
    //TODO: Check iF THE USER NAME IS EVEN VALID
    if (!usernameRegex.test(username)) {
        return res.status(400).send('Invalid username');
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).send('Invalid password');
    }

    const db = await connectToDatabase();
    const users = db.collection('users');

    //Check if the user already exists
    const existingUser = await users.findOne({username});
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    //Hash the password
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = {username, passwordHash: hashedPass};

    await users.insertOne(newUser);
    res.status(201).send('User created');

});


//User Log In
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send('Missing required information');
        }

        const db = await connectToDatabase();
        const users = db.collection('users');


        const user = await users.findOne({username});
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        if (!user.passwordHash) {
            console.error(user, "Password missing in DB");
            return res.status(500).json({ message: "Internal server error. Password missing in DB." });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).send('Invalid username or password');
        }
        
        //Create a JWT token that expires in 15 minutes
        const token = jwt.sign({username}, SECRET_KEY, {expiresIn: '15m'});
        res.cookie('auth_token', token, {httpOnly: true});
        res.status(200).send('Logged in...\nHello, ' + username);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})




//User Log Out
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.status(200).send('Logged out...\nGoodbye');
})


//export both the router and authenticateToken
module.exports = { router, authenticateToken };