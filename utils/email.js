const {convert} = require('html-to-text');
const pug = require('pug');
const nodemailer = require('nodemailer');

class Email{
	constructor(user, url){
		this.to = user.email;
		this.firstName = user.name.split(' ')[0];
		this.url = url;
		this.from = `Lucent Rai <${process.env.EMAIL_FROM}>`;
	}

	newTransport(){
		if(process.env.NODE_ENV === 'production'){
			return;
		}

		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth:{
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD
			}
		});
	}

	// sends the actual email
	async send(template, subject){
		// Render HTML based on pug template
		const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
		{
			firstName: this.firstName,
			url: this.url,
			subject
		});

		// Email options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: convert(html)
		};

		// Create transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendWelcome(){
		this.send('welcome', 'Welcome to Natours Family');
	}
}


module.exports = Email;