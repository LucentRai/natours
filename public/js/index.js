import "core-js/stable";
import {displayMap} from "./mapbox";
import {login, logout} from './login';
import {signup} from './signup';
import {updateAccount} from './updateUser';
import {bookTour} from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.signup-form');
const signupBtn = document.getElementById('signup-btn');

// DELEGATION
if(mapBox){
	const locations = JSON.parse(mapBox.dataset.locations);
	displayMap(locations);
}

if(loginForm){
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		login(email, password);
	});
}

if(logoutBtn){
	logoutBtn.addEventListener('click', logout);
}

if(signupForm){
	signupForm.addEventListener('submit', e => {
		e.preventDefault();
		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		const confirmPassword = document.getElementById('confirmPassword').value;
		signup(name, email, password, confirmPassword);
	});
}

if(userDataForm){
	userDataForm.addEventListener('submit', async e => {
		e.preventDefault();
		const form = new FormData();
		form.append('name', document.getElementById('name').value);
		form.append('email', document.getElementById('email').value);
		form.append('photo', document.getElementById('photo').files[0]);
		updateAccount(form, 'data');
	});
}

if(userPasswordForm){
	userPasswordForm.addEventListener('submit', async e => {
		e.preventDefault();
		document.getElementById('save-password-btn').textContent = 'Updating...';

		const currentPassword = document.getElementById('current-password').value;
		const newPassword = document.getElementById('password').value;
		const confirmPassword = document.getElementById('password-confirm').value;

		await updateAccount({currentPassword, newPassword, confirmPassword}, 'password');

		document.getElementById('save-password-btn').textContent = 'Save Password';
		document.getElementById('current-password').value = '';
		document.getElementById('password').value = '';
		document.getElementById('password-confirm').value = '';
	});
}

if(bookBtn){
	bookBtn.addEventListener('click', e => {
		e.target.textContent = 'Processing...';
		const {tourId} = e.target.dataset;
		bookTour(tourId);
	});
}