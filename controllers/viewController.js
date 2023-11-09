const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
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

function getLoginForm(request, response) {
	response.status(200).render('login', {
		title: 'Login'
	});
}

function getAccount(request, response) {
	response.status(200).render('account', {
		title: `${request.userInfo.name} Profile`
	});
}

async function getMyTours(request, response, next) {
	const bookings = await Booking.find({user: request.userInfo.id});

	const tourIds = bookings.map(booking => booking.tour);
	const tours = await Tour.find({ _id: {$in: tourIds} });

	response.status(200).render('overview', {
		title: 'My Tours',
		tours
	});
}

module.exports = {
	getOverview: catchAsync(getOverview),
	getTour: catchAsync(getTour),
	getLoginForm,
	getAccount,
	getMyTours: catchAsync(getMyTours)
};