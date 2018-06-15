import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import Main from './components/main/main';

const App = () => (
	<Main/>
);

ReactDOM.render((
	<BrowserRouter>
		<App />
	</BrowserRouter>
), document.getElementById('root'));