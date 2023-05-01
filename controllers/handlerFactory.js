const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createOne = Model =>
	catchAsync(async (request, response, next) => {
		const document = await Model.create(request.body);
		response
			.status(201)
			.json({
				status: "success",
				data: document
			});
	});

exports.getOne = (Model, populateOption) => 
	catchAsync( async (request, response, next) => {
		let query = Model.findById(request.params.id);
		if(populateOption){
			query = query.populate(populateOption);
		}
		const document = await query;

		if(!document){
			return next(new AppError(`No document with id ${request.params.id} found`, 404));
		}

		response
		.status(200)
		.json({
			status: "success",
			data: {
				document
			}
		});
});

exports.getAll = Model =>
	catchAsync( async (request, response, next) => {
		// for nested GET reviews on tour
		let filter = {};
		if(request.params.tourId){
			filter = {
				tour: request.params.tourId
			};
		}

		const features = new APIFeatures(Model.find(filter), request.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();
	
		const document = await features.query.explain();
	
		response
			.status(200)
			.json({
				status: "success",
				result: document.length,
				data: {
					document
				}
			});
	});

exports.getMe = (request, response, next) => {
	request.params.id = request.userInfo._id;
	next();
};

exports.updateOne = Model =>
	catchAsync(async (request, response, next) => {
		const document = await Model.findByIdAndUpdate(request.params.id, request.body, {
			new: true,
			runValidators: true
		});
		
		if(!document){
			return next(new AppError(`No document with id ${request.params.id} found`, 404));
		}
		response
			.status(200)
			.json({
				status: 'success',
				data: document
			});
	});

exports.deleteOne = Model =>
	catchAsync(async (request, response, next) => {
		const document = await Model.findByIdAndDelete(request.params.id);
		if(!document){
			return next(new AppError(`No document with id ${request.params.id} found.`), 404);
		}
		response.status(204).json();
	});