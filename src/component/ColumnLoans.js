import React from 'react';
import {Card, Icon, Row, Col, Drawer, Form, Input, DatePicker, Button, message} from 'antd';
import store from "../store";
import {Query} from "leancloud-storage";
import {getLoansResult} from "../store/actionCreator";
import {editLoansDate} from "../services/LeanCloud/loansDataAction";
import locale from "antd/lib/date-picker/locale/zh_CN";
import moment from 'moment';
require('./style/ColumnLoans.css');
class ColumnLoans extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			drawerStatus: false,
			current: {}
		};
		this.unsubscribe = store.subscribe(()=>{this.setState(store.getState())});
	}

	componentDidMount() {
		this.getLoansData();
	}
	componentWillUnmount() {
		this.unsubscribe();
	}

	//唤出修改账单数据的抽屉
	showDrawer = (value) =>{
		this.setState({drawerStatus:!this.state.drawerStatus,current:value});
	};
	//获取贷款数据
	getLoansData = () =>{
		let query = new Query('Loans');
		query.equalTo('username',store.getState().active_user);
		query.find().then((result)=>{
			result = result.map((index)=>{
				index._serverData.id = index.id;
				return index._serverData
			});
			const action = getLoansResult(result);
			store.dispatch(action);
		},(error)=>{console.log(error)});
	};
	//提交修改
	handleSubmit = (e) =>{
		e.preventDefault();
		console.log(this.state.current)
		this.props.form.validateFields((err,values) =>{
			values.repaymentDate = this.state.current.repaymentDate;
			editLoansDate(this.state.current.id,values)
		})
		this.setState({drawerStatus:false});
		message.success('修改成功');
	};
	render(value) {
		const {getFieldDecorator} = this.props.form;
		return (
			<div className='loans'>
				<Row className='loansList'>
						{
							store.getState().loans_result.map((index,key)=>{
								return <Col xs={24} sm={24} md={12} lg={8} xl={6} key = {key}>
									<Card
										actions={[
											<Icon type="check"/>,
											<Icon type="edit" onClick={this.showDrawer.bind(this,index)}/>
										]}
										className='loansOption'
									>
										<p>借款方：{index.borrower}</p>
										<p>被借款方：{index.lender}</p>
										<p>借款金额：{index.borrowingBalance}元</p>
										<p>预计还款日期：{index.repaymentDate}</p>
									</Card>
								</Col>;
							})
						}
				</Row>
				<Drawer
					title="修改借贷管理"
					placement="right"
					width={500}
					closable={true}
					maskClosable={true}
					onClose={this.showDrawer}
					visible={this.state.drawerStatus}
				>
					<Form onSubmit={this.handleSubmit}>
						<Form.Item>
							<strong>出借方：</strong>
							{
								getFieldDecorator('lender', {
									initialValue:this.state.current.lender
								})(
									<Input placeholder="请输入出借方" style={{width: '80%'}}/>
								)
							}
						</Form.Item>
						<Form.Item>
							<strong>借款人：</strong>
							{
								getFieldDecorator('borrower', {
									initialValue: this.state.current.borrower
								})(
									<Input placeholder="请输入借款人" style={{width: '80%'}}/>
								)
							}
						</Form.Item>
						<Form.Item>
							<strong>借款金额：</strong>
							{
								getFieldDecorator('borrowingBalance',{
									initialValue:this.state.current.borrowingBalance
								})(
									<Input placeholder="请输入花费金额" style={{width:'80%'}}/>
								)
							}
						</Form.Item>
						<Form.Item>
							<strong>还款日期：</strong>
							<DatePicker
								locale={locale}
								onChange={this.getRepaymentDate}
								value={moment(this.state.current.repaymentDate,'YYYY-MM-DD')}
							/>
						</Form.Item>
						<Form.Item>
							<strong>备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注：</strong>
							{
								getFieldDecorator('note', {
									initialValue:this.state.current.note
								})(
									<Input style={{width: '80%'}} placeholder="请输入备注信息"/>
								)
							}
						</Form.Item>
						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								className="login-form-button"
							>
								修改
							</Button>
						</Form.Item>
						{}
					</Form>
				</Drawer>
			</div>
		);
	}
}
export default Form.create()(ColumnLoans);