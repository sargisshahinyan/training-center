import React from 'react';
import './students.css';
// for modal
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// for forms
import { Form, FormGroup, Label, Input } from 'reactstrap';
// for list
import { ListGroup, ListGroupItem } from 'reactstrap';

// alert modal
import Alert from '../templates/modals/alert/alert';
// confirm modal
import Confirm from '../templates/modals/confirm/confirm'

//helpers
import InputMask from 'react-input-mask';

// Models
import StudentsModel from "../../models/students";

export default class Students extends React.Component {
	fields = ['name', 'surname', 'phone'];
	
	constructor(props) {
		super(props);
		this.state = {
			students: [],
			studentData: this.fields.reduce((obj, field) => (obj[field] = '',obj), {}),
			selectedStudent: false,
			studentForm: false,
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
			}
		};
		
		this.toggleForm = this.toggleForm.bind(this);
		this.toggleAlert = this.toggleAlert.bind(this);
		this.toggleConfirm = this.toggleConfirm.bind(this);
		
		this.editStudent = this.editStudent.bind(this);
		this.addStudent = this.addStudent.bind(this);
		this.deleteStudent = this.deleteStudent.bind(this);
		
		this.confirm = this.confirm.bind(this);
		
		this.getStudents();
	}
	
	editStudent(e) {
		const id = e.target.dataset.id;
		e.preventDefault();
		
		StudentsModel.getStudent(id).then(student => {
			this.toggleForm(null, id, student);
		});
	}
	
	saveChanges() {
		const student = this.collectData();
		
		if(!student) {
			return;
		}
		
		StudentsModel.editStudent(this.state.selectedStudent, student).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Student updated successfully', 'Congrats');
			this.getStudents();
		});
	}
	
	deleteStudent() {
		StudentsModel.deleteStudent(this.state.selectedStudent).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Student deleted successfully', 'Congrats');
			this.getStudents();
		})
	}
	
	addStudent() {
		const student = this.collectData();
		
		if(!student) {
			return;
		}
		
		StudentsModel.addStudent(student).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Student created successfully', 'Congrats');
			this.getStudents();
		}, err => console.error(err));
	}
	
	getStudents() {
		StudentsModel.getStudents().then(students => this.setState({students}));
	}
	
	// Toggle methods for modals
	toggleForm(e = null, studentId = null, studentData = null) {
		this.setState((prevState) => ({
			studentForm: !prevState.studentForm,
			selectedStudent: studentId,
			studentData: studentData || this.fields.reduce((obj, field) => (obj[field] = '',obj), {})
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
				this.deleteStudent();
				break;
		}
		
		this.toggleConfirm();
	}
	
	render() {
		return <React.Fragment>
			<Button className="add-button" color="primary" onClick={this.toggleForm}>Add new student</Button>
			<ListGroup className="students-list">
				{this.state.students.map(student => <ListGroupItem onClick={this.editStudent} tag="a" href="#" key={student.id} data-id={student.id}>{`${student.name} ${student.surname}`}</ListGroupItem>)}
			</ListGroup>
			
			<Modal isOpen={this.state.studentForm} toggle={this.toggleForm} className={'modal-lg'}>
				<ModalHeader toggle={this.toggleForm}>Student form</ModalHeader>
				<ModalBody>
					<Form>
						<FormGroup>
							<Label for="name">Name</Label>
							<Input value={this.state.studentData.name} onChange={e => this.collectState('name', e.target.value)} type="text" name="name" id="name" placeholder="Name" />
						</FormGroup>
						<FormGroup>
							<Label for="surname">Surname</Label>
							<Input value={this.state.studentData.surname} onChange={e => this.collectState('surname', e.target.value)} type="text" name="surname" id="surname" placeholder="Surname" />
						</FormGroup>
						<FormGroup>
							<Label for="phone">Phone</Label>
							<InputMask value={this.state.studentData.phone} onChange={e => this.collectState('phone', e.target.value)} mask="099-99-99-99" maskChar=" ">
								{(props) => <Input {...props} type="text" name="phone" id="phone" placeholder="Phone" />}
							</InputMask>
						</FormGroup>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={() => {this.state.selectedStudent ? this.saveChanges() : this.addStudent()}}>{this.state.selectedStudent ? 'Save changes' : 'Add student'}</Button>{' '}
					{this.state.selectedStudent && <Button color="danger" onClick={(e) => {this.toggleConfirm(e, 'Are you sure you want to delete this student', 'DELETE_USER');}}>Delete</Button>}
					<Button color="secondary" onClick={this.toggleForm}>Cancel</Button>
				</ModalFooter>
			</Modal>
			<Alert toggle={this.toggleAlert} isOpen={this.state.alert.isOpen} message={this.state.alert.message} title={this.state.alert.title} />
			<Confirm toggle={this.toggleConfirm} isOpen={this.state.confirm.isOpen} message={this.state.confirm.message} title={this.state.confirm.title} confirm={this.confirm} />
		</React.Fragment>
	}
	
	collectData() {
		const missedField = this.fields.find(field => !this.state.studentData[field]);
		
		if(missedField) {
			this.toggleAlert(null, `${missedField.replace(/^./, l => l.toUpperCase())} is required`);
			return;
		}
		
		return {...this.state.studentData};
	}
	
	collectState(key, value) {
		this.setState((prevState) => ({
			studentData: Object.assign(prevState.studentData, {[key]: value})
		}));
	}
}