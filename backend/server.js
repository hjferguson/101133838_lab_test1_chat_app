const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./schema/User');
require('dotenv').config();
const authMiddleware = require('./middleware');

//initialize express
const app = express();
const port = 3001; //react will run on 3000. 
//to parse json req bodies
app.use(express.json());
//read url-encoded data
app.use(express.urlencoded({ extended: true }));

//connect to mongo container
mongoose.connect('mongodb://mongo:27017/chatApp')
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log("Error!: ", err));


//sign up / register
app.post('/register', async (req, res) => {
    const { userName, password, email } = req.body;

    // Check if the user already exists in the system. Email is unique, so we'll use that
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Email already in use!' });
    }
    //if user doesn't exist, make one!  
    const newUser = new User({
        userName, 
        password, 
        email    
    });
    await newUser.save(); // save to MongoDB

    res.status(201).json({ message: 'User created successfully', user: newUser });
});

//signin / login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isMatch = await user.comparePassword(password); //uses bcrypt to compair the plain-text to hashed password in db
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    //login successful so generate a JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: '24h'});

    res.status(200).json({ message: 'Login successful', user: { id: user._id, userName: user.userName, email: user.email, token: token } });
});



app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})