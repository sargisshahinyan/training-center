import React from 'react';
import './subjects.css';
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

// Models
import SubjectsModel from "../../models/subjects";

export default class Subjects extends React.Component {
	fields = ['name'];
	
	constructor(props) {
		super(props);
		this.state = {
			subjects: [],
			subjectData: this.fields.reduce((obj, field) => (obj[field] = '',obj), {}),
			selectedSubject: false,
			subjectForm: false,
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
		
		this.editSubject = this.editSubject.bind(this);
		this.addSubject = this.addSubject.bind(this);
		this.deleteSubject = this.deleteSubject.bind(this);
		
		this.confirm = this.confirm.bind(this);
		
		this.getSubjects();
	}
	
	editSubject(e) {
		const id = e.target.dataset.id;
		e.preventDefault();
		
		SubjectsModel.getSubject(id).then(subject => {
			this.toggleForm(null, id, subject);
		});
	}
	
	saveChanges() {
		const subject = this.collectData();
		
		if(!subject) {
			return;
		}
		
		SubjectsModel.editSubject(this.state.selectedSubject, subject).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Subject updated successfully', 'Congrats');
			this.getSubjects();
		});
	}
	
	deleteSubject() {
		SubjectsModel.deleteSubject(this.state.selectedSubject).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Subject deleted successfully', 'Congrats');
			this.getSubjects();
		})
	}
	
	addSubject() {
		const subject = this.collectData();
		
		if(!subject) {
			return;
		}
		
		SubjectsModel.addSubject(subject).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'Subject created successfully', 'Congrats');
			this.getSubjects();
		}, err => console.error(err));
	}
	
	getSubjects() {
		SubjectsModel.getSubjects().then(subjects => this.setState({subjects}));
	}
	
	// Toggle methods for modals
	toggleForm(e = null, subjectId = null, subjectData = null) {
		this.setState((prevState) => ({
			subjectForm: !prevState.subjectForm,
			selectedSubject: subjectId,
			subjectData: subjectData || this.fields.reduce((obj, field) => (obj[field] = '',obj), {})
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
				this.deleteSubject();
				break;
			default:
				break;
		}
		
		this.toggleConfirm();
	}
	
	render() {
		return <React.Fragment>
			<Button className="add-button" color="primary" onClick={this.toggleForm}>Add new subject</Button>
			<div className="rows-count">
				Subjects count {this.state.subjects.length}
			</div>
			<ListGroup className="subjects-list">
				{this.state.subjects.map((subject, i) => <ListGroupItem onClick={this.editSubject} tag="a" href="#" key={subject.id} data-id={subject.id}>{`${i + 1}. ${subject.name}`}</ListGroupItem>)}
			</ListGroup>
			
			<Modal isOpen={this.state.subjectForm} toggle={this.toggleForm} className={'modal-lg'}>
				<ModalHeader toggle={this.toggleForm}>Subject form</ModalHeader>
				<ModalBody>
					<Form>
						<FormGroup>
							<Label for="name">Name</Label>
							<Input value={this.state.subjectData.name} onChange={e => this.collectState('name', e.target.value)} type="text" name="name" id="name" placeholder="Name" />
						</FormGroup>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={() => {this.state.selectedSubject ? this.saveChanges() : this.addSubject()}}>{this.state.selectedSubject ? 'Save changes' : 'Add subject'}</Button>{' '}
					{this.state.selectedSubject && <Button color="danger" onClick={(e) => {this.toggleConfirm(e, 'Are you sure you want to delete this subject', 'DELETE_USER');}}>Delete</Button>}
					<Button color="secondary" onClick={this.toggleForm}>Cancel</Button>
				</ModalFooter>
			</Modal>
			<Alert toggle={this.toggleAlert} isOpen={this.state.alert.isOpen} message={this.state.alert.message} title={this.state.alert.title} />
			<Confirm toggle={this.toggleConfirm} isOpen={this.state.confirm.isOpen} message={this.state.confirm.message} title={this.state.confirm.title} confirm={this.confirm} />
		</React.Fragment>
	}
	
	collectData() {
		const missedField = this.fields.find(field => !this.state.subjectData[field]);
		
		if(missedField) {
			this.toggleAlert(null, `${missedField.replace(/^./, l => l.toUpperCase())} is required`);
			return;
		}
		
		return {...this.state.subjectData};
	}
	
	collectState(key, value) {
		this.setState((prevState) => ({
			subjectData: Object.assign(prevState.subjectData, {[key]: value})
		}));
	}
}