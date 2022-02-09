const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const AdventureSite = require('../models/adventureSite');

mongoose.connect('mongodb://localhost:27017/tourificdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await AdventureSite.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const site = new AdventureSite({

            author: '615d3d3d5fb2790b16480919',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/djbomerqh/image/upload/v1634283780/Tourific/nzfpx6olqskxknxemqcg.jpg',
                    filename: 'Tourific/nzfpx6olqskxknxemqcg.jpg'
                },
                {
                    url: 'https://res.cloudinary.com/djbomerqh/image/upload/v1634304391/Tourific/foxtyee9bn1gk1zvqbz1.jpg',
                    filename: 'Tourific/foxtyee9bn1gk1zvqbz1.jpg'
                }
            ]
        })
        await site.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})