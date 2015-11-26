import React from 'react';
import { Router, Route, Link, Navigation, History } from 'react-router';
import auth from '../../services/authentication.jsx';

export default React.createClass({
	displayName: 'Header',
	logOut() {
		auth.logOut();
		this.props.history.pushState(null,'/');
	},
	render() {
		return (
			<header className="mainHeader">
				<div className="innerWrap card">
					<img src="../images/logo-hackeryou.svg" alt="HackerYou Logo" className="topLogo" />
					<h3>Hello, {this.props.user.first} {this.props.user.last}</h3>

					<p className="signOut"><a href="#" className="strong" onClick={this.logOut}><i className="chalk-log-out"></i>Log out of {this.props.user.email}</a></p>
				</div>
			</header>
		)
	}
});