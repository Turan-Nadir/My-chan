const express = require('express');
const User = require('../models/user.js'), router = express.Router();
const jwt = require('jsonwebtoken'), secret_sauce = process.env.meningjwt;

router.get('/', (req,res)=>{
  res.render('index', {message:''});
});
router.post('/register', async (req, res) => {
  try {
    const { userName } = req.body;
    const check = await User.findOne({username:userName});
    if(check) res.render('index', {message:'username is busy, choose different one!'});
    const newUser = new User({ username:userName});
    await newUser.save();
    const token = jwt.sign({ name: userName, iat: Math.floor(Date.now() / 1000) - 30 }, secret_sauce,);
    res.cookie('jwt', token, { httpOnly: true }).redirect(`/dashboard`);
  } catch (error) {
    console.error(error);
    res.render('index', {message:'error happened'});
  }
});

// Logout route
router.get('/logout', async (req, res) => {
  const user = jwt.decode(req.cookies.token);
  await User.findOneAndDelete({username:user.name});
  res.clearCookie('token'); // This will remove the 'token' cookie
  res.redirect('/'); // Redirect the user to the home page
});
  
router.get('/about', (req,res)=>{
  res.render('about');
})

module.exports = router;