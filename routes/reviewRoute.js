const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const AppError = require('../utils/AppError');

const router = express.Router({mergeParams: true}); // when mergeParams: true, the request.params of tour routes will be accessible to this route as well

router.use(authController.protectRoute);

router.route('/')
	.get(reviewController.getAllReview)
	.post(authController.protectRoute, authController.restrictTo('user'), reviewController.setTourUserId, reviewController.createReview);

router.route('/:id')
	.get(reviewController.getReview)
	.patch(authController.restrictTo('user', 'admin'), reviewController.patchReview)
	.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;