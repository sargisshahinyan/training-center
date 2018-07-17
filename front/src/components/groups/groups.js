import React from 'react';
import './groups.css';
// for modal
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// for forms
import { Form, FormGroup, Label, Input, Badge } from 'reactstrap';
// for list
import { ListGroup, ListGroupItem } from 'reactstrap';

// alert modal
import Alert from '../templates/modals/alert/alert';
// confirm modal
import Confirm from '../templates/modals/confirm/confirm'

//helpers
import InputMask from 'react-input-mask';
import { isTimeValid } from "../../libs/helpers";

// Models
import GroupsModel from "../../models/groups";
import UsersModel from '../../models/users';
import SubjectsModel from '../../models/subjects';
import StudentsModel from '../../models/students';
import DateModel from '../../models/dateTime';

const DEFAULT_START_TIME = '09:00';

export default class Groups extends React.Component {
	fields = ['name', 'userId', 'subjectId', 'studentId', 'dayId'];
	
	constructor(props) {
		super(props);
		this.state = {
			groups: [],
			groupData: this.fields.reduce((obj, field) => (obj[field] = '',obj), {}),
			selectedGroup: false,
			groupForm: false,
			alert: {
				isOpen: false,
				message: '',
				title: 'Warning'
			},
			confirm: {
				isOpen: false,
				message: '',
				action: '',
				title: 'Confirm'
			},
			students: [],
			users: [],
			subjects: [],
			weekDays: []
		};
		
		this.toggleForm = this.toggleForm.bind(this);
		this.toggleAlert = this.toggleAlert.bind(this);
		this.toggleConfirm = this.toggleConfirm.bind(this);
		
		this.editGroup = this.editGroup.bind(this);
		this.addGroup = this.addGroup.bind(this);
		this.deleteGroup = this.deleteGroup.bind(this);
		
		this.confirm = this.confirm.bind(this);
		this.selectStudent = this.selectStudent.bind(this);
		this.selectDay = this.selectDay.bind(this);
		
		this.getGroups();
		this.init();
	}
	
	init() {
		Promise.all([UsersModel.getUsers(), SubjectsModel.getSubjects(), StudentsModel.getStudents(), DateModel.getWeekDays()]).then(result => {
			let [users, subjects, students, weekDays] = result;
			
			students.forEach(student => student.selected = false);
			weekDays.forEach(day => {
				day.selected = false;
				day.startsAt = DEFAULT_START_TIME;
			});
			
			this.setState({
				users, subjects, students, weekDays
			});
		});
	}
	
	editGroup(e) {
		const id = e.target.dataset.id;
		e.preventDefault();
		
		GroupsModel.getGroup(id).then(group => {
			if(Array.isArray(group.students)) {
				this.state.students.forEach(student => {
					if(group.students.some(id => id === student.id)) {
						student.selected = true;
					}
				});
			}
			
			if(Array.isArray(group.days)) {
				this.state.weekDays.forEach(day => {
					let data;
					if(data = group.days.find(data => data.id === day.id)) {
						day.selected = true;
						day.startsAt = data.startsAt;
					}
				});
			}
			
			this.toggleForm(null, id, group);
		});
	}
	
	saveChanges() {
		const group = this.collectData();
		
		if(!group) {
			return;
		}
		
		GroupsModel.editGroup(this.state.selectedGroup, group).then((res) => {
			this.toggleForm();
			this.toggleAlert(null, res.message, 'Congrats');
			this.getGroups();
		}, error => this.toggleAlert(null, error.message, 'Warning'));
	}
	
