const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./schema/User');
const ChatMessage = require('./schema/ChatMessage'); 

require('dotenv').config();
const cors = require('cors');

//initialize express
const app = express();
const server = http.createServer(app); //wraps the express app
const io = socketIo(server, { //attach  socket.io to http server (which is wrapped onto express server)
    cors: {   //need this because browser console giving a bunch of cors errors
        origin: "*", //set to all for testing, can specify just my react app later on
        methods: ["GET", "POST"]
    }
}); 

const port = 3001; //react will run on 3000 so i set this to 3001
//to parse json req bodies
app.use(express.json());
//read url-encoded data
app.use(express.urlencoded({ extended: true }));

app.use(cors()); //needed or else browser gives a bunch of CORS errors :c

//connect to mongo container
mongoose.connect('mongodb://mongo:27017/chatApp')
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log("Error!: ", err));

//RESTful routes START
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

//RESTful routes END

// Socket.io logic

io.use((socket, next) => {
    const token = socket.handshake.query.token;
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.id; // You can then access the userId on the socket object
      next();
    });
  });
  

io.on('connection', (socket) => {
    console.log(`New WebSocket connection: ${socket.id}`);
    console.log(socket);
    //test to see if i can send a simple message to client
    socket.emit('message', { from_user: 'Server', text: 'Welcome!'});
    
    // Joining a room
    socket.on('joinRoom', async ({ roomName }) => {
      socket.join(roomName);
      console.log(`${socket.id} is attempting to join room: ${roomName}`); // Added log

      const user = await User.findById(socket.userId);

      if(user){
        const joinMessage = {
          from_user: 'Server',
          text: `${user.userName} has joined the room ${roomName}.`,
          _id: new mongoose.Types.ObjectId() // Generate a unique ID for this system message
        };
        io.to(roomName).emit('message', joinMessage);
      }

      
      try {
        const messages = await ChatMessage.find({ room: roomName })
          .sort({ timestamp: -1 })
          .limit(50)
          .populate('user', 'userName')
          .exec(); 

        console.log(`${socket.id} joined room: ${roomName} and found ${messages.length} messages`); // Log after successful query

        socket.emit('chatHistory', messages.map(msg => ({ from_user: msg.user.userName, text: msg.message })));
      } catch (err) {
        console.error('Error loading chat history', err);
      }
    });

    
      

    // save room message
    socket.on('sendMessage', async ({ roomName, message }) => {
      try {
        const chatMessage = new ChatMessage({
          room: roomName,
          user: socket.userId,
          message: message.text
        });
      
        // After saving the message, directly populate without using execPopulate
        const savedMessage = await chatMessage.save();
        const populatedMessage = await ChatMessage.findById(savedMessage._id).populate('user', 'userName');
        console.log("populated message from db: ", populatedMessage)
        io.to(roomName).emit('message', { from_user: populatedMessage.user.userName, text: populatedMessage.message });
      } catch (err) {
        console.error('Error saving message to database', err);
      }
    });
    
      
      

    // Leaving a room
    socket.on('leaveRoom', async ({ roomName }) => {
        
        console.log(`User ${socket.id} left room: ${roomName}`);

        const user = await User.findById(socket.userId);

      if(user){
        const leaveMessage = {
          from_user: 'Server',
          text: `${user.userName} has left the room ${roomName}.`,
          _id: new mongoose.Types.ObjectId() // Generate a unique ID for this system message
        };
        io.to(roomName).emit('message', leaveMessage);
        socket.leave(roomName);
        // socket.to(roomName).emit('notification', `A user has left ${roomName}`);

        console.log(leaveMessage);
      }

        
    });

    // Handling disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});