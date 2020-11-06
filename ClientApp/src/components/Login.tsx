import { Session } from 'inspector';
import * as React from 'react';
import { Form, Button } from 'semantic-ui-react';

export default class Login extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
			name:"",
            username: "",
			password: "",
			loginOrRegister: 0
        }
    }

	onChange = (event) => {
		let state = {};
		state[event.target.name] = event.target.value;
		this.setState(state);
	}

	onClick = (event) => {
		event.preventDefault();
		let user;
		if (event.target.name === "login") {
			if (this.state.username.length < 0 && this.state.password.length < 0) {
				alert("Username or password cant be empty");
				return;
			} else {
				//tarkistetaan tietokannasta vastaavuus
				user = {
					mUsername: this.state.username,
					mPassword: this.state.password
				}

				let request = {
					method: "POST",
					headers: { "Content-type": "application/json" },
					body: JSON.stringify(user)
				}
				fetch("api/Pictures/Login", request).then(response => {
					if (response.ok) {
						response.json().then(data => {
							if (data) {
								this.props.userLoggedIn(data);
								sessionStorage.setItem("user", user.mUsername);
							}else 
								alert("User not found");
						}).catch(error => {
							console.log("Error parsing JSON: ", error);
						});
                    }
				}).catch(error => {
					console.log("Server responded with error: ", error);
				});
            }
		} else {
			if (this.state.name.length < 3 || this.state.username.length < 3 || this.state.password.length < 8) {
				alert("Username and name must be atleast 3 and password 8 characters long.");
				return;
			} else {
				//viedään uusi käyttäjä kantaan
				user = {
					mName: this.state.name,
					mUsername: this.state.username,
					mPassword: this.state.password
				}
				let request = {
					method: "POST",
					headers: { "Content-type": "application/json" },
					body: JSON.stringify(user)
				}
				fetch("api/Pictures/Register", request).then(response => {
					if (response.ok) {
						response.json().then(data => {
							if (data) {
								this.props.userLoggedIn(data);
								sessionStorage.setItem("user",user.mUsername);
								alert("Register successful!");
							}
						}).catch(error => {
							console.log("Error parsing JSON: ", error);
						});
					}
				}).catch(error => {
					console.log("Server responded with error: ", error);
				});
            }
        }
		
	}

	loginRegister = (event) => {
		if (event.target.name === "login") {
			this.setState({ loginOrRegister: 1 });
		} else {
			this.setState({ loginOrRegister: 2 });
        }
    }

	render() {
		if (this.state.loginOrRegister === 2) {
			return (
				<Form>
					<Form.Field>
						<label htmlFor="name">Your name:</label>
						<input type="text"
							name="name"
							onChange={this.onChange}
							value={this.state.name} />
					</Form.Field>
					<Form.Field>
						<label htmlFor="username">Username:</label>
						<input type="text"
							name="username"
							onChange={this.onChange}
							value={this.state.username} />
					</Form.Field>
					<Form.Field>
						<label htmlFor="password">Password:</label>
						<input type="password"
							name="password"
							onChange={this.onChange}
							value={this.state.password} />
					</Form.Field>
					<Button onClick={this.onClick} name="register">Register</Button>
				</Form>
			)
		} else if (this.state.loginOrRegister === 1) {
			return (
				<Form>
					<Form.Field>
						<label htmlFor="username">Username:</label>
						<input type="text"
							name="username"
							onChange={this.onChange}
							value={this.state.username} />
					</Form.Field>
					<Form.Field>
						<label htmlFor="password">Password:</label>
						<input type="password"
							name="password"
							onChange={this.onChange}
							value={this.state.password} />
					</Form.Field>
					<Button onClick={this.onClick} name="login">Login</Button>
				</Form>
			)
		} else {
			return(
				<div>
					<Button onClick={this.loginRegister} name="login">Login</Button>
					<Button onClick={this.loginRegister} name="register">New User</Button>
				</div>
			)
		}
	}

}