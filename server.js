const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require('./app');

mongoose
	// .connect(process.env.DB.replace('<password>', process.env.DB_PASSWORD))
	.connect(process.env.DB_LOCAL)
	.then(() => console.log('Database Connected'));

const server = app.listen(process.env.PORT, () => {
	console.log(`App running on port ${process.env.PORT}`);
});

process.on('unhandledRejection', err => {
	console.log(err.name, err.message);
	console.log('Unhandled Rejection: Shutting down...');

	server.close(() => {
		process.exit(1); // 1 for app failure, 0 for successful run
	});
});

process.on('unhandledException', err => {
	console.log(err);
	console.log('Unhandled Exception: Shutting Down...');
	process.exit(1);
});