const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('../controllers/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');


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
	if(request.file){
		filteredBody.photo = request.file.filename;
	}

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


/***************** USER PHOTO UPLOAD *****************/
const userImageLocation = 'public/img/users';

// For Direct Disk Storage

// const multerStorage = multer.diskStorage({
// 	destination: (req, file, callback) => {
// 		callback(null, userImageLocation);
// 	},
// 	filename: (req, file, callback) => {
// 		const extension = file.mimetype.split('/')[1];
// 		callback(null, `user-${req.userInfo.id}-${Date.now()}.${extension}`);
// 	}
// });

const multerStorage = multer.memoryStorage();

function multerFilter(request, file, callback){
	if(file.mimetype.startsWith('image')){
		callback(null, true);
	}
	else{
		callback(new AppError('Not an image! Please upload images only', 400), false);
	}
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

async function resizeUserPhoto(request, response, next){
	if(!request.file){
		next();
	}

	request.file.filename = `user-${request.userInfo.id}-${Date.now()}.jpeg`;

	await sharp(request.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({quality: 90})
		.toFile(`${userImageLocation}/${request.file.filename}`);

	next();
}


module.exports = {
	postUser,
	getAllUsers: factory.getAll(User),
	getUser: factory.getOne(User),
	getMe: factory.getMe,
	updateUser: factory.updateOne(User), // DON'T CHANGE PASSWORD WITH THIS
	deleteUser: factory.deleteOne(User),
	updateMe: catchAsync(updateMe),
	deleteMe: catchAsync(deleteMe),
	uploadUserPhoto: upload.single('photo'),
	resizeUserPhoto: catchAsync(resizeUserPhoto)
};