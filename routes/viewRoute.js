const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const viewRouter = express.Router();

viewRouter.get('/me', authController.protectRoute, viewController.getAccount);

viewRouter.use(authController.isLoggedIn);

viewRouter.get('/', bookingController.createBookingCheckout, viewController.getOverview);
viewRouter.get('/tour/:slug', viewController.getTour);
viewRouter.get('/login', viewController.getLoginForm);

module.exports = viewRouter;