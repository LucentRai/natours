const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

async function getOverview(request, response, next){
	const tours = await Tour.find();
	console.log(typeof(tours));

	response.status(200)
		.render('overview', {
			title: 'All Tours',
			tours
		});
}

function getTour(request, response, next){
	response.status(200)
		.render('tour', {
			title: 'Forest Hiker'
		});
}

module.exports = {
	getOverview: catchAsync(getOverview),
	getTour
};