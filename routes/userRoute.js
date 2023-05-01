const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.post('/login', authController.login);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// CHECK LOGIN
userRouter.use(authController.checkLogin);

userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch('/updatePassword', authController.updatePassword);
userRouter.patch('/updateMe', userController.updateMe);
userRouter.delete('/deleteMe', userController.deleteMe);

// CHECK IF USER IS ADMIN
userRouter.use(authController.restrictTo('admin'));

userRouter.patch('/:id', userController.updateUser);
userRouter.delete('/delete/:id', userController.deleteUser);
userRouter.route('/')
	.get(userController.getAllUsers)
	.post(userController.postUser);


module.exports = userRouter;