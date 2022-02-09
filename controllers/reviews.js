const Review = require('../models/review');
const AdventureSite = require('../models/adventureSite');

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const site = await AdventureSite.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    site.reviews.push(newReview);
    await newReview.save();
    await site.save();
    req.flash('success', 'Successfully Added Review!');
    res.redirect(`/adventureSites/${site._id}`);

};
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await AdventureSite.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully Deleted Review!')
    res.redirect(`/adventureSites/${id}`);
};