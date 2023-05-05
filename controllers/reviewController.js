const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

function setTourUserId(request, response, next){
	// allow nested route
	if(!request.body.user){
		request.body.user = request.userInfo.id;
	}
	if(!request.body.tour){
		request.body.tour = request.params.tourId;
	}
	next();
}

module.exports = {
	setTourUserId,
	getAllReview: factory.getAll(Review),
	getReview: factory.getOne(Review),
	createReview: factory.createOne(Review),
	patchReview: factory.updateOne(Review),
	deleteReview: factory.deleteOne(Review)
}