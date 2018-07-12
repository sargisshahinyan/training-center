// Components
import Home from '../components/home/home';
import Users from '../components/users/users';
import Students from '../components/students/students';
import Subjects from '../components/subjects/subjects';
import Groups from '../components/groups/groups';
import TimeTable from '../components/timeTable/timeTable';

const teacherRoutePaths = ['/home', '/timetable'];

export const baseUrl = 'https://colibri-training.herokuapp.com/api';
export const adminRoutes = [
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
		path: '/timetable', name: 'Time table', component: TimeTable
	}
];

export const STUDENTS_FILTERS = {
	ACTIVE: 0,
	ARCHIVED: 1,
	PENDING: 2,
};

export const teacherRoutes = adminRoutes.filter(route => teacherRoutePaths.some(path => path === route.path));