const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

console.log(typeof(Tour));
console.log(Tour);

dotenv.config({path: path.join(__dirname, '/../../config.env')});

mongoose
	.connect('mongodb://127.0.0.1:27017/tour')
	// .connect(process.env.DB.replace('<password>', process.env.DB_PASSWORD))
	.then(() => console.log('DB connected successfully'))
	.catch(err => console.error(err));

if(process.argv[2] === '--import'){
	importData();
}
else if(process.argv[2] === '--delete'){
	deleteData();
}

// IMPORT DATA INTO DB
async function importData(){
	try{
		const tours = JSON.parse(fs.readFileSync(path.join(__dirname, 'tours.json'), 'utf-8'));
		const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'));
		const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf-8'));

		await Tour.create(tours);
		await User.create(users, {validateBeforeSave: false});
		await Review.create(reviews);
		console.log('Data imported');
	}
	catch(error){
		console.log(error);
	}
	process.exit(); // aggressively ends the process; if you put this outside on the main block, database will not be connected when Model is used (don't know why)
}

// DELETE DATA FROM DB
async function deleteData(){
	try{
		await Tour.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();
		console.log('All Data Deleted');
	}
	catch(error){
		console.log(error);
	}
	process.exit(); // aggressively ends the process; if you put this outside on the main block, database will not be connected when Model is used (don't know why)
}