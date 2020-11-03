import * as React from 'react';
import { Form, Button } from 'semantic-ui-react';

export default class Login extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
			name:"",
            username: "",
			password: "",
			loginOrRegister:0
        }
    }

	onChange = (event) => {
		let state = {};
		state[event.target.name] = event.target.value;
		this.setState(state);
	}

	onClick = (event) => {
		event.preventDefault();
		if (this.state.name < 3 || this.state.username.length < 3 || this.state.password.length < 8) {
			alert("Username and name must be atleast 3 and password 8 characters long.");
			return;
		}

		let user = {
			name:this.state.name,
			username: this.state.username,
			password:this.state.password
		}

		if (event.target.name === "login") {
			console.log(user.username + ": is logging in!");
			sessionStorage.setItem("username",user.username);
		} else {
			console.log(user.username + ": is registering!");
			sessionStorage.setItem("username",user.username);
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