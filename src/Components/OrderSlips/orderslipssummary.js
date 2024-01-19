import React, { Component } from 'react';
import '../../App.css';
import { Card, Button, Col, Row, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router';

class OrderSlipsSummaryN extends React.Component  {

  state = {
    currenttime: 0,
    timeordered: new Date().getTime(),
  }

  componentDidMount() {
    this.getCurrentTime()
  }

  getCurrentTime = () => {
    const date = this.state.timeordered - new Date().getTime();
    const showTime = date;

      this.setState({
        currenttime: new Date(showTime).getHours() + ':' + new Date(showTime).getMinutes() + ":" + new Date(showTime).getSeconds(),
      }, () => {
        setTimeout(() => this.getCurrentTime(), 1000)
      })
  }
  
  render() {
    return (
      <div className="App">
        <div className="top-nav">
          <Row>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'60%'}} variant="secondary" onClick={() => this.props.navigate(-1)}>Back</Button>
            </Col>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'60%'}} variant="light" onClick={() => this.props.navigate(-1)}>History</Button>
            </Col>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'60%'}} variant="info" onClick={() => this.props.navigate(-1)}>New OS</Button>
            </Col>
          </Row>
          <p style={{color: 'white', fontSize:50}}>
            Order Slips
          </p>
        </div>
      <header className="App-header">
        
          <Row>
            <Col xs={6} md={4}>
              <Card style={{ width: '18rem' }}>
                  <Card.Body>
                      <Card.Title style={{fontSize:35}}>Table 1</Card.Title>
                      <Card.Text>
                          <p style={{fontSize:15}}> 
                            Order 1 - {new Date(this.state.timeordered).getHours()  + ':' +  new Date(this.state.timeordered).getMinutes()  + ':' +  new Date(this.state.timeordered).getSeconds()} - {this.state.currenttime}
                             </p>
                          <p style={{fontSize:15}}> Order 1 - Time  </p>
                          <p style={{fontSize:15}}> Order 1 - Time  </p>
                        
                      </Card.Text>
                      <Button variant="success" >View Order Slip</Button>
                  </Card.Body>
              </Card> 
            </Col>
            
          </Row>
            
      </header>
    </div>
    )
    
  }
    
}

function OrderSlipsSummary(props) {
    let navigate = useNavigate();

    return (
            <OrderSlipsSummaryN {...props} navigate={navigate}/>
      
    )
}

export default OrderSlipsSummary