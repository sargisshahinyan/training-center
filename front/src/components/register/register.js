import React from 'react';
import './register.css';

import Photos from '../../models/photos';
import Users from "../../models/users";

export default class Register extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			username: '',
			password: '',
			passwordConf: '',
			avatar: '/img/upload.PNG'
		};
		
		this.signUp = this.signUp.bind(this);
		this.assign = this.assign.bind(this);
		this.showPicture = this.showPicture.bind(this);
	}
	
	signUp(e) {
		e.preventDefault();

		for(let key in this.state) {
			if(!this.state[key] || (key === 'avatar' && this.state[key] === '/img/upload.PNG')) {
				alert(`${key.replace(/^./, l => l.toUpperCase())} is missing`);
				return;
			}
		}
		
		if(this.state.password !== this.state.passwordConf) {
			alert('Password does not match the confirm password');
			return;
		}
		
		Users.addUser(this.state).then(() => {
			alert('User added successfully');
			this.setState({
				name: '',
				username: '',
				password: '',
				passwordConf: '',
				avatar: '/img/upload.PNG'
			});
		}, error => {
			console.log(error);
		});
	}
	
	assign(e, prop) {
		let state = {};
		state[prop] = e.target.value;
		
		this.setState(state);
	}
	
	showPicture(e) {
		if(!e.target.value) {
			return;
		}

		Photos.convertFileToImage(e.target.files[0]).then(data => {
			this.setState({
				avatar: data
			});
		});
	}
	
	render() {
		return (
			<form>
				<div className="container">
					<label><b>Name</b></label>
					<input type="text" placeholder="Enter Name" onInput={(e) => this.assign(e, "name")} required />
					
					<label><b>Username</b></label>
					<input type="text" placeholder="Enter Username" onInput={(e) => this.assign(e, "username")} required />
						
					<label><b>Password</b></label>
					<input type="password" placeholder="Enter Password" onInput={(e) => this.assign(e, "password")} required />
					
					<label><b>Repeat Password</b></label>
					<input type="password" placeholder="Repeat Password" onInput={(e) => this.assign(e, "passwordConf")} required />
					
					<label><b>Avatar</b></label>
					<label htmlFor="avatar">
						<img className='avatar' src={this.state.avatar} alt=''/>
					</label>
					<input id='avatar' type="file" onChange={this.showPicture} required />
									
					<div className="clearfix">
						<button type="submit" className="signupbtn" onClick={this.signUp}>Add</button>
					</div>
				</div>
			</form>
		);
	}
}