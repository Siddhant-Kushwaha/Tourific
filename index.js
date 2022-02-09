if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// require('dotenv').config();

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const userRoutes = require('./Router/users');
const placeRoutes = require('./Router/adventureSite');
const reviewRoutes = require('./Router/reviews');

const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet');
const dburl='mongodb://localhost:27017/tourificdb';
const MongoDBStore=require('connect-mongo')
// 'mongodb://localhost:27017/tourificdb'

mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// const store=new MongoDBStore({
//     url:dburl,
//     secret:'thisisnotagoodsecret',
//     touchAfter:24*60*60
// })

// store.on('error',function(e){
//     console.log('Session Store Error',e)
// })

const sessionConfig = {
    store:MongoDBStore.create({
        mongoUrl:dburl
    }),
    name:'session',
    secret: 'thisisnotagoodsecrettobehonest',
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djbomerqh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(express.static(path.join(__dirname, '/assets')));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize({
      replaceWith: '_',
    }),
  );

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.curUser = req.user;
    next();
})

app.get('/', (req, res) => {
    // console.log(req.query);
    res.render('adventureSites/home');
});

app.use('/', userRoutes);
app.use('/adventureSites', placeRoutes);
app.use('/adventureSites/:id/reviews', reviewRoutes);

app.use((err, req, res, next) => {
    const { statuscode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!! ';
    res.status(statuscode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Server started');
})