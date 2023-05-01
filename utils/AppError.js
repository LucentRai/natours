class AppError extends Error{
	constructor(message, statusCode){
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';
		this.isOperational = true;

		Error.captureStackTrace(this, this.contructor);
		// When this contructor is called, this function call is not
		// going to appear in the stack trace
	}
}

module.exports = AppError;