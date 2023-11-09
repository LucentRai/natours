const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Email = require('../utils/email');

async function signup(request, response, next){
	const newUser = await User.create({
		name: request.body.name,
		email: request.body.email,
		password: request.body.password,
		confirmPassword: request.body.confirmPassword
	});
	const url = `${request.protocol}://${request.get('host')}/me`;

	await new Email(newUser, url).sendWelcome();

	sendTokenResponse(newUser, 201, response);
}

async function login(request, response, next){
	const {email, password} = request.body;

	if(!email || !password){ // check if email and password exist
		return next(new AppError('Email and password required.', 400));
	}

	const user = await User.findOne({email}).select('+password'); // explicitly mentioning to select password also
	if(!user || !(await user.isPasswordCorrect(password, user.password))){
		return next(new AppError('Email or password invalid', 401));
	}

	sendTokenResponse(user, 200, response);
}

async function logout(request, response){
	response.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});

	response.status(200)
		.json({
			status: "success"
		});
}

async function forgotPassword(request, response, next){
	// find user
	const user = await User.findOne({email: request.body.email});
	if(!user){
		return next(new AppError('Could not find user with that email', 404));
	}

	// generate random password reset token
	const resetToken = user.createResetPasswordToken();
	await user.save({validateBeforeSave: false}); // confirmPassword field is required for validation while saving. So validation is turned off

	// Send mail
	try{
		const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/resetPassword/${resetToken}`;
		await new Email(user, resetURL).sendPasswordReset();

		sendTokenResponse(user, 200, response);
		return;
	}
	catch(err){
		user.passwordResetExpires = undefined;
		user.passwordResetToken = undefined;
		user.save({validateBeforeSave: false});
		next(new AppError('Failed to send password reset email.', 500));
	}
}

async function resetPassword(request, response, next){
	// Get user based on the token
	const hashedToken = crypto
		.createHash('sha256')
		.update(request.params.token)
		.digest('hex');
	const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}}); // find user with the token and make sure it's not expired

	// if token has not expired, set new password
	if(!user){
		return next(new AppError('Token invalid or expired', 400));
	}

	user.password = request.body.password;
	user.confirmPassword = request.body.confirmPassword;
	user.passwordResetExpires = undefined;
	user.passwordResetToken = undefined;
	await user.save();

	// Update changedPasswordAt property of user

	// Send JWT to log the user in
	sendTokenResponse(user, 200, response);
}

async function updatePassword(request, response, next){
	// Get user from collection
	const user = await User.findById(request.userInfo.id).select('+password'); // request.userInfo comes from protectRoute()

	// Check if POSTed current password is correct
	if(!(await user.isPasswordCorrect(request.body.currentPassword, user.password))){
		return next(new AppError('Incorrect password', 400));
	}

	// update password
	user.password = request.body.newPassword;
	user.confirmPassword = request.body.confirmPassword;
	await user.save(); // here User.findByIdAndUpdate() will not work as intended

	// Log user in, send JWT
	sendTokenResponse(user, 200, response);
}


async function protectRoute(request, response, next){
	let token;

	// check if JWT exits
	if(request.headers.authorization && request.headers.authorization.startsWith('Bearer')){
		token = request.headers.authorization.split(' ')[1];
	}
	else if(request.cookies.jwt){
		token = request.cookies.jwt;
	}

	if(!token){
		next(new AppError('Please login to view this page', 401));
	}

	// JWT Verification
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// if user is deleted
	const userInfo = await User.findById(decoded.id);
	if(!userInfo){
		return next(new AppError('The user no longer exists', 401));
	}

	// if password is changed after JWT was issued
	if(userInfo.changedPasswordAfter(decoded.iat)){ // iat: "issued at"
		return next(new AppError('User recently changed password. Please login again', 401));
	}

	// Grant Access to protected route
	request.userInfo = userInfo;
	response.locals.user = userInfo;
	next();
}

async function isLoggedIn(request, response, next){
	let token;

	try{
		if(request.cookies.jwt){
			token = request.cookies.jwt;
		}

		if(!token){
			return next();
		}

		// JWT Verification
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		// if user is deleted
		const userInfo = await User.findById(decoded.id);
		if(!userInfo){
			return next();
		}

		// if password is changed after JWT was issued
		if(userInfo.changedPasswordAfter(decoded.iat)){ // iat: "issued at"
			return next();
		}

		response.locals.user = userInfo; // available to pug templates
	}
	catch(err){
		return next();
	}
	next();
}

function generateToken(id){
	return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});
}

function restrictTo(...roles){
	return (request, response, next) => {
		if(!roles.includes(request.userInfo.role)){
			next(new AppError('You are not authorized to do this operation.', 403));
		}
		next();
	};
}

function sendTokenResponse(user, statusCode, response){
	const token = generateToken(user._id);

	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_EXPIRATION_JS * 24 * 60 * 60 * 1000),
		httpOnly: true // cookie cannot be accessed or modified by the browser
	}
	if(process.env.NODE_ENV === 'production'){
		cookieOptions.secure = true; // send cookie only on HTTPS
	}

	user.password = undefined; // remove password fields if selected

	response.cookie('jwt', token, cookieOptions);

	response
		.status(statusCode)
		.json({
			status: 'success',
			token,
			data: {user}
		});
}

module.exports = {
	signup: catchAsync(signup),
	login: catchAsync(login),
	logout: catchAsync(logout),
	protectRoute: catchAsync(protectRoute),
	isLoggedIn,
	restrictTo,
	forgotPassword: catchAsync(forgotPassword),
	resetPassword: catchAsync(resetPassword),
	updatePassword: catchAsync(updatePassword)
};