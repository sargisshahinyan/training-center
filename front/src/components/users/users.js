import React from 'react';
import './users.css';
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
import * as emailValidator from 'email-validator';

// Models
import UsersModel from "../../models/users";
import Photos from "../../models/photos"

export default class Users extends React.Component {
	fields = ['name', 'surname', 'email', 'phone', 'username', 'password', 'password-retype', 'privilege'];
	
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			userData: this.fields.concat(['avatar']).reduce((obj, field) => (obj[field] = '',obj), {}),
			selectedUser: false,
			userForm: false,
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
		
		this.passRetype = React.createRef();
		this.avatar = React.createRef();
		
		this.toggleForm = this.toggleForm.bind(this);
		this.toggleAlert = this.toggleAlert.bind(this);
		this.toggleConfirm = this.toggleConfirm.bind(this);
		
		this.editUser = this.editUser.bind(this);
		this.addUser = this.addUser.bind(this);
		this.deleteUser = this.deleteUser.bind(this);
		
		this.confirm = this.confirm.bind(this);
		
		this.getUsers();
	}
	
	editUser(e) {
		const id = e.target.dataset.id;
		e.preventDefault();
		
		UsersModel.getUser(id).then(user => {
			Photos.convertUrlToImage(user.avatar).then(img => {
				user.avatar = img;
			}, () => {}).then(() => this.toggleForm(null, id, user));
		});
	}
	
	saveChanges() {
		const user = this.collectData();
		
		if(!user) {
			return;
		}
		
		UsersModel.editUser(this.state.selectedUser, user).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'User updated successfully', 'Congrats');
			this.getUsers();
		});
	}
	
	deleteUser() {
		UsersModel.deleteUser(this.state.selectedUser).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'User deleted successfully', 'Congrats');
			this.getUsers();
		})
	}
	
	addUser() {
		const user = this.collectData();
		
		if(!user) {
			return;
		}
		
		UsersModel.addUser(user).then(() => {
			this.toggleForm();
			this.toggleAlert(null, 'User created successfully', 'Congrats');
			this.getUsers();
		}, err => console.error(err));
	}
	
	getUsers() {
		UsersModel.getUsers().then(users => this.setState({users}));
	}
	
	// Toggle methods for modals
	toggleForm(e = null, userId = null, userData = null) {
		this.setState((prevState) => ({
			userForm: !prevState.userForm,
			selectedUser: userId,
			userData: this.fields.concat(['avatar']).reduce((obj, field) => ((obj[field] = obj[field] || obj[field] === 0 ? String(obj[field]) : ''),obj), userData || {})
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
				this.deleteUser();
				break;
			default:
				break;
		}
		
		this.toggleConfirm();
	}
	
	render() {
		return <React.Fragment>
			<Button className="add-button" color="primary" onClick={this.toggleForm}>Add new user</Button>
			<ListGroup className="users-list">
				{this.state.users.map(user => <ListGroupItem onClick={this.editUser} tag="a" href="#" key={user.id} data-id={user.id}>{`${user.name} ${user.surname}`}</ListGroupItem>)}
			</ListGroup>
			
			<Modal isOpen={this.state.userForm} toggle={this.toggleForm} className={'modal-lg'}>
				<ModalHeader toggle={this.toggleForm}>User form</ModalHeader>
				<ModalBody>
					<Form>
						<FormGroup>
							<Label for="name">Name</Label>
							<Input value={this.state.userData.name} onChange={e => this.collectState('name', e.target.value)} type="text" name="name" id="name" placeholder="Name" />
						</FormGroup>
						<FormGroup>
							<Label for="surname">Surname</Label>
							<Input value={this.state.userData.surname} onChange={e => this.collectState('surname', e.target.value)} type="text" name="surname" id="surname" placeholder="Surname" />
						</FormGroup>
						<FormGroup>
							<Label for="email">Email</Label>
							<Input value={this.state.userData.email} onChange={e => this.collectState('email', e.target.value)} type="email" name="email" id="email" placeholder="Email" />
						</FormGroup>
						<FormGroup>
							<Label for="phone">Phone</Label>
							<InputMask value={this.state.userData.phone} onChange={e => this.collectState('phone', e.target.value)} mask="099-99-99-99" maskChar=" ">
								{(props) => <Input {...props} type="text" name="phone" id="phone" placeholder="Phone" />}
							</InputMask>
						</FormGroup>
						<FormGroup>
							<Label for="username">Username</Label>
							<Input value={this.state.userData.username} onChange={e => {this.collectState('username', e.target.value)}} type="text" name="username" id="username" placeholder="Username" />
						</FormGroup>
						<FormGroup>
							<Label for="password">Password</Label>
							<Input value={this.state.userData.password} onChange={e => {this.collectState('password', e.target.value)}} type="password" name="password" id="password" placeholder="Password" />
						</FormGroup>
						<FormGroup>
							<Label for="password-retype">Confirm Password</Label>
							<Input value={this.state.userData['password-retype']} innerRef={this.passRetype} onChange={e => {this.watchPassRetype();this.collectState('password-retype', e.target.value);}} type="password" name="password-retype" id="password-retype" placeholder="Confirm Password" />
						</FormGroup>
						<FormGroup>
							<Label for="privilege">Privilege</Label>
							<Input value={this.state.userData.privilege} onChange={e => this.collectState('privilege', e.target.value)} type="select" name="privilege" id="privilege">
								<option disabled value=''>Select privilege</option>
								<option value="0">Teacher</option>
								<option value="1">Administrator</option>
							</Input>
						</FormGroup>
						<FormGroup>
							<Label for="avatar">Avatar</Label>
							<Input accept="image/*" onChange={e => Users.changeAvatar(e).then(img => this.collectState('avatar', img))} type="file" name="avatar" id="avatar" />
							<div hidden={!Boolean(this.state.userData.avatar)}>
								<img src={this.state.userData.avatar} className={'img-fluid avatar'} ref={this.avatar} alt={'Avatar'} />
							</div>
						</FormGroup>
					</Form>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={() => {this.state.selectedUser ? this.saveChanges() : this.addUser()}}>{this.state.selectedUser ? 'Save changes' : 'Add user'}</Button>{' '}
					{this.state.selectedUser && <Button color="danger" onClick={(e) => {this.toggleConfirm(e, 'Are you sure you want to delete this user', 'DELETE_USER');}}>Delete</Button>}
					<Button color="secondary" onClick={this.toggleForm}>Cancel</Button>
				</ModalFooter>
			</Modal>
			<Alert toggle={this.toggleAlert} isOpen={this.state.alert.isOpen} message={this.state.alert.message} title={this.state.alert.title} />
			<Confirm toggle={this.toggleConfirm} isOpen={this.state.confirm.isOpen} message={this.state.confirm.message} title={this.state.confirm.title} confirm={this.confirm} />
		</React.Fragment>
	}
	
	collectData() {
		const missedField = this.fields.find(field => !this.state.userData[field]);
		
		if(missedField) {
			this.toggleAlert(null, `${missedField.replace(/^./, l => l.toUpperCase())} is required`);
			return;
		}
		
		if(!emailValidator.validate(String(this.state.userData.email))) {
			this.toggleAlert(null, 'Invalid mail');
			return;
		}
		
		if(this.state.userData.password !== this.state.userData['password-retype']) {
			this.toggleAlert(null, 'Passwords don\'t match');
			return;
		}
		
		let user = {...this.state.userData};
		
		delete user.userForm;
		delete user.alert;
		user.avatar = user.avatar || null;
		
		return user;
	}
	
	collectState(key, value) {
		this.setState((prevState) => ({
			userData: Object.assign(prevState.userData, {[key]: value})
		}));
	}
	
	watchPassRetype() {
		this.passRetype.current.style.border = this.passRetype.current.value !== this.state.userData.password ? '1px solid red' : 'initial';
	}
	
	static changeAvatar(e) {
		return Photos.convertFileToImage(e.target.files[0]);
	}
}