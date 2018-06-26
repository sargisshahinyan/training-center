import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import './main.css';

//Components
import Login from '../login/login';
import Header from '../templates/header/header';

//Models
import Users from '../../models/users';

// Routes
import { adminRoutes } from "../../constants/constants";

export default class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			component: null
		};
		
		Users.checkUser().then(() => {
			this.setState({
				component: window.location.pathname === '/' ? <Redirect to='/home' /> : Main.renderMain()
			});
		}, () => {
			this.setState({
				component: window.location.pathname !== '/' ? <Redirect to='/' /> : Main.renderMain()
			});
		});
	}
	
	render() {
		const component = this.state.component;
		this.state.component = Main.renderMain();
		
		return component;
	}
	
	static renderMain() {
		const reactRoutes = adminRoutes.map(route => (
			<Route key={route.path} path={route.path} component={route.component} />
		));
		
		return (
			<React.Fragment>
				<Route path='/' render={(props) => (
					!props.match.isExact
						? <Header path={props.location.pathname} />
						: <Login/>
				)}/>
				<main className="container">
					{reactRoutes}
				</main>
			</React.Fragment>
		);
	}
}