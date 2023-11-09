const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
		ref: 'User',
		required: [true, 'Review must have reviewer.']
	}
},
{
	toJSON: {virtuals: true},
	toObject: {virtuals: true}
});

reviewSchema.index({tour: 1, user: 1}, {unique: true});

// AGGREGATE STATIC INSTANCE METHOD
reviewSchema.statics.calculateAverageRatings = async function (tourId){
	const stats = await this.aggregate([
		{
			$match: {tour: tourId}
		},
		{
			$group : {
				_id: '$tour',
				numRatings: {$sum: 1},
				avgRating: {$avg: '$rating'}
			}
		}
	]);

	if(stats.length > 0){
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].numRatings,
			ratingsAverage: stats[0].avgRating
		});
	}
	else{
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5 // Default value
		});
	}
};

// QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next){
	this.populate({
		path: 'user',
		select: 'name photo'
	});

	next();
});

//for findByIdAndUpdate() & findByIdAndDelete()
// these functions call findOneAndUpdate() & findOneAndDelete()
reviewSchema.pre(/^findOneAnd/, async function(next){;
	this.r = await this.findOne().clone(); // executing same query twice will result in error so use clone() https://mongoosejs.com/docs/migrating_to_6.html#duplicate-query-execution
	next();
});
reviewSchema.post(/^findOneAnd/, async function(){
	// this.review = await this.findOne(); does not work here because, query has already been executed
	await this.r.constructor.calculateAverageRatings(this.r.tour);
});

reviewSchema.post('save', function (next){
	// 'this' points to current review document; constructor is necessary because the calculateAverageRatings is static
	this.constructor.calculateAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;