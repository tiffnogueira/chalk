import React from 'react';
import { Link , History} from 'react-router';
import LessonDetails from '../lessondetails/index.jsx';
import Modal from '../modal/index.jsx';
let ReactCSSTransitionGroup = require('react-addons-css-transition-group');
import AuthMixin from '../../services/authMixin.jsx';
import coursesData from '../../services/courses.jsx';
import userData from '../../services/user.jsx';
import TestData from '../../services/tests.jsx';
import questionData from '../../services/questions.jsx'
import config from '../../services/config.jsx';
import CreateTest from '../create-test/index.jsx';
import QuestionCards from '../questions/cards.jsx';
import CodeMirror from 'react-codemirror';


export default React.createClass({
	displayName: 'ViewTest',
	mixins: [AuthMixin,History],
	getInitialState(){
		return{
			members: [],
			questions: [],
			assertions: {},
			answer: {},
			mode: 'javascript',
			user: {},
			isStudent: false,
			testInfo: {
				test: {}
			},
			testSubmitted: false

		}
	},
	componentDidMount() {
		//this.props.params.testId
		TestData.getTest(this.props.params.testId)
			.then(res => {
				// console.log("the test", res)
				const questions = res.test.questions;
				this.setState({
					testInfo: res,
					questions
				})
			});
		userData.getUser(config.getUserId()).then(res=>{
			if(res.user.admin === false || res.user.instructor === false) {
				this.setState({
					isStudent: true
				})
			} else {
				this.setState({
					isStudent: false
				})
			}

			this.setState({
				user: res.user
			})
		});
	},
	//Handles Codemirror implementation
	changeMode(e) {
		var mode = e.target.value;
		this.setState({
			mode: mode
		});

	},
	//Handles Codemirror implementation
	updateAnswer(userAnswer,questionId) {
		//get the orginal state
		//make a copy of the original object using Object.assign
		//first arg is making the copy {}
		//and second arg is the object you are making a copy of
		const ogAnswer = Object.assign({},this.state.answer)
		//getting the Id of the specific code question [questionId]
		//and reassigning the value of newCode
		ogAnswer[questionId] = userAnswer

		this.setState({
			answer: ogAnswer
		})

	},
	dryrun(e,questionId) {
		e.preventDefault();
		console.log(questionId);

		questionData.questionDryrun(questionId, this.state.answer[questionId])
			.then(res => {
				console.log("it worked", res);
				console.log("answer", this.state.assertions[questionId] = res)
				this.renderValidation(questionId)
				
				const ogAss = Object.assign({}, this.state.assertions);
				ogAss[questionId] = res.results
				console.log("ass", ogAss);

				this.setState({
					assertions: ogAss
				})
			})


	}, 
	renderValidation(questionId) {
		if(this.state.assertions[questionId]) {
			const status = this.state.assertions[questionId].success;
				return (
					<div className="validateScreen">
						<ul>
							<li>{status === true ? "Success: Code is valid!" : "Failed: Code is invalid"}</li>
						</ul>
					</div>
				)
		} 
	},
	evaluate() {
		//grab all of the ANSWERS to the questions
		//grab the userId and the answers
		const userId = config.getUserId();
		const answerArray = []
		for(let key  in this.state.answer) {
			answerArray.push({
				questionId: key,
				answer: this.state.answer[key]
			})
		}
		console.log("submitted");
		this.setState({
			testSubmitted: true
		})
		TestData.addUser(this.props.params.testId)
			.then(res => {
				TestData.evaluateTest(userId, this.props.params.testId, answerArray)
					.then(res => {
						console.log("ress", res)
					})
			})

	},
	renderCode(question) {
	//Handles Codemirror implementation
		var options = {
			lineNumbers: true,
			mode: this.state.mode,
			theme: 'material',
			fixedGutter: true
		};
		return (

			<div>
		 		<CodeMirror value={this.state.answer[question._id]} onChange={(newCode) =>  this.updateAnswer(newCode,question._id)} options={options}/>
				<select onChange={this.changeMode} value={this.state.mode} className="fieldRow">
					<option value="markdown">Markdown</option>
					<option value="javascript">JavaScript</option>
				</select>
				<input type="submit" value="validate" className="success" onClick={e => this.dryrun(e,question._id)}/>		
				{this.renderValidation(question._id)}
			</div>
		)
	},
	renderQuestions() {
		const questions = this.state.questions;
		return (
			questions.map((res, i) => {
				// console.log(res)
				let mc = res.multiChoice;
				return (
					<div key={i} className="full detailsForm card">
						<h3>{res.body}</h3>
						{
							(() => {
								if(res.type === "multiple choice") {
									return mc.map((item, i) => {
										return (
											<div key={i} className="fieldRow fieldRowQuestion">
												<input onChange={() => this.updateAnswer(item.value, res._id)} name={res._id} type="radio" value={item.value} />
												<label>{item.label}</label>
											</div>
										)
									});
								} else {
									return (
										<div>
											{this.renderCode(res)}
										</div>
									) 
								} 
							})()
						}
					</div>
				)
			})
		)
	},
	render() {
		const testInfo = this.state.testInfo;
		const isStudent = this.state.isStudent;
		let testSubmitted = (
			<h3>Test submitted!</h3>
		)
		let studentView = (
			<div>
				<a className='button' onClick={this.evaluate}>Submit Test</a>
				{this.state.testSubmitted === true ? testSubmitted : null}
			</div>
		);
		let adminView = (
			<Link className='button' to={`/edit-test/${this.state.testInfo.test._id}`}>Back</Link>
		);
		return (
			<div className='classCard'>
				<h2>{testInfo.test.title}</h2>
				{this.renderQuestions()}
				{isStudent === true ? studentView : adminView}
			</div>
		)
	}	
});