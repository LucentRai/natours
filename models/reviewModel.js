const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
	review: {
		type: String,
		required: [true, 'Review must have description'],
		trim: true,
		minlength: [10, 'Review should be atleast 10 characters long.'],
		maxlength: [2000, 'Review should not exceed 2000 characters.']
	},
	rating: {
		type: Number,
		default: 3.5
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false
	},
	tour: {
		type: mongoose.Schema.ObjectId,
		ref: 'Tour',
		required: [true, 'Review must belong to a tour.']
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'Users',
		required: [true, 'Review must have reviewer.']
	}
},
{
	toJSON: {virtuals: true},
	toObject: {virtuals: true}
});

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function(next){
	this.populate({
		path: 'user',
		select: 'name photo'
	});

	next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;