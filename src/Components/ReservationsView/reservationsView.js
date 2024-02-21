import React from 'react';
import '../../App.css';
import { Card, Button, Col, Row, Modal, Alert, Badge, ListGroup, Container, Form, Dropdown, InputGroup, DropdownButton, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { arrayToObject, dateConvert, tConvert, tConvertHM, tSQLConvert } from '../Utilities/timeconvert';
import { getNowDate, menu, tables, taker } from '../Utilities/data';
import { addOrderSlip, addReservations, billedAllOrders, cancelOrderFromOS, cancelOrderSlip, cancelReservation, getAvailableMenu, getEmployees, getLastOS, getMenu, getOpenOrderSlips, getOrderSlips, getReservations, getServers, getTables, updateOSReservation } from '../Utilities/requests';
import { toWords } from 'number-to-words';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { ThirdPartyDraggable } from "@fullcalendar/interaction" // needed for dayClick
import googleCalendarPlugin from "@fullcalendar/google-calendar"
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
  donetime: "0000-00-00 00:00:00",
  cancelled: true,
}]


class ReservationsSummaryN extends React.Component  {

  state = {
    currenttime12H: 0,
    currenttime: 0,
    modalResShow: false,
    modalNewOSShow: false,
    modalNewMenuShow: false,
    modalNewOSQty: false,
    modalConfirmation: false,
    selectedorderslip: 0,
    newrestable: 0,
    newOSTaker: 0,
    orderslips: ORDERSLIPDEFAULT,
    food: menu,
    numberOfRows: 3,
    newresnote: "",
    newOrderSlip: {},
    orders: [],
    currentorder: {},
    tables:tables,
    takers: taker,
    newrestime: null,
    newresdate: null,
    newresname: null,
    newresnumber: null,
    newrespax: null,
    newresdp: 0,
    reservations: [{
      res_no: null,
      res_name: "",
      res_date: new Date(),
      res_contact: 0,
      pax: 0,
      orders: SAMPLE_ORDER,
      notes: "",
      service_time: new Date(),
      table_no: 0,
      os_no: 0,
    }],
    calendarevents: [],
    selectedIndex: -1,
  }
  
  componentDidMount() {
    this.getCurrentTime()

    getServers((responseEmployees) => {
      getTables((responseTables) => {
        getAvailableMenu((responseFood) => {
          this.setState({
            food: responseFood.response,
            tables: responseTables.response,
            takers: arrayToObject(responseEmployees.response)
          },() => {
            this.loadReservations()
          })
        })
      })
    })
  }

  loadReservations() {
    getReservations((responseRes) => {
      const resp = (responseRes.response.length !== 0 ? responseRes.response: [])
      this.setState({
        reservations: resp,
      }, () => {
        setTimeout(() => this.loadReservations(), 1000)
        var newResp = []
        Array.from(resp).map((_, index) => {
          newResp.push({id: index, title: String(tConvertHM(dateConvert(this.state.reservations[index].service_time)) + "|" + this.state.reservations[index].res_name + "|" + this.state.reservations[index].pax + "pax"), date: new Date(this.state.reservations[index].service_time)})
        })
        this.setState({
          calendarevents: newResp
        }, () => {
          
        })
      })
    })
  }

  modalResToggle = () => {
    this.setState({
      modalResShow: this.state.modalResShow ? false: true,
    })
  }

  modalNewOSToggle = () => {
    this.setState({
      modalNewOSShow: this.state.modalNewOSShow ? false: true,
      newOSTaker: "",
      newresnote: "",
      newrestable: {},
      orders: [],
      currentorder: {},
    })
  }

  modalNewMenuShow() {
    this.setState({
      modalNewMenuShow: this.state.modalNewMenuShow ? false: true,
      modalNewOSShow: this.state.modalNewOSShow ? false: true,
    })
  }

