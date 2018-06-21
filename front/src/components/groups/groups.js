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

// Models
import GroupsModel from "../../models/groups";
import UsersModel from '../../models/users';
import SubjectsModel from '../../models/subjects';
import StudentsModel from '../../models/students';

export default class Groups extends React.Component {
	fields = ['name', 'userId', 'subjectId', 'studentId'];
	
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
			subjects: []
		};
		
		this.toggleForm = this.toggleForm.bind(this);
		this.toggleAlert = this.toggleAlert.bind(this);
		this.toggleConfirm = this.toggleConfirm.bind(this);
		
		this.editGroup = this.editGroup.bind(this);
		this.addGroup = this.addGroup.bind(this);
		this.deleteGroup = this.deleteGroup.bind(this);
		
		this.confirm = this.confirm.bind(this);
		this.selectStudent = this.selectStudent.bind(this);
		
		this.getGroups();
		this.init();
	}
	
	init() {
		Promise.all([UsersModel.getUsers(), SubjectsModel.getSubjects(), StudentsModel.getStudents()]).then(result => {
			let [users, subjects, students] = result;
			
			students.forEach(student => student.selected = false);
			
			this.setState({
				users, subjects, students
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
			
			this.toggleForm(null, id, group);
		});
	}
	
	saveChanges() {
		const group = this.collectData();
		
		if(!group) {
			return;
		}
		
		GroupsModel.editGroup(this.state.selectedGroup, group).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Group updated successfully', 'Congrats');
			this.getGroups();
		});
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
		
		GroupsModel.addGroup(group).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Group created successfully', 'Congrats');
			this.getGroups();
		}, err => console.error(err));
	}
	
	getGroups() {
		GroupsModel.getGroups().then(groups => this.setState({groups}));
	}
	
	// Toggle methods for modals
	toggleForm(e = null, groupId = null, groupData = null) {
		this.setState((prevState) => ({
			groupForm: !prevState.groupForm,
			selectedGroup: groupId,
			groupData: groupData || this.fields.reduce((obj, field) => (obj[field] = '',obj), {})
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
		}
		
		this.toggleConfirm();
	}
	
	selectStudent() {
		this.setState((prevState) => {
			const students = prevState.students.map(student => {
				if(student.id === parseInt(prevState.groupData.studentId)) {
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
	
	render() {
		return <React.Fragment>
			<Button className="add-button" color="primary" onClick={this.toggleForm}>Add new group</Button>
			<ListGroup className="groups-list">
				{this.state.groups.map(group => <ListGroupItem onClick={this.editGroup} tag="a" href="#" key={group.id} data-id={group.id}>{`${group.name}`}</ListGroupItem>)}
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
							<Label for="subjectId">Subject</Label>
							<Input value={this.state.groupData.subjectId} onChange={e => this.collectState('subjectId', e.target.value)} type="select" name="subjectId" id="subjectId" placeholder="Subject">
								<option value="" disabled>Select subject</option>
								{this.state.subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
							</Input>
						</FormGroup>
						<FormGroup>
							<Label for="userId">Teacher</Label>
							<Input value={this.state.groupData.userId} onChange={e => this.collectState('userId', e.target.value)} type="select" name="userId" id="userId" placeholder="Teacher">
								<option value="" disabled>Select teacher</option>
								{this.state.users.map(user => <option key={user.id} value={user.id}>{user.name + ' ' + user.surname}</option>)}
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
						<ListGroup className="groups-list">
							{this.state.students.filter(student => student.selected).map(student => (
								<ListGroupItem key={student.id}>
									{student.name + ' ' + student.surname}
									<Badge onClick={() => {this.deselectStudent(student.id)}} color="danger" className="float-right delete-icon">X</Badge></ListGroupItem>
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
		const missedField = this.fields.find(field => !this.state.groupData[field] && field !== 'studentId');
		
		if(missedField) {
			this.toggleAlert(null, `${missedField.replace('user', 'teacher').replace(/id/i, '').replace(/^./, l => l.toUpperCase())} is required`);
			return;
		}
		
		const selectedStudents = this.state.students.filter(student => student.selected);
		
		if(!selectedStudents.length) {
			this.toggleAlert(null, 'Please select at least one student');
			return;
		}
		
		const result = {
			...this.state.groupData,
			students: selectedStudents.map(student => student.id)
		};
		
		delete result.studentId;
		
		return result;
	}
	
	collectState(key, value) {
		this.setState((prevState) => ({
			groupData: Object.assign(prevState.groupData, {[key]: value})
		}));
	}
}