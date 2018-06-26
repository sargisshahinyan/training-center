import React from 'react';
import { Redirect } from 'react-router-dom';
import './login.css';

//Models
import Users from '../../models/users';

export default class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			redirect: null
		};
		
		Users.checkUser().then(() => {
			this.setState({
				redirect: true
			});
		}, () => {
			this.setState({
				redirect: false
			});
		});
		
		this.logIn = this.logIn.bind(this);
	}
	
	logIn(e) {
		e.preventDefault();
		for(let key in this.state) {
			if(key === 'redirect') {
				continue;
			}

			if(!this.state[key]) {
				alert(`${key.replace(/^./, l => l.toUpperCase())} is missing`);
				return;
			}
		}

		Users.authUser(this.state.username, this.state.password).then(user => {
			Users.setUser(user);
			this.setState({
				redirect: true
			});
		});
	}
	
	render() {
		switch (this.state.redirect) {
			case null:
				return null;
			case true:
				return <Redirect to='/home' />;
			default:
				return (
					<form onSubmit={this.logIn} className="auth">
						<div className="container">
							<label><b>Username</b></label>
							<input type="text" placeholder="Enter Username" onInput={(e) => this.setState({username: e.target.value})} required />
							
							<label><b>Password</b></label>
							<input type="password" placeholder="Enter Password" onInput={(e) => this.setState({password: e.target.value})} required />
							
							<button type="submit">Login</button>
						</div>
					</form>
				);
		}
	}
}