  modalNewOSQtySet(item_index) {
    this.setState({
      modalNewMenuShow: this.state.modalNewMenuShow ? false: true,
      modalNewOSQty: this.state.modalNewOSQty ? false: true,
      currentorder: {
        item: this.state.food[item_index],
        cancelled: 0,
        returned: 0,
        donetime: "0000-00-00 00:00:00",
        quantity: 1,
        chef_id: null,
      }
    })
  }

  modalToggleSetOSQty() {
    this.setState({
      modalNewMenuShow: this.state.modalNewMenuShow ? false: true,
      modalNewOSQty: this.state.modalNewOSQty ? false: true,
    })
  }

  modalDoneConfirmationToggle = () => {
    this.setState({
      modalConfirmation: this.state.modalConfirmation ? false: true,
      modalResShow: false,
    })
  }

  doneOrder() {
    billedAllOrders(this.state.reservations[this.state.selectedIndex], () => {
      getOrderSlips((responseOS) => {
        this.setState({
          orderslips: responseOS.response,
          selectedorderslip: 0,
        }, () => {
          
        })
      })
    })
    this.modalDoneConfirmationToggle()
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
      this.modalResToggle()
      cancelOrderSlip(os, (message) => {
        
        this.setState({
          selectedorderslip: 0,
        })
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
  setReservationDate = (date) => {
    this.setState({newresdate: date})
  }

  setReservationTime = (time) => {
    this.setState({newrestime: time})
  }

  setReservationDPAmount = (data) => {
    this.setState({newresdp: data})
  }

  setReservationName = (data) => {
    this.setState({newresname: data})
  }

  setReservationNumber = (data) => {
    this.setState({newresnumber: data})
  }

  setReservationPax = (data) => {
    this.setState({newrespax: data})
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

  checkResFields() {
    return this.checkInvalid(this.state.newresname) || this.checkInvalid(this.state.newresnumber) || this.checkInvalid(this.state.newrespax) || this.checkInvalid(this.state.newrestime)
  }

  saveNewRes() {
    if (this.checkInvalid(this.state.newresname) ||
      this.checkInvalid(this.state.newresnumber) ||
      this.checkInvalid(this.state.newrespax) ||
      this.checkInvalid(this.state.newrestime)
      ) {
        alert("Please input all fields")
    } else {
      const newRes = {
        res_no: null,
        res_name: this.state.newresname,
        res_date: new Date(),
        res_contact: this.state.newresnumber,
        pax: this.state.newrespax,
        orders: this.state.orders,
        notes: this.state.newresnote,
        service_time: new Date(this.state.newresdate + " " + this.state.newrestime),
        table_no: this.state.newrestable.table_no + 1,
        os_no: 0,
        taker: this.state.newOSTaker.id,
        cancelled: 0,
        numberOfRows: 3,
      }

      addReservations(newRes,(response) => {
        this.modalNewOSToggle()
        getReservations((responseRes) => {
          this.setState({
            reservations: responseRes.response,
          })
        })
      })
    }
  }

  cancelPromptReservation(res) {
    const selection = prompt("Save? Type 'Y' or 'y' to continue")
    if(selection === "Y" || selection === "y") {
      this.modalResToggle()
      cancelReservation(res, (message) => {
        this.setState({
          selectedIndex: -1,
        })
        getReservations((responseRes) => {
          this.setState({
            reservations: responseRes.response,
          })
        })
      })
    }
  }

  saveNewOrderslip() {
    
    const selection = prompt("Save? Type 'Y' or 'y' to continue")
    if(selection === "Y" || selection === "y") {
      if(this.state.reservations[this.state.selectedIndex].orders !== undefined && JSON.parse(this.state.reservations[this.state.selectedIndex].orders).length > 0) {
        const newOS = {
          os_no: 0,
          dtime: new Date(),
          taker: this.state.reservations[this.state.selectedIndex].taker,
          orders: JSON.parse(this.state.reservations[this.state.selectedIndex].orders),
          table: this.state.reservations[this.state.selectedIndex].table_no,
          requests: this.state.reservations[this.state.selectedIndex].notes,
          donetime: "0000-00-00 00:00:00",
          cancelled: false,
          billed: "",
          numberOfRows: 3,
        }
        
          getLastOS((responseLastOS) => {
            const newos = Number(responseLastOS.response[0].os_no) + 1
            addOrderSlip(newOS,(response) => {
              updateOSReservation(this.state.reservations[this.state.selectedIndex].res_no, newos,(responseOS) => {
                this.setState({
                  selectedIndex: -1,
                }, () => {
                  this.modalResToggle()  
                })
              })
            })
          })
        
        
      } else {
        updateOSReservation(this.state.reservations[this.state.selectedIndex].res_no, -1,(responseOS) => {
          this.setState({
            selectedIndex: -1,
          }, () => {
            this.modalResToggle()  
          })
        })
      }
    }
  }

  saveOrder(item_index) {
    const existing = this.state.orders.findIndex(obj => {
      return obj.item.menu_id === this.state.food[item_index].menu_id;
    });


    if (existing !== -1) {
      const tempOrders = this.state.orders

      tempOrders[existing] = {
        item: this.state.orders[existing].item,
        cancelled: this.state.orders[existing].cancelled,
        returned: this.state.orders[existing].returned,
        donetime: this.state.orders[existing].donetime,
        quantity: this.state.orders[existing].quantity + 1,
        chef_id: this.state.orders[existing].chef_id,
      }
      this.setState({
        modalNewMenuShow: false,
        modalNewOSQty: false,
        modalNewOSShow: true,
        orders: tempOrders,
        currentorder: {},
        numberOfRows: this.state.numberOfRows === this.state.orders.length + 1 ? this.state.numberOfRows + 1: this.state.numberOfRows
      }, () => {
        getOrderSlips((responseOS) => {
          this.setState({
            orderslips: responseOS.response,
          })
        })
      })
    } else {
      const currentorder = {
        item: this.state.food[item_index],
        cancelled: 0,
        returned: 0,
        donetime: "0000-00-00 00:00:00",
        quantity: 1,
        chef_id: null,
      }
  
      this.setState({
        modalNewMenuShow: false,
        modalNewOSQty: false,
        modalNewOSShow: true,
        orders: [...this.state.orders, currentorder],
        currentorder: {},
        numberOfRows: this.state.numberOfRows === this.state.orders.length + 1 ? this.state.numberOfRows + 1: this.state.numberOfRows
      }, () => {
        getOrderSlips((responseOS) => {
          this.setState({
            orderslips: responseOS.response,
          })
        })
      })
    }
  }

  deleteOrder(index) {
    var tempOrders = this.state.orders
    delete tempOrders[index]

    tempOrders = tempOrders.filter(function( element ) {
      return element !== undefined;
   });

    this.setState({
      orders: tempOrders,
    })
  }

  eventClick(event) {
    this.setState({
      modalResShow: true,
      selectedIndex: event.event.id,
    }, () => {
      
    })
  }
  
  render() {
    return (
      <div className="App">
        <div className="top-nav">
          <Row>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'100%', color: 'white'}} variant="secondary" onClick={() => this.props.navigate(-1)}>Back</Button>
            </Col>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'100%', color: 'Green'}} variant="light" onClick={() => this.props.navigate(-1)}>History</Button>
            </Col>
            <Col xs={6} md={4}>
              <Button style={{margin: 10, width:'80%', color: 'white'}} variant="success" onClick={() => this.modalNewOSToggle()}>Add Reservation</Button>
            </Col>
          </Row>
          <Card>
            <Card.Title style={{fontWeight: 'bolder'}}>{this.state.currenttime12H}</Card.Title>
            <Card.Title style={{fontWeight: 'bolder'}}>{new Date().getMonth()+1}/{new Date().getDate()}/{new Date().getFullYear()}</Card.Title>
          </Card>
          <p style={{color: 'white', fontSize:50}}>
            Reservations
          </p>
        </div>
        <FullCalendar
              eventBackgroundColor='black'
              plugins={[ dayGridPlugin, interactionPlugin, googleCalendarPlugin ]}
              initialView="dayGridMonth"
              weekends={true}
              eventContent={renderEventContent}
              eventClick={(e) => this.eventClick(e)}
              events={this.state.calendarevents}
            />

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
            <Button variant="danger" onClick={() => this.cancelPromptReservation(this.state.reservations[this.state.selectedIndex].res_no)}>Cancel</Button>
            <Button variant="success" onClick={() => this.saveNewOrderslip()}>{JSON.parse(this.state.reservations[this.state.selectedIndex].orders).length === 0 ? "Create New OS": "Arrived"}</Button>
          </Modal.Footer>
      </Modal>: null}

      {/*NEW RESERVATIONS*/}
      <Modal show={this.state.modalNewOSShow} fullscreen={true}>
        <Modal.Header>
            <Modal.Title style={{justifyContent: "center", width: "100%"}}>
              <Col>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}>
                    Table:
                  </Col>
                  <Col xs={6} md={4}>
                    <Dropdown>
                      <Dropdown.Toggle variant="secondary" id="dropdown-basic" style={{width: "100%"}}>
                        {(this.state.newrestable == {} || this.state.newrestable.table_name == null) ? "Select Table": this.state.newrestable.table_name} 
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {
                          Array.from(this.state.tables).map((_, index) => (
                            <Dropdown.Item onClick={() => {this.setState({newrestable: this.state.tables[index]})}} href="#/action-1" key={this.state.tables[index]}>{this.state.tables[index].table_name}</Dropdown.Item>
                          ))
                        }
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                  <Col xs={6} md={2}>
                    Taker:
                  </Col>
                  <Col xs={6} md={4}>
                    <Dropdown>
                      <Dropdown.Toggle variant="secondary" id="dropdown-basic" style={{width: "100%"}}>
                        {this.state.newOSTaker === "" ? "Select Taker": this.state.newOSTaker.nickname} 
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {
                          Object.keys(this.state.takers).map((key, index) => (
                            <Dropdown.Item onClick={() => {
                              this.setState({newOSTaker: this.state.takers[key]})
                            }} 
                            href="#/action-1" key={key}>{this.state.takers[key].nickname}</Dropdown.Item>
                          ))
                        }
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col>
                </Row>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}> Date: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="date" value={this.state.newresdate} onChange={(text) => {this.setReservationDate(text.target.value)}} />
                  </Col>
                </Row>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}> Time: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="time" value={this.state.newrestime} onChange={(text) => {this.setReservationTime(text.target.value)}} />
                  </Col>
                  <Col xs={6} md={2}> PAX: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="number" value={this.state.newrespax} onChange={(text) => {this.setReservationPax(text.target.value)}} />
                  </Col>
                </Row>
                <Row style={{marginBottom: 10}}>
                  <Col xs={6} md={2}> Name: </Col>
                  <Col xs={6} md={4}>
                  <Form.Control  type="name" value={this.state.newresname} onChange={(text) => {this.setReservationName(text.target.value)}} />
                  </Col>
                  <Col xs={6} md={2}> Phone: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="number" value={this.state.newresnumber} onChange={(text) => {this.setReservationNumber(text.target.value)}} />
                  </Col>
                </Row>
                
              </Col>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
          <Row>
            <Col xs={6} md={3}>
              <p style={{textAlign: 'center', fontWeight: "bold"}}>MENU</p>
                <ListGroup as="ul">
                    {/* IF DROPDOWN IS CHANGED AND NOT NONE, QTY IS 1 */}
                  {
                          Array(this.state.numberOfRows).fill(1).map((_,index) => (
                            <InputGroup className="mb-3">
                              <ButtonGroup justified style={{width: "80%"}}>
                              {this.state.orders[index] != null ? <Button onClick={() => { this.deleteOrder(index)}} variant="dark"> Remove </Button>: null}
                                <Button variant={this.state.orders[index] != null ? "success": "secondary"} style={{width: "100%", color: 'white'}}> {this.state.orders[index] != null ? this.state.orders[index].item.name: "Select Item"} </Button>
                              </ButtonGroup>
                              
                              <Form.Control value={this.state.orders[index] != null ? this.state.orders[index].quantity: ""} type='number' style={{width: '20%', flex: 'none'}} onChange={(data) => {
                                const tempOrders = this.state.orders;
                                const currentQty = data.target.value
                                
                                tempOrders[index] = {
                                  item: tempOrders[index].item,
                                  cancelled: tempOrders[index].cancelled,
                                  returned: tempOrders[index].returned,
                                  donetime: tempOrders[index].donetime,
                                  chef_id: tempOrders[index].chef_id,
                                  quantity: currentQty < 1 ? 1: currentQty,
                                }

                                this.setState({orders: tempOrders})

                              }} aria-label="Text input with dropdown button" />
                            </InputGroup>
                          ))
                  }
                
                </ListGroup>
                
                {this.state.orders.length > 0 ? <InputGroup style={{marginTop: 10, width: '100%'}}>
                  <InputGroup.Text style={{width: "15%"}}>DP Amount</InputGroup.Text>
                  <Form.Control  type="number" value={this.state.newresdp} onChange={(text) => {this.setReservationDPAmount(text.target.value)}} />
                </InputGroup>: null}
                <InputGroup style={{marginTop: 10, width: '100%'}}>
                  <InputGroup.Text style={{width: "15%"}}>Note</InputGroup.Text>
                  <Form.Control style={{width: "85%"}} size='lg' as="textarea" aria-label="With textarea" value={this.state.newresnote} onChange={(data) => {this.setState({newresnote: data.target.value})}}/>
                </InputGroup>
              </Col>
              <Col xs={6} md={9}>
                  <Row>
                  {
                        Array.from(this.state.food).map((_,key) => (
                          
                            <Card onClick={() => {this.saveOrder(key)}} style={{color: "white", height: 70, width: 140, margin: 1, backgroundColor: this.state.food[key].cat == 1 ? "#033500": "#231709"}}>
                              <Card.Body>
                                  <Card.Title style={{fontSize:15}}>{this.state.food[key] !== undefined ? this.state.food[key].name: ""} </Card.Title>
                              </Card.Body>
                            </Card> 
                          
                                      
                        ))
                  }
                  </Row>
                  
              </Col>
            </Row>
            
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.modalNewOSToggle()}>Close</Button>
            <Button disabled={!this.checkResFields() && (this.state.orders.length === 0 || (this.state.orders.length > 0 && this.state.newresdp > 0)) ? false: true} variant="success" onClick={() => {this.saveNewRes()}}>Save changes</Button>
          </Modal.Footer>
      </Modal>

        {/*SHOW BILLED MODAL*/}
        <Modal size='lg' show={this.state.modalConfirmation}>
          <Modal.Header>
            <Modal.Title style={{justifyContent: "center"}}>
              Already Billed?
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button style={{width: "100%"}} variant="secondary" onClick={() => this.modalDoneConfirmationToggle()}>No</Button>
            <Button style={{width: "100%"}} variant="success" onClick={() => { 
              this.doneOrder()
              }}>Yes</Button>
          </Modal.Footer>
        </Modal>
    </div>
    )
    
  }
    
}
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.event.title}</b>
    </>
  )
}

function ReservationsSummary(props) {
    let navigate = useNavigate();

    return (
            <ReservationsSummaryN {...props} navigate={navigate}/>
      
    )
}

export default ReservationsSummary