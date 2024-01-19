import React from 'react';
import '../../App.css';
import { Card, Button, Col, Row, Modal, Alert, Badge, ListGroup, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { dateConvert, tConvert, tConvertHM } from '../Utilities/timeconvert';

const SAMPLE_FOOD = [
  {
    item_name: "pork",
    category: "restaurant",
    type: "mains",
    cogs: 0,
    price: 0,
    est_time: 20,
  },
  {
    item_name: "chicken",
    category: "restaurant",
    type: "mains",
    cogs: 0,
    price: 0,
    est_time: 20,
  },
]

const SAMPLE_ORDER = [
  {
    item: SAMPLE_FOOD[0],
    cancelled: false,
    done_time: "",
  },
  {
    item: SAMPLE_FOOD[1],
    cancelled: false,
    done_time: "test",
  },
]
const SAMPLE_ORDER_SLIPS = {
  1: {
    os_no: 1,
    datetime: new Date("1/19/24 21:22:44"),
    taker: "Gen",
    orders: SAMPLE_ORDER,
    table: "Dining 1",
    requests: "Allergic to shrimps",
    done_time: "",
  },
  2: {
    os_no: 2,
    datetime: new Date("1/19/24 20:24:44"),
    taker: "Gen",
    orders: SAMPLE_ORDER,
    table: "Dining 2",
    requests: "Allergic to shrimps",
    done_time: "test",
}}

class OrderSlipsSummaryN extends React.Component  {

  state = {
    currenttime12H: 0,
    currenttime: 0,
    timeordered: new Date().getTime(),
    modalOSShow: false,
    selectedorderslip: {
      os_no: -1,
      datetime: new Date(),
      taker: "",
      orders: [],
      table: "",
      requests: "",
      done_time: "",
    },
    orderslips: SAMPLE_ORDER_SLIPS,
    food: SAMPLE_FOOD,
  }
  
  componentDidMount() {
    this.getCurrentTime()
  }

  modalOSToggle = () => {
    this.setState({
      modalOSShow: this.state.modalOSShow ? false: true,
    })
  }

  getCurrentTime = () => {
      const date = new Date()
      const hour = date.getHours().toString().length == 1 ? "0" + date.getHours(): date.getHours()
      const minutes = date.getMinutes().toString().length == 1 ? "0" + date.getMinutes(): date.getMinutes()
      const seconds = date.getSeconds().toString().length == 1 ? "0" + date.getSeconds(): date.getSeconds()
      this.setState({
        currenttime12H: tConvert(hour + ':' + minutes + ':' + seconds),
        currenttime: date,
      }, () => {
        setTimeout(() => this.getCurrentTime(), 1000)
      })
  }

  remainingTime = (timeIn, timeSch) => {
    const currentTime = new Date()
    const time = new Date(timeIn)
    const timeRemaining = time;
    timeRemaining.setMinutes(time.getMinutes() + timeSch)

    const result = (timeRemaining.getTime() - currentTime.getTime())/60000
    return result <= 0 ? 0: result;
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
              <Button style={{margin: 10, width:'60%'}} variant="info" onClick={() => this.modalOSToggle()}>New OS</Button>
            </Col>
          </Row>
          <p style={{color: 'white', fontSize:50}}>
            Order Slips - {this.state.currenttime12H}
          </p>
        </div>
      <header className="App-header">
        
          <Row>
            {
                Object.keys(this.state.orderslips).map((keyName, i) => {
                  return (
                    <Col xs={6} md={4}>
                      <Card style={{ width: '18rem' }}>
                        <Card.Body>
                            <Card.Title style={{fontSize:35}}>{this.state.orderslips[keyName].table} <Badge>{tConvertHM(dateConvert(this.state.orderslips[keyName].datetime))}</Badge></Card.Title>
                            <Card.Text style={{fontSize:15}}>
                              <ListGroup as="ul">
                                {
                                  Array.from(this.state.orderslips[keyName].orders).map((_,index) => (
                                    <ListGroup.Item as="li">
                                      {this.state.orderslips[keyName].orders[index].item.item_name} <Badge bg={this.state.orderslips[keyName].orders[index].done_time !== "" ? "success": "warning"}>{this.state.orderslips[keyName].orders[index].done_time !== "" ? "Done": "In Progress"}</Badge> - {parseInt(this.remainingTime(this.state.orderslips[keyName].datetime,this.state.orderslips[keyName].orders[index].item.est_time))} mins left
                                    </ListGroup.Item>
                                  ))
                                }
                                  
                                </ListGroup>
                            </Card.Text>
                            <Button onClick={() => {
                                this.setState({
                                  selectedorderslip: this.state.orderslips[keyName]
                                }, () => {
                                  this.modalOSToggle()
                                })
                              }} 
                              variant="success" >View Order Slip</Button>
                        </Card.Body>
                        </Card> 
                      </Col>
                  )
                })
              }
          </Row>
            
      </header>
      <Modal size='lg' show={this.state.modalOSShow}>
        <Modal.Header>
            <Modal.Title>OS No.: {this.state.selectedorderslip.os_no} <Badge>{tConvertHM(dateConvert(this.state.selectedorderslip.datetime))}</Badge> Table: {this.state.selectedorderslip.table}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ListGroup as="ul">
                {
                  Array.from(this.state.selectedorderslip.orders).map((_,index) => (
                    <ListGroup.Item as="li">
                      <Container>
                        <Row>
                          <Col xs={6} md={4}>{this.state.selectedorderslip.orders[index].item.item_name} <Badge bg={this.state.selectedorderslip.orders[index].done_time !== "" ? "success": "warning"}>{this.state.selectedorderslip.orders[index].done_time !== "" ? "Done": "In Progress"}</Badge></Col>
                          <Col xs={6} md={4}><Badge bg={this.remainingTime(this.state.selectedorderslip.datetime,this.state.selectedorderslip.orders[index].item.est_time) ? 'primary': 'danger'}>{parseInt(this.remainingTime(this.state.selectedorderslip.datetime,this.state.selectedorderslip.orders[index].item.est_time))} mins left</Badge></Col>
                          <Col xs={6} md={4}>
                            <Button on onClick={() => {alert("Cancel?")}} 
                                style={{width: '100%', margin: 5}} 
                                variant="danger">
                                  Cancel
                              </Button>
                              <Button onClick={() => {alert("Cancel?")}} 
                                style={{width: '100%', margin: 5}} 
                                variant="warning">
                                  Return
                              </Button>
                          </Col>
                        </Row>
                      </Container>
                    </ListGroup.Item>
                  ))
                }
              </ListGroup>
            
            
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.modalOSToggle()}>Close</Button>
            <Button variant="primary">Table Change</Button>
            <Button variant="primary">Save changes</Button>
          </Modal.Footer>
      </Modal>
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