const AppError = require('../utils/AppError');

module.exports = (error, request, response, next) => {
	error.statusCode = error.statusCode || 500;
	error.status = error.status || 'Error';
	error.message = error.message || 'Something went very wrong';

	if(process.env.NODE_ENV === 'development'){
		sendErrorDev(error, request, response);
		return;
	}

	let e = { ...error }; // copy object by value not reference
	if(error.name === 'CastError'){ // for CastError type errors (invalid DB id)
		e = handleCastErrorDB(error);
	}
	if(error.code === 11000){ // for duplicate fields in DB error
		e = handleDuplicateFieldsDB(error);
	}
	if(error.name === 'ValidationError'){
		e = handleValidationError(error);
	}
	if(error.name === 'JsonWebTokenError'){
		e = handleJWTError();
	}
	if(error.name === 'TokenExpiredError'){
		e = handleJWTExpire();
	}

	e.message = error.message;
	sendErrorClient(e, request, response);
	return;
};

function sendErrorDev(error, request, response){
	// for API
	if(request.originalUrl.startsWith('/api')){
		return response
		.status(error.statusCode)
		.json({
			status: error.status,
			error,
			message: error.message,
			stack: error.stack
		});
	}

	// for rendered website
	response.status(error.statusCode)
		.render('error', {
			title: 'ERROR',
			message: error.message
		});
}

function sendErrorClient(error, request, response){
	// for API
	if(request.originalUrl.startsWith('/api')){
		if(error.isOperational){	// Operational, trusted error
			return response
				.status(error.statusCode)
				.json({
					status: error.status,
					message: error.message
				});
		}
		// Programming or other unknown error
		console.error(error);
		return response // send generic message
			.status(500)
			.json({
				status: 'Error',
				message: 'Something went wrong'
			});
	}

	// for rendered website
	if(error.isOperational){	// Operational, trusted error
		return response
			.status(error.statusCode)
			.render('error', {
				title: 'Something went wrong',
				message: error.message
			});
	}
	// Programming or other unknown error
	console.error(error);
	response // send generic message
		.status(500)
		.render('error', {
			title: 'Something went wrong',
			message: 'Something went wrong'
		});
}

function handleCastErrorDB(error){
	const message = `Invalid ${error.path}: ${error.value}`;
	return new AppError(message, 400);
}

function handleDuplicateFieldsDB(error){
	const value = error.message.match(/(["'])(\\?.)*?\1/)[0]; // match string that is between double quotes and select first string of array

	const message = `Duplicate field value: ${value}. Please use another value.`;
	return new AppError(message, 400);
}

function handleValidationError(error){
	const errorArray = Object.values(error.errors).map(element => element.message); // for every validation error, extract error message
	const message = `Invalid input data. ${errorArray.join('. ')}`;

	return new AppError(message, 400);
}

function handleJWTError(){
	return new AppError('Invalid Token. Please login', 401);
}
function handleJWTExpire(){
	return new AppError('Token Expired. Please login again', 401);
}