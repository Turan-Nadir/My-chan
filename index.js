require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const  morgan = require('morgan');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3060;
const dashboard = require('./routes/dashboard.js');
const auth = require('./routes/authentication.js');
const User = require('./models/user.js');
const Message = require('./models/message.js');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Topic = require('./models/Topic.js');
const app = express();
const jwt = require('jsonwebtoken'),secret_sauce = process.env.meningjwt;
const server = app.listen(port, () => console.log(`listening on port http://localhost:${port}`));
const io = require('socket.io')(server);
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 500, message: 'Too many requests from this IP, please try again later.' }); 
app.use(limiter).use(express.json()).use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs').use(cookieParser());
app.use(express.static('public'));
app.use('/dashboard', dashboard);
app.use('/', auth);
const userIds = [];
///  request routes for chat
app.get('/chat/:topicId', async (req, res) => {
   const topicId = req.params.topicId;
    const token = req.cookies.jwt; // Access the token from the cookie or adjust as needed
    if (!token) return res.sendStatus(401);
    const user = jwt.decode(token)
    const messages = await Message.find({topicId:topicId})
    const topic = await Topic.findById(topicId)
    res.render('chat', { messages, sender:user.name, topic });
});

io.on('connection', async (socket) => {
    userIds.push(socket.id);

    // Fetch and emit the messages for the connected user
    socket.on('chatUser', async ({ sender, topicId }) => {
        try {
            const messages = await Message.find({ topicId: topicId });
            socket.emit('messages', messages);
            io.emit('userSize', userIds.length);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    });

    // Handle new message
    socket.on('message', async ({ sender, topicId, text }) => {
        try {
            const newMessage = new Message({ sender: sender, topicId: topicId, text: text });
            await newMessage.save();
            const updatedMessages = await Message.find({ topicId: topicId });
            io.emit('messages', updatedMessages);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        userIds.splice(userIds.indexOf(socket.id), 1);
        io.emit('userSize', userIds.length);
    });
});


mongoose.connect(process.env.mongoDB)
    .then(() => { console.log("connected to local mongodb") })
    .catch(err => console.log('error happened ', err));