const express = require('express');
const viewController = require('../controllers/viewController');

const viewRouter = express.Router();

viewRouter.get('/', viewController.getOverview);
viewRouter.get('/tour/:slug', viewController.getTour);
viewRouter.get('/login', viewController.getLogin);

module.exports = viewRouter;