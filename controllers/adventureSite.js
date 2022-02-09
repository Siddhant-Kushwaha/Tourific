const AdventureSite = require('../models/adventureSite');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const sites = await AdventureSite.find({});
    res.render('adventureSites/index', { sites });
};

module.exports.renderNewForm = (req, res) => {
    res.render('adventureSites/new');
};

module.exports.showAdventureSite = async (req, res) => {
    const { id } = req.params;
    const site = await AdventureSite.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!site) {
        req.flash('error', 'Cannot find that Place!');
        return res.redirect('/adventureSites');
    }
    return res.render('adventureSites/show', { site });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const site = await AdventureSite.findById(id);
    if (!site) {
        req.flash('error', 'Cannot find that Place!');
        return res.redirect('/adventureSites');
    }
    return res.render('adventureSites/edit', { site });
};

module.exports.createAdventureSite = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.site.location,
        limit: 1
    }).send()
    const adventureSite = new AdventureSite(req.body.site);
    adventureSite.geometry = geoData.body.features[0].geometry;
    adventureSite.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    adventureSite.author = req.user._id;
    console.log(adventureSite);
    await adventureSite.save();
    req.flash('success', 'Successfully created a new place!');
    res.redirect(`/adventureSites/${adventureSite._id}`);
};

module.exports.editAdventureSite = async (req, res, next) => {
    const { id } = req.params;
    await AdventureSite.findByIdAndUpdate(id, req.body.site);

    const adventureSite = await AdventureSite.findByIdAndUpdate(id, { ...req.body.site });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    adventureSite.images.push(...imgs);
    await adventureSite.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await adventureSite.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }


    req.flash('success', 'Successfully Updated Place!');
    res.redirect(`/adventureSites/${id}`);
};

module.exports.deleteAdventureSite = async (req, res, next) => {
    const { id } = req.params;
    await AdventureSite.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted Place!');
    res.redirect('/adventureSites');
};