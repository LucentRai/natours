import axios from 'axios';
import { showAlert } from './alerts';

export async function updateAccount(data, type){ // type can be 'password' or 'data'
	let url = '/api/v1/users/';

	if(type === 'password'){
		url += 'updatePassword';
	}
	else{
		url += 'updateMe';
	}

	try{
		const result = await axios({
			method: 'PATCH',
			url,
			data
		});

		if(result.data.status === 'success'){
			showAlert('success', 'Data Updated Successfully');
			window.setTimeout(() => {
				location.reload(true);
			}, 1500);
		}
	}
	catch(error){
		showAlert('error', error.response.data.message);
	}
};