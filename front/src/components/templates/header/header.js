import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import './header.css';

import Users from "../../../models/users";

import { adminRoutes, teacherRoutes } from "../../../constants/constants";

export default class Header extends React.Component {
	routes = Users.isAdminAuthorized() ? adminRoutes : teacherRoutes;
	constructor(props) {
		super(props);
		this.state = {
			redirect: false
		};
		
		this.nav = null;
		
		this.logOut = this.logOut.bind(this);
	}

	logOut(event) {
		event.preventDefault();
		Users.forgetUser().then(() => {
			this.setState({
				redirect: true
			});
		});
	}

	render() {
		if(this.state.redirect) {
			return <Redirect to='/' />;
		}
		
		return (
			<header className="header-fixed">
				<div className="header-limiter text-left">
					<Link to='/home'>
						<img className="logo" src="/img/logo.png" alt="Logo"/>
					</Link>
					<nav ref={this.nav}>
						{this.routes.map(route => {
							return <Link key={route.path} to={route.path} className={this.props.path.includes(route.path) ? 'selected' : null}>{route.name}</Link>;
						})}
						<a href='#' onClick={this.logOut}>Log out</a>
					</nav>
				</div>
			</header>
		);
	}
}