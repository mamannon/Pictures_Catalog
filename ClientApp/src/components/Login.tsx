import * as React from 'react';
import { Form, Button } from 'semantic-ui-react';
import App from '../App';

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
		let user;
		if (event.target.name === "login") {
			user = {
				mUser: this.state.username,
				mPassword: this.state.password
			}
			if (this.state.username.length < 0 && this.state.password.length < 0) {
				alert("Username or password cant be empty");
				return;
            }
			this.props.login(user);
		} else {
			user = {
				mName: this.state.name,
				mUser: this.state.username,
				mPassword: this.state.password
			}
			if (this.state.name.length < 3 || this.state.username.length < 3 || this.state.password.length < 8) {
				alert("Username and name must be atleast 3 and password 8 characters long.");
				return;
			}
			this.props.subscribe(user);
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
			return (				<Form>
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