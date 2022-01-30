const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favDishSchema = new Schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dishes'
    }
});

const favouriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // reference to user (mongoose population)
        ref: 'User'
    },
    dishes: [favDishSchema]
}, {
    timestamps: true
});

var Favourites = mongoose.model('Favourites', favouriteSchema);

module.exports = Favourites;