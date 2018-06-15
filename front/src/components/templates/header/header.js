import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import './header.css';

import Users from "../../../models/users";

import { routes } from "../../../constants/constants";

export default class Header extends React.Component {
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

		const reactRoutes = routes.map(route => {
			return <Link key={route.path} to={route.path} className={this.props.path.includes(route.path) ? 'selected' : null}>{route.name}</Link>;
		});
		
		return (
			<header className="header-fixed">
				<div className="header-limiter">
					<h1>
						<Link to='/home'>
							<img className="logo" src="/img/logo.png" />
						</Link>
					</h1>
					<nav ref={this.nav}>
						{reactRoutes}
						<a href='#' onClick={this.logOut}>Log out</a>
					</nav>
				</div>
			</header>
		);
	}
}