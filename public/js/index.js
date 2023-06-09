console.log('Hello World');
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {login} from './login.js';
import {displayMap} from './mapbox.js';

// DOM ELEMENTS
const mapBox = document.getElementById('map');

// VALUES
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

// DELEGATION
if(mapBox){
	const locations = JSON.parse(mapBox.dataset.locations);
	displayMap(locations);
}

document.querySelector('.form').addEventListener('submit', e => {
	e.preventDefault();
	login(email, password);
});