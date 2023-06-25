import "core-js/stable";
import { displayMap } from "./mapbox";
import {login, logout} from './login';
import {updateAccount} from './updateUser';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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

if(userDataForm){
	userDataForm.addEventListener('submit', async e => {
		e.preventDefault();
		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		updateAccount({name, email}, 'data');
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