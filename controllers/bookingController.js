const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/AppError');

async function getCheckoutSession(request, response, next) {
	const tour = await Tour.findById(request.params.tourId);

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		success_url: `${request.protocol}://${request.get('host')}/`,
		cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
		customer_email: request.userInfo.email,
		client_reference_id: request.params.tourId,
		line_items: [{
			price_data: {
				currency: 'usd',
				unit_amount: tour.price * 100,
				product_data: {
					name: `${tour.name} Tour`,
					description: tour.summary,
					images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
				}
			},
			quantity: 1
		}],
		mode: 'payment'
	});

	response.status(200).json({
		status: 'success',
		session
	});
}

module.exports = {
	getCheckoutSession: catchAsync(getCheckoutSession)
};