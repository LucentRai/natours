const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/', viewController.getOverview);
viewRouter.get('/tour/:slug', authController.checkLogin, viewController.getTour);
viewRouter.get('/login', viewController.getLoginForm);

module.exports = viewRouter;