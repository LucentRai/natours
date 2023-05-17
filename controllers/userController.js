const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');

async function getAllUsers(request, response){
	const users = await User.find();

	response
		.status(200)
		.json({
			status: "sucess",
			data: users
		});
}

function postUser(request, response){
	response
		.status(500)
		.json({
			status: "fail",
			message: "This route is not yet defined. Please use sign up page"
		});
}

async function updateMe(request, response, next){
	// if user POSTs password data
	if(request.body.password){
		return next(new AppError('This route is not for updating passwords. Please use /updatePassword'), 400);
	}

	// filter unwanted request body fields
	const filteredBody = filterRequestBody(request.body, 'name', 'email');

	// update user document
	const updatedUser = await User.findByIdAndUpdate(request.userInfo._id, filteredBody, {new: true, runValidators: true});

	response
		.status(200)
		.json({
			status: 'success',
			user: updatedUser
		});
}

async function deleteMe(request, response, next){
	await User.findByIdAndUpdate(request.userInfo._id, {active: false});

	response.status(204).json({status: 'success'});
}

function filterRequestBody(body, ...allowedFields){
	const newObj = {};

	Object
		.keys(body)
		.forEach(el => {
			if(allowedFields.includes(el)){
				newObj[el] = body[el];
			}
		});

	return newObj;
}

module.exports = {
	postUser,
	getAllUsers: factory.getAll(User),
	getUser: factory.getOne(User),
	getMe: factory.getMe,
	updateUser: factory.updateOne(User), // DON'T CHANGE PASSWORD WITH THIS
	deleteUser: factory.deleteOne(User),
	updateMe: catchAsync(updateMe),
	deleteMe: catchAsync(deleteMe)
};