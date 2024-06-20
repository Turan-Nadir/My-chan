const express = require('express'), User = require('../models/user.js'); 
const Topic = require('../models/Topic.js'); 
const router = express.Router();
const jwt = require('jsonwebtoken'),secret_sauce = process.env.meningjwt;

router.get('/', async (req, res) => {
  try {
    const token = req.cookies.jwt; // Access the token from the cookie or adjust as needed
    if (!token) return res.sendStatus(401);
    const user = jwt.decode(token);
    const topics = await Topic.find();
        res.render('dashboard', {topics});
  } catch (error) {
    console.error(error);
  }
});

router.post('/topic', async (req,res)=>{
  const topicname = req.body;
  const newtopic = new Topic({
    topic: topicname.topic
  });
  await newtopic.save();
  res.redirect('/dashboard');
});

module.exports = router;