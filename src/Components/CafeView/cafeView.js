import React from 'react';
import '../../App.css';
import { Card, Button, Col, Row, Modal, Alert, Badge, ListGroup, Container, Form, Dropdown, InputGroup, DropdownButton, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { arrayToObject, countProgressItems, dateConvert, tConvert, tConvertHM, tSQLConvert } from '../Utilities/timeconvert';
import { CAT_CAFE, chefs, menu, tables, taker } from '../Utilities/data';
import { addOrderSlip, cancelOrderFromOS, cancelOrderSlip, getAvailableMenu, getBarista, getEmployees, getMenu, getOpenOrderSlips, getOrderSlips, getReservationsIncoming, getServers, getTables, updateChefFromOrder, updateOrderFromOS, updateOrderStatusDone } from '../Utilities/requests';
import { toWords } from 'number-to-words';
import { format } from 'date-fns';

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

const SAMPLE_ORDER = JSON.stringify([{item: SAMPLE_FOOD[0],cancelled: false,returned: false,donetime: "",chef_id: 0,quantity: 1,},{item: SAMPLE_FOOD[1],cancelled: false,returned: false,donetime: "test",chef_id: 0,quantity: 1,},])

const PLACEHOLDER_OS = {
  os_no: null,
  dtime: new Date(""),
  taker: null,
  orders: SAMPLE_ORDER,
  table: null,
  requests: null,
  donetime: null,
  cancelled: "1",
}

const ORDERSLIPDEFAULT = [{
  os_no: "null",
  dtime: new Date(),
  taker: 0,
  orders: SAMPLE_ORDER,
  table_no: 0,
  requests: "",
  donetime: "",
  cancelled: true,
}]


class CafeViewSummaryN extends React.Component  {

  state = {
    currenttime12H: 0,
    currenttime: 0,
    modalOSShow: false,
    modalConfirmation: false,
    selectedorder: {},
    orderslips: ORDERSLIPDEFAULT,
    food: menu,
    numberOfRows: 3,
    orders: [],
    currentorder: {},
    tables:tables,
    takers: taker,
    barista: chefs,
    reservations: [],
    selectedIndex: -1,
    modalResShow: false,
    progressqtyorder: [],
    oscount: 0,
  }
  
  componentDidMount() {
    this.getCurrentTime()
    getBarista((responseBaristas) => {
      getServers((responseEmployees) => {
        getTables((responseTables) => {
          getAvailableMenu((responseFood) => {
            this.setState({
              food: responseFood.response,
              tables: responseTables.response,
              takers: arrayToObject(responseEmployees.response),
              barista: arrayToObject(responseBaristas.response)
            },() => {
              this.loadOrderSlips()
              this.loadReservations()
            })
          })
        })
      })
    })
  }

  loadReservations() {
    getReservationsIncoming((responseRes) => {
      const resp = (responseRes.response.length !== 0 ? responseRes.response: [])
      this.setState({
        reservations: resp,
      }, () => {
        setTimeout(() => this.loadReservations(), 15000)
      })
    })
  }

  loadOrderSlips() {
    getOpenOrderSlips((responseOS) => {
      const resp = (responseOS.response.length !== 0 ? responseOS.response: [PLACEHOLDER_OS])
      var exorders = []
      var temposcount = 0

      Array.from(resp).map((_,i) => {
        const order = JSON.parse(resp[i].orders)
        if((resp[i] && resp[i].cancelled !== "1" && countProgressItems(order,CAT_CAFE) !== 0 && resp[i].donetime === "0000-00-00 00:00:00")){
          Array.from(order).map((_,j) => {
            const existing = exorders.findIndex(obj => {
              return obj.id !== undefined ? obj.id === order[j].item.menu_id: -1;
            });
            if(order[j].donetime === "0000-00-00 00:00:00" && order[j].item.cat == CAT_CAFE) {
              if(existing !== -1){
                exorders[existing] = {id:exorders[existing].id, name:exorders[existing].name, quantity: exorders[existing].quantity + order[j].quantity}
              } else {
                exorders.push({id:order[j].item.menu_id, name:order[j].item.name, quantity: order[j].quantity})
              }
            }
            
          })
          temposcount = temposcount + 1
        }
        
      })

      this.setState({
        orderslips: resp,
        progressqtyorder: exorders,
        oscount: temposcount,
      }, () => {
        setTimeout(() => this.loadOrderSlips(), 1000)
        
      })
    })
  }

  modalResToggle = () => {
    this.setState({
      modalResShow: this.state.modalResShow ? false: true,
    })
  }

  modalOSToggle = () => {
    this.setState({
      modalOSShow: this.state.modalOSShow ? false: true,
    })
  }
  
  modalDoneConfirmationToggle = () => {
    this.setState({
      modalConfirmation: this.state.modalConfirmation ? false: true,
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
    const nTimeIn = new Date(timeIn)
    const currentTime = new Date()
    const time = new Date(nTimeIn.getTime()+(timeSch*60000))
    const timeRemaining = time;
    const result = (timeRemaining.getTime() - currentTime.getTime())/60000
    return result <= 0 ? 0: result;
  }

  cancelAll = (os) => {
    const selection = prompt("Save? Type 'Y' or 'y' to continue")
    if(selection === "Y" || selection === "y") {
      this.modalOSToggle()
      cancelOrderSlip(os, (message) => {
        getOrderSlips((responseOS) => {
          this.setState({
            orderslips: responseOS.response,
          })
        })
      })
    }
  }

  cancelOrder = (os, index) => {
    const selection = prompt("Save? Type 'Y' or 'y' to continue")
    if(selection === "Y" || selection === "y") {
      cancelOrderFromOS(os,index, (message) => {
        
        getOrderSlips((responseOS) => {
          this.setState({
            orderslips: responseOS.response,
          })
        })
      })
    }
  }

  numberOfRowsCalc = (value) => {
    var finalVal = (value > 40 ? 40: (value < this.state.orders.length ? this.state.orders.length: value < 1 ? 1:Number(value)))
    this.setState({numberOfRows: finalVal})
  }

  checkInvalid(data) {
    if(data === undefined || 
      data === null || 
      data == {} || 
      data == [] ||
      data.length === 0 ||
      Object.keys(data).length === 0
      ) {
      return true
    } else {
      return false
    }
  }

  changeChef(os,index,chef_id) {
    updateChefFromOrder(os,index,chef_id, () => {
      getOrderSlips((responseOS) => {
        this.setState({
          orderslips: responseOS.response,
        })
      })
    })
  }

  doneOrder(os,index) {
    updateOrderStatusDone(os,index, () => {
      getOrderSlips((responseOS) => {
        this.setState({
          orderslips: responseOS.response,
          selectedorder: {},
        }, () => {
          
        })
      })
    })
    this.modalDoneConfirmationToggle()
  }

  colorProgressTime(timeIn,timeEst,donetime) {
    
    return donetime !== "" ? this.remainingTime(timeIn,timeEst) ? "warning": "danger": "success"
  }
  
  render() {
    return (
      <div className="App">
        <div className="top-nav">
          <Row>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'100%', color: 'white'}} variant="secondary" href="/">Back</Button>
            </Col>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'100%', color: 'Green'}} variant="light" onClick={() => this.props.navigate(-1)}>History</Button>
            </Col>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'80%', color: 'white'}} variant="info" onClick={() => this.props.navigate(-1)}>Reservations</Button>
            </Col>
          </Row>
          <Card>
            <Card.Title style={{fontWeight: 'bolder'}}>{this.state.currenttime12H}</Card.Title>
            <Card.Title style={{fontWeight: 'bolder'}}>{new Date().getMonth()+1}/{new Date().getDate()}/{new Date().getFullYear()}</Card.Title>
          </Card>
          <p style={{color: 'white', fontSize:50}}>
            Cafe View {this.state.orderslips.length !== 0 ? <Badge pill bg="primary">{this.state.oscount} </Badge>: null}
          </p>
        </div>
      <header className="App-header">
        <Row>
            <Col xs={6} md={2}>
              <Card style={{backgroundColor: '#140d07', color: "white", margin: 5, textAlign: 'left'}}>
                <Card.Body>
                  <p style={{fontSize: 30, color: "green"}}>
                    OPEN ORDERS
                  </p>
                        
                  {Array.from(this.state.progressqtyorder).map((_,index) => {
                    return (<Row>
                      <p style={{fontSize: 15}}>{this.state.progressqtyorder[index].name}: {this.state.progressqtyorder[index].quantity}</p>
                    </Row>)
                  })}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={10}>
              <Row>
                {
                    Object.keys(this.state.orderslips).map((keyName, i) => {
                      const orders = this.state.orderslips[i].orders !== undefined ? JSON.parse(this.state.orderslips[i].orders): []

                      return (this.state.orderslips[i] && this.state.orderslips[i].cancelled !== "1" && countProgressItems(orders,CAT_CAFE) !== 0 && this.state.orderslips[i].donetime === "0000-00-00 00:00:00") ? (
                        <Col xs={6} md={6}>
                          <Card>
                            <Card.Body>
                                <Card.Title style={{fontSize:35}}>{this.state.orderslips[i].table} <Badge bg='dark'>OS {this.state.orderslips[i].os_no} - {tConvertHM(dateConvert(this.state.orderslips[i].dtime))} - {this.state.tables[this.state.orderslips[i].table_no-1] !== undefined ? this.state.tables[this.state.orderslips[i].table_no-1].table_name: ""}</Badge></Card.Title>
                                <Card.Text style={{fontSize:15}}>
                                  <ListGroup as="ul">
                                    <Container>
                                    {
                                      Array.from(orders).map((_,index) => { 
                                        return (orders[index].cancelled !== "1" && orders[index].cancelled !== 1) && orders[index].item.cat == CAT_CAFE ? (
                                          <ListGroup.Item as="li" style={{backgroundColor: orders[index].donetime === "0000-00-00 00:00:00" ? "white": "#cefad0"}}>
                                            <Row style={{textAlign: "center"}}>
                                              <Col xs={4} md={4} style={{fontWeight: "bold"}}>{orders[index].item.name}</Col>
                                                <Col xs={2} md={2}>{orders[index].quantity} {'('}{toWords(orders[index].quantity)}{')'}</Col>
                                                <Col xs={2} md={2}><Badge style={{width: '100%'}} bg={this.colorProgressTime(this.state.orderslips[i].dtime,orders[index].item.est_time,orders[index].item.donetime)}>{parseInt(this.remainingTime(this.state.orderslips[i].dtime,orders[index].item.est_time))} mins left</Badge></Col>
                                                <Col xs={4} md={4}>
                                                    <Dropdown>
                                                      <Dropdown.Toggle variant="secondary" id="dropdown-basic" style={{width: "100%", margin: 5}}>
                                                        {this.state.barista[orders[index].chef_id] === undefined || orders[index].chef_id === undefined ? "Select Barista": this.state.barista[orders[index].chef_id].nickname} 
                                                      </Dropdown.Toggle>
                                                      <Dropdown.Menu>
                                                        {
                                                          Object.keys(this.state.barista).map((key, dpIndex) => (
                                                            <Dropdown.Item onClick={() => {
                                                              this.changeChef(this.state.orderslips[i],index,this.state.barista[key].id)
                                                            }} 
                                                            href="#/action-1" key={key}>{this.state.barista[key].nickname}</Dropdown.Item>
                                                          ))
                                                        }
                                                      </Dropdown.Menu>
                                                    </Dropdown>
                                                    { 
                                                    (!(orders[index].chef_id === null || orders[index].chef_id === undefined) && orders[index].donetime === "0000-00-00 00:00:00") ? 
                                                      <Button on onClick={() => {
                                                        this.setState({
                                                          modalConfirmation: true,
                                                          selectedorder: {os: this.state.orderslips[i], index: index}
                                                        })
                                                      }} 
                                                        style={{width: '100%', margin: 5}} 
                                                        variant="success">
                                                        Done
                                                      </Button>
                                                    : null}
                                                </Col>
                                            </Row>
                                            
                                          </ListGroup.Item>
                                      ): null
                                    })
                                    }
                                    </Container>
                                    
                                    </ListGroup>
                                </Card.Text>
                            </Card.Body>
                            </Card> 
                          </Col>
                      ): null
                    })
                  }
              </Row>
            </Col>
        
          
          </Row>
      </header>

      {/*SHOW CHEF SELECTION*/}
      <Modal size='lg' show={this.state.modalConfirmation}>
        <Modal.Header>
          <Modal.Title style={{justifyContent: "center"}}>
            Done Order?
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button style={{width: "100%"}} variant="secondary" onClick={() => this.modalDoneConfirmationToggle()}>No</Button>
          <Button style={{width: "100%"}} variant="success" onClick={() => { 
            this.doneOrder(this.state.selectedorder.os,this.state.selectedorder.index)
            }}>Yes</Button>
        </Modal.Footer>
      </Modal>
      {/*EXISTING RESERVATIONS*/}
      {this.state.selectedIndex !== -1 ? <Modal size='lg' show={this.state.modalResShow}>
        <Modal.Header>
            <Modal.Title style={{width: '100%'}}>
              <Col>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}>
                    Res No.:
                  </Col>
                  <Col xs={6} md={4}>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      disabled
                      value={this.state.selectedIndex != -1 ? this.state.reservations[this.state.selectedIndex].res_no: ""}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    Taker:
                  </Col>
                  <Col xs={6} md={4}>
                    <Form.Control disabled type="text" value={this.state.selectedIndex != -1 ? this.state.takers[this.state.reservations[this.state.selectedIndex].taker].name: ""} />
                  </Col>
                </Row>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}> Date: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      disabled
                      type="text"
                      value={this.state.selectedIndex != -1 ? format(new Date(this.state.reservations[this.state.selectedIndex].service_time), "MM/dd/yy"): ""}
                    />
                  </Col>
                  <Col xs={6} md={2}> Table: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control disabled type="text" value={this.state.selectedIndex != -1 ? this.state.tables[this.state.reservations[this.state.selectedIndex].table_no].table_name: 0} />
                  </Col>
                </Row>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}> Time: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      disabled
                      value={this.state.selectedIndex != -1 ? tConvertHM(dateConvert(new Date(this.state.reservations[this.state.selectedIndex].service_time))): ""}
                    />
                  </Col>
                  <Col xs={6} md={2}> PAX: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="number" disabled value={this.state.selectedIndex != -1 ? this.state.reservations[this.state.selectedIndex].pax: ""}/>
                  </Col>
                </Row>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}> Name: </Col>
                  <Col xs={6} md={4}>
                  <Form.Control  type="name" disabled value={this.state.selectedIndex != -1 ? this.state.reservations[this.state.selectedIndex].res_name: ""}/>
                  </Col>
                  <Col xs={6} md={2}> Phone: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="text" disabled value={this.state.selectedIndex != -1 ? this.state.reservations[this.state.selectedIndex].res_contact: ""}/>
                  </Col>
                </Row>
                </Col>
              <Badge bg="dark">{}</Badge>
              
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ListGroup as="ul">
                <Container>
                {
                  Array.from(this.state.selectedIndex != -1 ? this.state.reservations[this.state.selectedIndex].orders: 0).map((_,index) => {
                    const orders = JSON.parse(this.state.reservations[this.state.selectedIndex].orders)
                    
                    return (orders !== undefined && orders[index] !== undefined && orders.length !== 0 && this.state.reservations[this.state.selectedIndex] !== undefined && orders[index].cancelled !== "1" && orders[index].cancelled !== 1) ? (<ListGroup.Item as="li">
                      
                        <Row>
                          <Col xs={6} md={6} style={{width: '40%'}}>{orders[index].item.name}</Col>
                          <Col xs={6} md={6} style={{width: '30%'}}><Badge style={{width: '100%'}} bg={'success'}>{orders[index].quantity} {'('}{toWords(orders[index].quantity)}{')'}</Badge></Col>
                        </Row>
                    
                    </ListGroup.Item>): null
              })
                }
                </Container>
              </ListGroup>
            
            <InputGroup style={{marginTop: 10}}>
              <InputGroup.Text>Note</InputGroup.Text>
              <Form.Control size='lg' as="textarea" aria-label="With textarea" disabled value={this.state.reservations[this.state.selectedIndex] != undefined ? this.state.reservations[this.state.selectedIndex].notes: ""}/>
            </InputGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.modalResToggle()}>Close</Button>
          </Modal.Footer>
      </Modal>: null}
    </div>
    )
    
  }
    
}

function CafeViewSummary(props) {
    let navigate = useNavigate();

    return (
            <CafeViewSummaryN {...props} navigate={navigate}/>
      
    )
}

export default CafeViewSummary