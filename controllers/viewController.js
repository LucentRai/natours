const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

async function getOverview(request, response, next){
	const tours = await Tour.find();
	response.status(200)
		.render('overview', {
			title: 'All Tours',
			tours
		});
}

async function getTour(request, response, next){
	const tour = await Tour.findOne({slug: request.params.slug}).populate({
		path: 'reviews',	// name of virtual populate path
		fields: 'review rating user' // fields to populate
	});

	if(!tour){
		return next(new AppError(`This page does not exist`, 404));
	}

	response.status(200).render('tour', {
		title: tour.name,
		tour
	});
}

module.exports = {
	getOverview: catchAsync(getOverview),
	getTour: catchAsync(getTour)
};