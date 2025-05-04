import React, { useState, FC } from "react";
import { Button } from '@mui/material';
import { useForm } from "react-hook-form";
import { App } from '../App';

type UserType = {
	mName: string,
    mUser: string,
    mPassword: string
}

interface Props {
    login: (user: UserType) => void,
    subscribe: (user: UserType) => void
}

const Login: FC<Props> = ({ login, subscribe }) => {
	const [loginOrRegister, setLoginOrRegister] = useState<number>(0);
	const [formData, setFormData] = useState({
		name: "",
		username: "",
		password: "",
	});

	const onChange = (event: any) => {
		const { name, value } = event.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	}

	const onLogin = (event: any) => {
		event.preventDefault();
		let user: UserType;
		user = {
			mName: "",
			mUser: formData.username,
			mPassword: formData.password
		}
		if (formData.username.length < 0 && formData.password.length < 0) {
			alert("Username or password cant be empty");
			return;
		}
		login(user);
	}

	const onRegister = (event: any) => {
		event.preventDefault();
		let user: UserType;
		user = {
			mName: formData.name,
			mUser: formData.username,
			mPassword: formData.password
		}
		if (formData.name.length < 3 || formData.username.length < 3 || formData.password.length < 8) {
			alert("Username and name must be atleast 3 and password 8 characters long.");
			return;
		}
		subscribe(user);	
	}

	const loginRegister = (event: any) => {
		if (event.target.name === "login") {
			setLoginOrRegister(1);
		} else {
			setLoginOrRegister(2);
        }
    }

	if (loginOrRegister === 2) {
		return (
			<form onSubmit={onRegister}>
				<fieldset>
					<label htmlFor="name">Your name:</label>
					<input type="text"
						name="name"
						onChange={onChange}
						value={formData.name} />
				</fieldset>
				<fieldset>
					<label htmlFor="username">Username:</label>
					<input type="text"
						name="username"
						onChange={onChange}
						value={formData.username} />
				</fieldset>
				<fieldset>
					<label htmlFor="password">Password:</label>
					<input type="password"
						name="password"
						onChange={onChange}
						value={formData.password} />
				</fieldset>
				<button type="submit">Register</button>
			</form>
		)
	} else if (loginOrRegister === 1) {
		return (
			<form onSubmit={onLogin}>
				<fieldset>
					<label htmlFor="username">Username:</label>
					<input type="text"
						name="username"
						onChange={onChange}
						value={formData.username} />
				</fieldset>
				<fieldset>
					<label htmlFor="password">Password:</label>
					<input type="password"
						name="password"
						onChange={onChange}
						value={formData.password} />
				</fieldset>
				<button type="submit">Login</button>
			</form>
		)
	} else {
		return(
			<div>
				<Button onClick={loginRegister} name="login">Login</Button>
				<Button onClick={loginRegister} name="register">New User</Button>
			</div>
		)
	}
}
export default Login;



/**
 * Alla on JavaScript luokkaversio yläpuolen Typescript-versiosta.
 */



//export default class Login extends React.Component {

//	constructor(props) {
//		super(props);
//		this.state = {
//			name: "",
//			username: "",
//			password: "",
//			loginOrRegister: 0
//		}
//	}

//	onChange = (event) => {
//		let state = {};
//		state[event.target.name] = event.target.value;
//		this.setState(state);
//	}

//	onClick = (event) => {
//		event.preventDefault();
//		let user;
//		if (event.target.name === "login") {
//			user = {
//				mUser: this.state.username,
//				mPassword: this.state.password
//			}
//			if (this.state.username.length < 0 && this.state.password.length < 0) {
//				alert("Username or password cant be empty");
//				return;
//			}
//			this.props.login(user);
//		} else {
//			user = {
//				mName: this.state.name,
//				mUser: this.state.username,
//				mPassword: this.state.password
//			}
//			if (this.state.name.length < 3 || this.state.username.length < 3 || this.state.password.length < 8) {
//				alert("Username and name must be atleast 3 and password 8 characters long.");
//				return;
//			}
//			this.props.subscribe(user);
//		}

//	}

//	loginRegister = (event) => {
//		if (event.target.name === "login") {
//			this.setState({ loginOrRegister: 1 });
//		} else {
//			this.setState({ loginOrRegister: 2 });
//		}
//	}

//	render() {
//		if (this.state.loginOrRegister === 2) {
//			return (
//				<form>
//					<form.Field>
//						<label htmlFor="name">Your name:</label>
//						<input type="text"
//							name="name"
//							onChange={this.onChange}
//							value={this.state.name} />
//					</form.Field>
//					<form.Field>
//						<label htmlFor="username">Username:</label>
//						<input type="text"
//							name="username"
//							onChange={this.onChange}
//							value={this.state.username} />
//					</form.Field>
//					<Form.Field>
//						<label htmlFor="password">Password:</label>
//						<input type="password"
//							name="password"
//							onChange={this.onChange}
//							value={this.state.password} />
//					</Form.Field>
//					<Button onClick={this.onClick} name="register">Register</Button>
//				</form>
//			)
//		} else if (this.state.loginOrRegister === 1) {
//			return (<form>
//				<form.Field>
//					<label htmlFor="username">Username:</label>
//					<input type="text"
//						name="username"
//						onChange={this.onChange}
//						value={this.state.username} />
//				</form.Field>
//				<form.Field>
//					<label htmlFor="password">Password:</label>
//					<input type="password"
//						name="password"
//						onChange={this.onChange}
//						value={this.state.password} />
//				</form.Field>
//				<Button onClick={this.onClick} name="login">Login</Button>
//			</form>
//			)
//		} else {
//			return (
//				<div>
//					<Button onClick={this.loginRegister} name="login">Login</Button>
//					<Button onClick={this.loginRegister} name="register">New User</Button>
//				</div>
//			)
//		}
//	}
//}