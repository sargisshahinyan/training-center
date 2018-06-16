// Components
import Home from '../components/home/home';
import Users from '../components/users/users';
import Students from '../components/students/students';
import Subjects from '../components/subjects/subjects';
import Groups from '../components/groups/groups';

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
		path: '/subjects', name: 'Subjects', component: Subjects
	},
	{
		path: '/groups', name: 'Groups', component: Groups
	},
	{
		path: '/timetable', name: 'Time table', component: null
	}
];