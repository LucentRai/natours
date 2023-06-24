import axios from 'axios';
import { showAlert } from './alerts';

export async function login(email, password){
	try{
		const result = await axios({
			method: 'POST',
			url: 'http://localhost:8000/api/v1/users/login',
			data: {
				email,
				password
			}
		});

		if(result.data.status === 'success'){
			showAlert('success', 'Logged in successfully!');
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	}
	catch(error){
		showAlert('error', error.response.data.message);
	}
}