	deleteGroup() {
		GroupsModel.deleteGroup(this.state.selectedGroup).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Group deleted successfully', 'Congrats');
			this.getGroups();
		})
	}
	
	addGroup() {
		const group = this.collectData();
		
		if(!group) {
			return;
		}
		
		GroupsModel.addGroup(group).then(res => {
			this.toggleForm();
			this.toggleAlert(null, res.message, 'Congrats');
			this.getGroups();
		}, err => this.toggleAlert(null, err.message, 'Warning'));
	}
	
	getGroups() {
		GroupsModel.getGroups().then(groups => this.setState({groups}));
	}
	
	// Toggle methods for modals
	toggleForm(e = null, groupId = null, groupData = null) {
		this.setState((prevState) => ({
			groupForm: !prevState.groupForm,
			selectedGroup: groupId,
			groupData: groupData ? Object.assign(prevState.groupData, groupData) : this.fields.reduce((obj, field) => (obj[field] = '',obj), {}),
			students: prevState.groupForm ? prevState.students.map(student => (student.selected = false,student)) : prevState.students,
			weekDays: prevState.groupForm ? prevState.weekDays.map(day => (day.selected = false,day.startsAt = DEFAULT_START_TIME,day)) : prevState.weekDays
		}));
	}
	
	toggleAlert(e = null, message = '', title = this.state.alert.title) {
		this.setState((prevState) => ({
			alert: Object.assign(prevState.alert, {
				isOpen: !prevState.alert.isOpen,
				message: message,
				title: title
			})
		}));
	}
	
	toggleConfirm(e = null, message = '', action = '', title = this.state.confirm.title) {
		this.setState((prevState) => ({
			confirm: Object.assign(prevState.confirm, {
				isOpen: !prevState.confirm.isOpen,
				message: message,
				action: action,
				title: title
			})
		}));
	}
	
	confirm() {
		switch (this.state.confirm.action) {
			case 'DELETE_USER':
				this.deleteGroup();
				break;
			default:
				break;
		}
		
		this.toggleConfirm();
	}
	
	selectStudent() {
		this.setState((prevState) => {
			const students = prevState.students.map(student => {
				if(student.id === parseInt(prevState.groupData.studentId, 10)) {
					student.selected = true;
				}
				
				return student;
			});
			
			return {
				students,
				groupData: Object.assign(prevState.groupData, { studentId: ''})
			};
		});
	}
	
	selectDay() {
		this.setState((prevState) => {
			const days = prevState.weekDays.map(day => {
				if(day.id === parseInt(prevState.groupData.dayId, 10)) {
					day.selected = true;
				}
				
				return day;
			});
			
			return {
				days,
				groupData: Object.assign(prevState.groupData, { dayId: ''})
			};
		});
	}
	
	deselectStudent(id) {
		this.setState((prevState) => {
			const students = prevState.students.map(student => {
				if(student.id === id) {
					student.selected = false;
				}
				
				return student;
			});
			
			return {
				students
			};
		});
	}
	
	deselectDay(id) {
		this.setState((prevState) => {
			const days = prevState.weekDays.map(day => {
				if(day.id === id) {
					day.selected = false;
				}
				
				return day;
			});
			
			return {
				days
			};
		});
	}
	
	render() {
		return <React.Fragment>
			<Button className="add-button" color="primary" onClick={this.toggleForm}>Add new group</Button>
			<div className="rows-count">
				Groups count {this.state.groups.length}
			</div>
			<ListGroup className="groups-list">
				{this.state.groups.map((group, i) => <ListGroupItem onClick={this.editGroup} tag="a" href="#" key={group.id} data-id={group.id}>{`${i + 1}. ${group.name}`}</ListGroupItem>)}
			</ListGroup>
			
			<Modal isOpen={this.state.groupForm} toggle={this.toggleForm} className={'modal-lg'}>
				<ModalHeader toggle={this.toggleForm}>Group form</ModalHeader>
				<ModalBody>
					<Form>
						<FormGroup>
							<Label for="name">Name</Label>
							<Input value={this.state.groupData.name} onChange={e => this.collectState('name', e.target.value)} type="text" name="name" id="name" placeholder="Name" />
						</FormGroup>
						<FormGroup>
							<Label for="userId">Teacher</Label>
							<Input value={this.state.groupData.userId} onChange={e => this.collectState('userId', e.target.value)} type="select" name="userId" id="userId" placeholder="Teacher">
								<option value="" disabled>Select teacher</option>
								{this.state.users.map(user => <option key={user.id} value={user.id}>{user.name + ' ' + user.surname}</option>)}
							</Input>
						</FormGroup>
						<FormGroup>
							<Label for="subjectId">Subject</Label>
							<Input value={this.state.groupData.subjectId} onChange={e => this.collectState('subjectId', e.target.value)} type="select" name="subjectId" id="subjectId" placeholder="Subject">
								<option value="" disabled>Select subject</option>
								{this.state.subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
							</Input>
						</FormGroup>
						<FormGroup>
							<div className="row">
								<div className="col-12">
									<Label for="studentId">Students</Label>
								</div>
								<div className="col-10">
									<Input value={this.state.groupData.studentId} onChange={e => this.collectState('studentId', e.target.value)} type="select" name="studentId" id="studentId" placeholder="Students">
										<option value="" disabled>Select student</option>
										{this.state.students.filter(student => !student.selected).map(student => <option key={student.id} value={student.id}>{student.name + ' ' + student.surname}</option>)}
									</Input>
								</div>
								<div className="col-2 text-right">
									<Button color="success" onClick={this.selectStudent}>Add</Button>
								</div>
							</div>
						</FormGroup>
						<ListGroup>
							{this.state.students.filter(student => student.selected).map(student => (
								<ListGroupItem key={student.id}>
									{student.name + ' ' + student.surname}
									<Badge onClick={() => {this.deselectStudent(student.id)}} color="danger" className="float-right delete-icon">X</Badge>
								</ListGroupItem>
							))}
						</ListGroup>
						<FormGroup>
							<div className="row">
								<div className="col-12">
									<Label for="dayId">Week days</Label>
								</div>
								<div className="col-10">
									<Input value={this.state.groupData.dayId} onChange={e => this.collectState('dayId', e.target.value)} type="select" name="dayId" id="dayId" placeholder="Week days">
										<option value="" disabled>Select day</option>
										{this.state.weekDays.filter(day => !day.selected).map(day => <option key={day.id} value={day.id}>{day.name}</option>)}
									</Input>
								</div>
								<div className="col-2 text-right">
									<Button color="success" onClick={this.selectDay}>Add</Button>
								</div>
							</div>
						</FormGroup>
						<ListGroup>
							{this.state.weekDays.filter(day => day.selected).map(day => (
								<ListGroupItem key={day.id}>
									<div className="row">
										<div className="col-4">
											{day.name}
										</div>
										<div className="col-2">
											<InputMask defaultValue={day.startsAt} innerRef={element => day.startTimeElement = element} mask="99:99" maskChar=" ">
												{(props) => <Input {...props} type="text" name="startsAt" id="startsAt"/>}
											</InputMask>
										</div>
										<div className="col-6 text-right">
											<Badge onClick={() => {this.deselectDay(day.id)}} color="danger" className="float-right delete-icon">X</Badge>
										</div>
									</div>
								</ListGroupItem>
							))}
						</ListGroup>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={() => {this.state.selectedGroup ? this.saveChanges() : this.addGroup()}}>{this.state.selectedGroup ? 'Save changes' : 'Add group'}</Button>{' '}
					{this.state.selectedGroup && <Button color="danger" onClick={(e) => {this.toggleConfirm(e, 'Are you sure you want to delete this group', 'DELETE_USER');}}>Delete</Button>}
					<Button color="secondary" onClick={this.toggleForm}>Cancel</Button>
				</ModalFooter>
			</Modal>
			<Alert toggle={this.toggleAlert} isOpen={this.state.alert.isOpen} message={this.state.alert.message} title={this.state.alert.title} />
			<Confirm toggle={this.toggleConfirm} isOpen={this.state.confirm.isOpen} message={this.state.confirm.message} title={this.state.confirm.title} confirm={this.confirm} />
		</React.Fragment>
	}
	
	collectData() {
		const missedField = this.fields.find(field => !this.state.groupData[field] && field !== 'studentId' && field !== 'dayId');
		
		if(missedField) {
			this.toggleAlert(null, `${missedField.replace('user', 'teacher').replace(/id/i, '').replace(/^./, l => l.toUpperCase())} is required`);
			return;
		}
		
		const selectedStudents = this.state.students.filter(student => student.selected);
		
		if(!selectedStudents.length) {
			this.toggleAlert(null, 'Please select at least one student');
			return;
		}
		
		const selectedWeekDays = this.state.weekDays.filter(day => day.selected);
		
		if(!selectedWeekDays.length) {
			this.toggleAlert(null, 'Please select at least one week day');
			return;
		}
		
		const isTimesIncorrect = selectedWeekDays.some(day => {
			if(!isTimeValid(day.startTimeElement.value)) {
				this.toggleAlert(null, `Please input valid time format for ${day.name.toLowerCase()}`);
				return true;
			}
			
			day.startsAt = day.startTimeElement.value;
			return false;
		});
		
		if(isTimesIncorrect) {
			return;
		}
		
		const result = {
			...this.state.groupData,
			students: selectedStudents.map(student => student.id),
			days: selectedWeekDays.map(day => ({
				weekDay: day.id,
				startsAt: day.startsAt
			}))
		};
		
		
		['studentId', 'dayId'].forEach(field => delete result[field]);
		
		return result;
	}
	
	collectState(key, value) {
		this.setState((prevState) => ({
			groupData: Object.assign(prevState.groupData, {[key]: value})
		}));
	}
}