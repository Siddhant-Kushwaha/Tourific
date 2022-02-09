const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const places = require('../controllers/adventureSite')
const { isLoggedIn, isAuthor, validatePlace } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get('/new', isLoggedIn, places.renderNewForm);
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(places.renderEditForm));

router.route('/')
    .get(catchAsync(places.index))
    .post(isLoggedIn, upload.array('image'), validatePlace, catchAsync(places.createAdventureSite));

router.route('/:id')
    .get(catchAsync(places.showAdventureSite))
    .put(isLoggedIn, isAuthor, upload.array('image'), validatePlace, catchAsync(places.editAdventureSite))
    .delete(isLoggedIn, isAuthor, catchAsync(places.deleteAdventureSite));

module.exports = router;