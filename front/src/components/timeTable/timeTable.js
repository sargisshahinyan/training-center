import React from 'react';
import './timeTable.css';

import { Table, Form, FormGroup, Label, Input } from 'reactstrap';

// models
import DateModel from '../../models/dateTime';
import GroupsModel from "../../models/groups";
import UsersModel from '../../models/users';
import SubjectsModel from '../../models/subjects';

// helpers
import InputMask from 'react-input-mask';
import { copyObject, isTimeValid, compareTimes } from "../../libs/helpers";

export default class TimeTable extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			weekDays: [],
			groupsData: [],
			users: [],
			subjects: [],
			userId: '',
			subjectId: '',
			weekDayId: '',
			startsAt: '',
			endsAt: ''
		};
		
		this.init();
	}
	
	init() {
		Promise.all([
			DateModel.getWeekDays(),
			GroupsModel.getGroupsData(),
			UsersModel.getUsers(),
			SubjectsModel.getSubjects()
		]).then(response => {
			const [weekDays, groupsData, users, subjects] = response;
			
			this.setState({
				weekDays, groupsData, users, subjects
			});
		});
	}
	
	render () {
		const groupsData = copyObject(this.state.groupsData).filter(user => {
			if(!this.state.userId || Number(user.id) === Number(this.state.userId)) {
				user.subjects = user.subjects.filter(subject => {
					if(!this.state.subjectId || Number(subject.id) === Number(this.state.subjectId)) {
						subject.groups = subject.groups.filter(group => {
							return group.days.some(day => (
								(!this.state.weekDayId || Number(day.id) === Number(this.state.weekDayId)) &&
								(!this.state.startsAt || !isTimeValid(this.state.startsAt) || compareTimes(day.startsAt, this.state.startsAt) >= 0) &&
								(!this.state.endsAt || !isTimeValid(this.state.endsAt) || compareTimes(+day.startsAt.substr(0, 2) + 2 + day.startsAt.substr(2), this.state.endsAt) <= 0)
							));
						});
						
						return subject.groups.length;
					}
					
					return false;
				});
				
				return user.subjects.length;
			}
			
			return false;
		});
		
		return (
			<React.Fragment>
				<Form inline>
					<FormGroup className="col-2 mb-2 mr-sm-2 mb-sm-0">
						<Label for="userId" className="mr-sm-2">Teacher</Label>
						<Input onChange={(e) => this.changeState('userId', e.target.value)} type="select" id="userId" value={this.state.userId}>
							<option value="">Not selected</option>
							{this.state.users.map(user => (
								<option value={user.id} key={user.id}>{user.name + ' ' + user.surname}</option>
							))}
						</Input>
					</FormGroup>
					<FormGroup className="col-2 mb-2 mr-sm-2 mb-sm-0">
						<Label for="subjectId" className="mr-sm-2">Subject</Label>
						<Input onChange={(e) => this.changeState('subjectId', e.target.value)} type="select" id="subjectId" value={this.state.subjectId}>
							<option value="">Not selected</option>
							{this.state.subjects.map(subject => (
								<option value={subject.id} key={subject.id}>{subject.name}</option>
							))}
						</Input>
					</FormGroup>
					<FormGroup className="col-2 mb-2 mr-sm-2 mb-sm-0">
						<Label for="weekDayId" className="mr-sm-2">Week day</Label>
						<Input onChange={(e) => this.changeState('weekDayId', e.target.value)} type="select" id="weekDayId" value={this.state.weekDayId}>
							<option value="">Not selected</option>
							{this.state.weekDays.map(day => (
								<option value={day.id} key={day.id}>{day.name}</option>
							))}
						</Input>
					</FormGroup>
					<FormGroup className="col-2 mb-2 mr-sm-2 mb-sm-0">
						<Label for="startsAt" className="mr-sm-2">Starts at</Label>
						<InputMask value={this.state.startsAt} onChange={e => this.changeState('startsAt', e.target.value)} mask="99:99" maskChar=" ">
							{(props) => <Input {...props} type="text" name="startsAt" id="startsAt"/>}
						</InputMask>
					</FormGroup>
					<FormGroup className="col-2 mb-2 mr-sm-2 mb-sm-0">
						<Label for="endsAt" className="mr-sm-2">Ends at</Label>
						<InputMask value={this.state.endsAt} onChange={e => this.changeState('endsAt', e.target.value)} mask="99:99" maskChar=" ">
							{(props) => <Input {...props} type="text" name="endsAt" id="endsAt"/>}
						</InputMask>
					</FormGroup>
				</Form>
				<hr/>
				{groupsData.map(user => (
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
	
	changeState(key, value) {
		this.setState({
			[key]: value
		});
	}
}