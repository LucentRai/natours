const { query } = require('express');
const { post } = require('../app');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

function aliasTopTour(request, response, next){ // Middleware for top-5-cheap route
	request.query.limit = '5'; // query field should be string
	request.query.sort = 'price,-ratingsAverage';
	request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
}

async function getTourStats(request, response){
	const tourStat = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } }
		},
		{
			$group: {
				_id: '$difficulty',	// groups documents based on difficulty
				numTours: { $sum: 1 },	// for every document that goes through this pipeline, 1 is added
				numRatings: { $sum: '$ratingsQuantity' },
				avgRating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' }
			}
		},
		{ // Here field names of the collection is not available, only fields inside $group is
			$sort: { avgPrice: 1 }	// 1 meaning ascending order, -1 means descending
		}
	]);

	response
		.status(200)
		.json({
			status: 'success',
			data: tourStat
		});
}

async function getMonthlyTours(request, response){
	const year = request.params.year * 1;

	const monthlyTours = await Tour.aggregate([
		{
			$unwind: '$startDates'	// deconstructs array field into multiple separate documents
		},
		{
			$match: {
				startDates: {	// startDates between first and last date of the year
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`)
				}
			}
		},
		{
			$group: {
				_id: { $month: '$startDates' },
				numTourStarts: { $sum: 1 },
				tourName: { $push: '$name' }	// pushes tour names into an array
			}
		},
		{
			$addFields: { month: '$_id' }	// adds field 'month' with value of _id of $group
		},
		{
			$project: { _id: 0 } // 0 means don't show this field
		},
		{
			$sort: { numTourStarts: -1 }	// 1 for sorting in ascending order, -1 for descending
		}
	]);

	response
		.status(200)
		.json({
			status: 'success',
			data: monthlyTours
		});
}

async function getTourWithin(request, response, next){
	const {distance, unit, latLon} = request.params;
	const [latitude, longitude] = latLon.split(',');
	const radius = unit === 'km' ? distance / 6378.1: distance / 3963.2; // in unit radians; distance divided by radius of earth

	if(!latitude || !longitude){
		next(new AppError(`Provide latitude and longitude data in "lat,lon" format`, 400));
	}

	const tours = await Tour.find({
		startLocation: {$geoWithin: {$centerSphere: [[longitude, latitude], radius]}}
	});

	response
		.status(200)
		.json({
			status: 'success',
			results: tours.length,
			data: tours
		});
}

async function getTourDistances(request, response, next){
	const {latLon, unit} = request.params;
	const [latitude, longitude] = latLon.split(',');
	const multiplier = unit === 'km' ? 0.001 : 0.000621371; // distance is provided in meters; 1m = 0.001km, 1m = 000621371mi

	if(!latitude || !longitude){
		next(new AppError(`Provide latitude and longitude data in "lat,lon" format`, 400));
	}

	const distances = await Tour.aggregate([
		{
			$geoNear: { // $geoNear should always come before any other property in whole aggregate pipeline
				near: {
					type: "Point",
					// coordinates: c
					coordinates: [longitude * 1, latitude * 1] // converting string to integer
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier
			}
		},
		{
			$project: { // show the following properties; 1 means yes
				distance: 1,
				name: 1
			}
		}
	]);

	response
		.status(200)
		.json({
			data: distances
	});
}

module.exports = {
	getAllTours: factory.getAll(Tour),
	getTour: factory.getOne(Tour, {path: 'reviews'}),
	postTour: factory.createOne(Tour),
	patchTour: factory.updateOne(Tour),
	deleteTour: factory.deleteOne(Tour),
	aliasTopTour,
	getTourStats: catchAsync(getTourStats),
	getMonthlyTours: catchAsync(getMonthlyTours),
	getTourWithin: catchAsync(getTourWithin),
	getTourDistances: catchAsync(getTourDistances)
};