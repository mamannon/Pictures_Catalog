import * as React from 'react';
import { Form, Button } from 'semantic-ui-react';

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password:""
        }
    }

	onChange = (event) => {
		let state = {};
		state[event.target.name] = event.target.value;
		this.setState(state);
	}

	onClick = (event) => {
		event.preventDefault();
		if (this.state.username.length < 3 || this.state.password.length < 8) {
			alert("Username must be atleast 3 and password 8 characters long.");
			return;
		}

		let user = {
			username: this.state.username,
			password:this.state.password
		}

		if (event.target.name === "login") {
			console.log(user.username + ": is logging in!");
		} else {
			console.log(user.username + ": is registering!");
        }
    }

    render() {
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
				<Button onClick={this.onClick} name="register">Register</Button>
				<Button onClick={this.onClick} name="login">Login</Button>
			</Form>
		)
    }

}