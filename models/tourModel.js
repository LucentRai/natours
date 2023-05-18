const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Tour name must be provided'],
		unique: true,
		trim: true,
		maxlength: [40, 'A tour name must have less or equal than 40 characters'],
		minlength: [5, 'A tour name must have more or equal than 5 characters']
	},
	slug: String,
	rating: {
		type: Number,
		default: 3.5
	},
	ratingsAverage: {
		type: Number,
		default: 4.5,
		min: [1, 'Rating must be above 1.0'],
		max: [5, 'Rating must be below 5.0'],
		set: value => Math.round(value * 10) / 10 // any value to be set is rounded, round() truncate float to integer so we have to use this formula
	},
	ratingsQuantity: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		required: [true, 'Tour must have price']
	},
	priceDiscount: {
		type: Number,
		validate: {
			validator: function(value){
				// this only points to current document object when NEW document is created
				return value < this.price;
			},
			message: 'Discount price ({VALUE}) must be below regular price'
		}
	},
	summary: {
		type: String,
		trim: true,
		required: [true, 'Tour must have a description']
	},
	description: {
		type: String,
		trim: true
	},
	imageCover: {
		type: String,
		required: [true, 'Tour must have a cover image']
	},
	images: [String],
	duration: {
		type: Number,
		default: 3,
		required: [true, 'Tour must have a fixed duration']
	},
	maxGroupSize: {
		type: Number,
		required: [true, 'Tour must have maximum Group size']
	},
	difficulty:{
		type: String,
		required: [true, 'Tour must have difficulty'],
		enum: {
			values: ['easy', 'medium', 'difficult'],
			message: 'Difficulty is either: easy, medium or difficult'
		}
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false
	},
	startDates: [Date],
	secretTour: {
		type: Boolean,
		default: false
	},
	startLocation: {
		type: {
			type: String,
			default: 'Point',
			enum: ['Point']
		},
		coordinates: [Number],
		address: String,
		description: String
	},
	locations: [
		{
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String,
			day: Number
		}
	],
	guides: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'Users'
		}
	]
}, {
	toJSON: { virtuals: true },	// each time data is outputed as JSON, virtuals will be part of output
	toObject: { virtuals: true }	// each time data is outputed as object, virtuals will be part of output
});

// INDICES
tourSchema.index({price: 1, ratingsAverage: -1}); // 1 for ascending, -1 for descending
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'}); // needed for geospatial queries

// every time get() is used, this virtual property is formed but not persisted in Database
tourSchema.virtual('durationWeeks').get(function(){	// regular function is used to access this keyword
	return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
});

// DOCUMENT MIDDLEWARE: .pre() executes before .save() or .create() 
// while .post() executes after .save() or .create()
tourSchema.pre('save', function(next){
	this.slug = slugify(this.name, { lower: true }); // 'this' represents the document to be saved
	next();
});

// tourSchema.post('save', function(doc, next){
// 	next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next){ // uses regular expression; any function starting with 'find' is matched
	this.populate({
		path: 'guides',
		select: '-__v'
	});
	this.find({secretTour: {$ne: true}});
	this.startTime = Date.now();	// current date and time in milliseconds
	next();
});

// tourSchema.post(/^find/, function(documents, next){
// 	console.log(documents);
// 	console.log(`Query took ${Date.now() - this.startTime} milliseconds`);
// 	next();
// });

// AGGREGATION MIDDLEWARE
/*
tourSchema.pre('aggregate', function(next){
	this.pipeline().unshift({ $match: {secretTour: {$ne: true}} });

	if(process.env.NODE_env === 'development'){
		console.log(this.pipeline());
	}

	next();
});
*/
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;