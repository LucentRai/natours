const { query } = require('express');
const { post } = require('../app');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');
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

module.exports = {
	getAllTours: factory.getAll(Tour),
	getTour: factory.getOne(Tour, {path: 'reviews'}),
	postTour: factory.createOne(Tour),
	patchTour: factory.updateOne(Tour),
	deleteTour: factory.deleteOne(Tour),
	aliasTopTour,
	getTourStats: catchAsync(getTourStats),
	getMonthlyTours: catchAsync(getMonthlyTours)
}