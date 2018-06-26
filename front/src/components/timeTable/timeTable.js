import React from 'react';
import './timeTable.css';

import { Table } from 'reactstrap';

// models
import DateModel from '../../models/dateTime';
import GroupsModel from "../../models/groups";

export default class TimeTable extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			weekDays: [],
			groupsData: []
		};
		
		this.init();
	}
	
	init() {
		Promise.all([
			DateModel.getWeekDays(),
			GroupsModel.getGroupsData()
		]).then(response => {
			const [weekDays, groupsData] = response;
			
			this.setState({
				weekDays, groupsData
			});
		});
	}
	
	render () {
		return (
			<React.Fragment>
				{this.state.groupsData.map(user => (
					<React.Fragment key={user.id}>
						<h2>{user.name + ' ' + user.surname}</h2>
						{user.subjects.map(subject => (
							<Table key={subject.id} bordered>
								<caption>{subject.name}</caption>
								<thead>
								<tr>
									<th>Group Name</th>
									<th>Students</th>
									<th>Phone</th>
									{this.state.weekDays.map(day => <th key={day.id}>{day.name}</th>)}
								</tr>
								</thead>
								<tbody>
								{subject.groups.map(group => (
									group.students.map((student, i, arr) => (
										<tr key={student.id}>
											{
												!i
												&&
												<td rowSpan={arr.length}>
													{group.name}
												</td>
											}
											<td>{student.name} {student.surname}</td>
											<td>{student.phone}</td>
											{
												!i
												&&
												this.state.weekDays.map(day => (
													<td rowSpan={arr.length} key={day.id}>
														{
															group.days.some(weekDay => weekDay.id === day.id)
																?
																group.days.find(weekDay => weekDay.id === day.id).startsAt
																:
																''
														}
													</td>
												))
											}
										</tr>
									))
								))}
								</tbody>
							</Table>
						))}
					</React.Fragment>
				))}
			</React.Fragment>
		);
	}
}