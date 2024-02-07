const express = require('express');
const mongoose = require('mongoose');
const User = require('./schema/User');

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


//routing
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


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})