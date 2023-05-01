const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'User must have name'],
		trim: true,
		maxlength: [50, 'User name must have less or equal than 50 characters'],
		minlength: [3, 'User name must have more or equal than 3 characters']
	},
	email: {
		type: String,
		required: [true, 'User Email must be provided'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	photo: {
		type: String
	},
	role: {
		type: String,
		enum: ['admin', 'tour-lead', 'guide', 'user'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, 'Password must be set'],
		minlength: [8, 'Password must be at least 8 characters long'],
		select: false // never select this field from database
	},
	confirmPassword: {
		type: String,
		required: [true, 'Confirmation password must be set'],
		validate: {
			validator: function(p){ // This only works on create() and save()
				return p === this.password;
			},
			message: "Passwords must match"
		}
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false // this is user defined field; select this document if select is true
	}
});

userSchema.pre(/^find/, function(next){
	this.find({active: {$ne: false}});
	next();
});

userSchema.pre('save', async function(next){
	// hash password if password field is modified
	if(!this.isModified('password')){
		next();
	}

	// 12 is the cost. Higher the cost, more CPU intensive
	this.password = await bcrypt.hash(this.password, 12);

	// Delete confirmPassword field
	this.confirmPassword = undefined;
	next();
});
userSchema.pre('save', function(next){
	if(!this.isModified('password') || this.isNew){
		return next();
	}

	this.passwordChangedAt = Date.now() - 1000; // 1 second is subtracted to make sure that login JWT is assigned after this time (sometimes writing to database is slower than issuing JWT)
	next();
});

// static instance methods
userSchema.methods.isPasswordCorrect = async function(inputPassword, actualPassword){
	return await bcrypt.compare(inputPassword, actualPassword);
}
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
	if(this.passwordChangedAt){
		const changedTime = parseInt(this.passwordChangedAt / 1000, 10); // convert to milliseconds, base 10

		return changedTime > JWTTimestamp; // was password changed after token was issued
	}
	return false;
}
userSchema.methods.createResetPasswordToken = function(){
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes after this

	return resetToken;
}

const Users = mongoose.model('Users', userSchema);
module.exports = Users;