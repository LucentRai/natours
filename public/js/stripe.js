import axios from 'axios';
import {showAlert} from './alerts';
const stripe = Stripe('pk_test_51OA4ehEmwtLQsBKSTqutPUgftELZYihxWTvXgG22IpZ16rZPCiQ8i3q91PMOB1EOnPscEJ4IXK5IRs9O4ALMXQwX00JAUzXZ5U');

export async function bookTour (tourId) {
	try {
		// 1) Get checkout session from API
		const session = await axios(`http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`);
	
		// 2) Create checkout form + charge credit card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id
		});
	}
	catch(err) {
		console.log(err);
		showAlert('error', err);
	}
}