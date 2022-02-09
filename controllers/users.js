const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Tourific');
            res.redirect('/adventureSites');
        })


    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('register')
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
};

module.exports.userLogin = (req, res) => {
    req.flash('success', 'Welcome to Tourific');
    const redirectURL = req.session.returnTo || '/adventureSites';
    delete req.session.returnTo;
    res.redirect(redirectURL);
};

module.exports.userLogout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/adventureSites');
};