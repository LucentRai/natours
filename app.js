const express = require('express');
const pug = require('pug');
const path = require('path');
// const helmet = require('helmet'); // This does not work with mapbox api
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const viewRouter = require('./routes/viewRoute');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');

const app = express();

app.set('view engine', 'pug'); // Set template engine to pug
app.set('views', path.join(__dirname, 'views')); // Set views/templates directory location

// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); // all static files will be served through public directory

// Logging in development
if(process.env.NODE_ENV === 'development'){
	const morgan = require('morgan');
	app.use(morgan('dev'));
}

/*** MIDDLEWARE ***/
// Set security HTTP headers
// app.use(helmet());

// Restrict requests to avoid DOS attacks
app.use('/api', rateLimit({
	max: 100, // maximum number of requests from 1 IP in certain window of time
	windowMs: 60 * 60 * 100, // Window in milli seconds
	message: 'Too many requests from this IP, please try again in 1 hour'
}));

// Reading data from body into request.body
app.use(express.json({limit: '10kb'})); // limits the size of request data

// Data sanitization to prevent NoSQL injections
app.use(mongoSanitize()); // replaces mongo operators from user input

// Data sanitization against XSS attacks
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({
	whitelist: [ // allows duplicates in query string
		'duration',
		'ratingsQuantity',
		'ratingsAverage',
		'price',
		'difficulty',
		'maxGroupSize'
	]
}));

/**** ROUTES ****/

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// for unhandled routes
app.all('*', (request, response, next) => {
	next(new AppError(`Cannot find ${request.originalUrl} on the server`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;