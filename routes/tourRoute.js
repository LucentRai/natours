const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');
const AppError = require('../utils/AppError');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap')
	.get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats')
	.get(tourController.getTourStats);

	router.route('/get-monthly-tours/:year')
	.get(tourController.getMonthlyTours);

router.route('/')
	.get(tourController.getAllTours)
	.post(authController.checkLogin, authController.restrictTo('admin', 'tour-lead'), tourController.postTour);

router.route('/:id')
	.get(tourController.getTour)
	.patch(authController.checkLogin, authController.restrictTo('admin', 'tour-lead'), tourController.patchTour)
	.delete(authController.checkLogin, authController.restrictTo('admin', 'tour-lead'), tourController.deleteTour);


// /tours-within/200/km/location/34.204015,-118.241139
router.route('/tours-within/:distance/:unit/location/:latLon/')
	.get(tourController.getTourWithin);

	// get-distances/km/location/34.204015,-118.241139
router.route('/get-distances/:unit/location/:latLon')
	.get(tourController.getTourDistances);

module.exports = router;