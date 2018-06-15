import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default class Alert extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			isOpen: props.isOpen || false,
			message: props.message || ''
		};
		
		this.toggle = this.toggle.bind(this);
	}
	
	toggle(e = null, message = '') {
		this.setState((prevState) => ({
			isOpen: !prevState.isOpen,
			message: message
		}));
		
		if(typeof this.props.toggle === 'function') {
			this.props.toggle(e, message, this.props.title);
		}
	}
	
	componentWillReceiveProps(nextProps) {
		this.setState({
			isOpen: nextProps.isOpen || false,
			message: nextProps.message || ''
		});
	}
	
	render() {
		return <Modal isOpen={this.state.isOpen} toggle={this.toggle} className={'modal-lg'}>
			<ModalHeader toggle={this.toggle}>{this.props.title}</ModalHeader>
			<ModalBody>
				<div className='h2 text-center'>{this.state.message}</div>
			</ModalBody>
			<ModalFooter>
				<Button color="primary" onClick={this.props.confirm}>Yes</Button>
				<Button color="secondary" onClick={this.toggle}>No</Button>
			</ModalFooter>
		</Modal>
	}
}