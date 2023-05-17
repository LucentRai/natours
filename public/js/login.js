const loginForm = document.querySelector('.form');
// const loginBtn = document.querySelector('.btn .btn-green');

loginForm.addEventListener('submit', event => {
	event.preventDefault();
	const email = document.querySelector('#email').value;
	const password = document.querySelector('#password').value;
	login(email, password);
});

async function login(email, password){
	try{
		const result = await axios({
			method: 'POST',
			url: 'http://localhost:8000/api/v1/users/login',
			data: {
				email,
				password
			}
		});
		console.log(result);
	}
	catch(error){
		console.log(error.response.data); // response.data is the response from server (read axios docs)
	}
}