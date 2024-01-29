import axios from 'axios';
import { showAlert } from './alerts';

export async function signup(name, email, password, confirmPassword){
	try {
		const result = await axios({
			method: 'POST',
			url: '/api/v1/users/signup',
			data: {
				name,
				email,
				password,
				confirmPassword
			}
		});

		if(result.data.status === 'success'){
			showAlert('success', 'Account created successfully!');
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	}
	catch(error){
		showAlert('error', error.response.data.message);
	}
}