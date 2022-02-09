const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const user = require('../controllers/users')


router.route('/register')
    .get(user.renderRegisterForm)
    .post(catchAsync(user.registerUser))

router.route('/login')
    .get(user.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'login' }), user.userLogin)

router.get('/logout', user.userLogout)

module.exports = router;