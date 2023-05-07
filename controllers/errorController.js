const AppError = require('../utils/AppError');

module.exports = (error, request, response, next) => {
	error.statusCode = error.statusCode || 500;
	error.status = error.status || 'Error';
	error.message = error.message || 'Something went very wrong';

	if(process.env.NODE_ENV === 'development'){
		sendErrorDev(error, response);
		return;
	}

	let e = { ...error }; // copy object not reference
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
	sendErrorClient(e, response);
	return;
};

function sendErrorDev(error, response){
	response
	.status(error.statusCode)
	.json({
		status: error.status,
		error,
		message: error.message,
		stack: error.stack
	});
}

function sendErrorClient(error, response){
	if(error.isOperational){	// Operational, trusted error
		response
			.status(error.statusCode)
			.json({
				status: error.status,
				message: error.message
			});
	}
	else{	// Programming or other unknown error
		console.error(error); // Log error

		response // send generic message
			.status(500)
			.json({
				status: 'Error',
				message: 'Something went wrong'
			});
	}
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