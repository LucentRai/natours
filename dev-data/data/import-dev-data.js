const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({path: '../../config'});

mongoose
	.connect('mongodb://127.0.0.1:27017/tour')
	// .connect(process.env.DB.replace('<password>', process.env.DB_PASSWORD))
	.then(() => console.log('DB connected successfully'))
	.catch(err => console.error(err));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
async function importData(){
	try{
		await Tour.create(tours);
		await User.create(users, {validateBeforeSave: false});
		await Review.create(reviews);
		console.log('Data imported');
	}
	catch(error){
		console.log(error);
	}
	process.exit();
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
	process.exit();
}

if(process.argv[2] === '--import'){
	importData();
}
else if(process.argv[2] === '--delete'){
	deleteData();
}
