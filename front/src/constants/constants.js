// Components
import Home from '../components/home/home';
import Users from '../components/users/users';
import Students from '../components/students/students';

export const baseUrl = 'http://localhost:3000/api';
export const routes = [
	{
		path: '/home', name: 'Home', component: Home
	},
	{
		path: '/users', name: 'Users', component: Users
	},
	{
		path: '/students', name: 'Students', component: Students
	},
	{
		path: '/timetable', name: 'Time table', component: null
	}
];