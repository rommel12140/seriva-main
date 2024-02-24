import React from 'react';
import '../../App.css';
import { Card, Button, Col, Row, Modal, Alert, Badge, ListGroup, Container, Form, Dropdown, InputGroup, DropdownButton, ButtonGroup, Accordion, ModalFooter, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { arrayToObject, dateConvert, getStringDate, tConvert, tConvertHM, tSQLConvert } from '../Utilities/timeconvert';
import { CAT_ARR, CAT_CAFE, CAT_RESTAURANT, CAT_STRING, TYPE_ARR, TYPE_STRING, getNowDate, menu, tables, taker } from '../Utilities/data';
import { addMenu, addOrderSlip, billedAllOrders, cancelOrderFromOS, cancelOrderSlip, cancelReservation, getAvailableMenu, getEmployees, getLastOS, getMenu, getOpenOrderSlips, getOrderSlips, getReservations, getReservationsIncoming, getServers, getTables, updateOSReservation, updateOSTable, updateOrderStatusDone } from '../Utilities/requests';
import { toWords } from 'number-to-words';
import { format } from 'date-fns';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import { getLoyverseItems, getLoyverseoauth } from '../Utilities/loyverseRequest';

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

const SAMPLE_ORDER = JSON.stringify([{item: SAMPLE_FOOD[0],cancelled: false,returned: false,donetime: "0000-00-00 00:00:00",chef_id: 0,quantity: 1,},{item: SAMPLE_FOOD[1],cancelled: false,returned: false,donetime: "0000-00-00 00:00:00",chef_id: 0,quantity: 1,},])

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

const ITEM_DEFAULT = {
  name: "",
  cat: -1,
  type: -1,
  est_time: 0,
  cogs: 0,
  available: 1,
  removed: 0,
  qty: 0,
}

class OrderSlipsSummaryN extends React.Component  {

  state = {
    currenttime12H: 0,
    currenttime: 0,
    modalOSShow: false,
    modalNewOSShow: false,
    modalNewMenuShow: false,
    modalNewOSQty: false,
    modalConfirmation: false,
    selectedorderslip: 0,
    newOSTable: 0,
    newOSTaker: 0,
    orderslips: ORDERSLIPDEFAULT,
    food: menu,
    numberOfRows: 3,
    neworderslipnote: "",
    newOrderSlip: {},
    orders: [],
    currentorder: {},
    tables:tables,
    takers: taker,
    reservations: [],
    selectedIndex: -1,
    modalResShow: false,
    modalOrderConfirmation: false,
    selectedorder: {},
    newItem: ITEM_DEFAULT,
    modalAddMenu: false,
    modalRepeatOrders: false,
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
            this.loadOrderSlips()
            this.loadReservations()
          })
        })
      })
    })
  }

  loadAll() {
    getServers((responseEmployees) => {
      getTables((responseTables) => {
        getAvailableMenu((responseFood) => {
          this.setState({
            food: responseFood.response,
            tables: responseTables.response,
            takers: arrayToObject(responseEmployees.response)
          },() => {
            
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
      this.setState({
        orderslips: resp,
        modalOSShow: (this.state.orderslips[this.state.selectedorderslip].cancelled === 1 || this.state.orderslips[this.state.selectedorderslip].cancelled === "1") ? false: this.state.modalOSShow,
      }, () => {
        setTimeout(() => this.loadOrderSlips(), 1000)
        
      })
    })
  }

  toggleModalAddMenu() {
    this.setState({
      modalAddMenu: this.state.modalAddMenu ? false: true,
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

  modalNewOSToggle = () => {
    this.setState({
      modalNewOSShow: this.state.modalNewOSShow ? false: true,
      newOSTaker: "",
      neworderslipnote: "",
      newOSTable: {},
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
      modalOSShow: false,
    })
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

  saveMenu(){
    this.toggleModalAddMenu()
    addMenu(this.state.newItem, () => {
      this.setState({
        newItem: ITEM_DEFAULT
      }, () => {
        this.loadAll()
      })
    })
    
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
          billed: "0000-00-00 00:00:00",
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
            getReservationsIncoming((responseRes) => {
              const resp = (responseRes.response.length !== 0 ? responseRes.response: [])
              this.setState({
                reservations: resp,
              })
            })
          })
        })
      }
    }
  }

  doneOrder() {
    billedAllOrders(this.state.orderslips[this.state.selectedorderslip], () => {
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

  doneKitchenOrder(os,index) {
      updateOrderStatusDone(os,index, () => {
        getOrderSlips((responseOS) => {
          this.setState({
            orderslips: responseOS.response,
          }, () => {
            
          })
        })
      })
      this.modalOrderConfirmationToggle()
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

  saveNewOS() {
    if (this.checkInvalid(this.state.newOSTable) ||
      this.checkInvalid(this.state.newOSTaker) ||
      this.checkInvalid(this.state.orders)
      ) {
        alert("Please input all fields")
    } else {
      const newOS = {
        os_no: null,
        dtime: new Date(),
        taker: this.state.newOSTaker.id,
        orders: this.state.orders,
        table: this.state.newOSTable.table_no,
        requests: this.state.neworderslipnote,
        donetime: "0000-00-00 00:00:00",
        cancelled: false,
        billed: "0000-00-00 00:00:00",
        numberOfRows: 3,
      }

      addOrderSlip(newOS,(response) => {
        this.modalNewOSToggle()
        getOrderSlips((responseOS) => {
          this.setState({
            orderslips: responseOS.response,
            modalRepeatOrders: false,
          })
        })
      })
    }
    
  }

  modalOrderConfirmationToggle = () => {
    this.setState({
      modalOrderConfirmation: this.state.modalOrderConfirmation ? false: true,
    })
  }

  checkInvalidNewItem() {
    return (
      this.state.newItem.name === ITEM_DEFAULT.name || this.state.newItem.cat === ITEM_DEFAULT.cat || this.state.newItem.type === ITEM_DEFAULT.type || this.state.newItem.est_time === ITEM_DEFAULT.est_time
    )
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
      numberOfRows: this.state.numberOfRows - 1
    })
  }
  
  render() {
    return (
      <div className="App">
        <div className="top-nav">
          <Row>
            <Col xs={2} md={1}>
              <Button style={{margin: 10, width:'100%', color: 'white'}} variant="secondary" href="/">Back</Button>
            </Col>
            <Col xs={2} md={2}>
              <Button style={{margin: 10, width:'100%', color: 'Green'}} variant="light" href='/historyviewsummary'>History</Button>
            </Col>
            <Col xs={6} md={5}>
              <Container style={{color:"white", width: "100%", margin: 10}}>
                <Accordion defaultActiveKey="0">
                  <Accordion.Item>
                  <Accordion.Header>
                    Reservations
                    {this.state.reservations.length !== 0 ? <Badge pill bg="warning">{this.state.reservations.length} </Badge>: null}
                  </Accordion.Header>
                  <Accordion.Body>
                    <ListGroup style={{marginBottom: 10}}>
                      {
                        
                        Array.from(this.state.reservations).map((_, index) => (
                          <ListGroup.Item onClick={() => { this.setState({selectedIndex: index}, () => { this.modalResToggle() })}}>
                            {getStringDate(new Date(this.state.reservations[index].service_time),"/") + " - " + tConvertHM(dateConvert(new Date(this.state.reservations[index].service_time))) + " - " + this.state.reservations[index].res_name + " - " + (this.state.tables[this.state.reservations[index].table_no-1].table_name) + " - " + this.state.reservations[index].pax + " PAX"}
                          </ListGroup.Item>
                        ))
                      }
                    </ListGroup>
                    
                    <Row>
                      <Button variant='success' href='/reservationssummary'>
                        Add Reservation
                      </Button>
                    </Row>
                  </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Container>
              
            </Col>
            <Col xs={2} md={2}>
              <Button style={{margin: 10, width:'90%', color: 'white'}} variant="success" onClick={() => this.toggleModalAddMenu()}>Add Menu Item</Button>
            </Col>
            <Col xs={2} md={2}>
              <Button style={{margin: 10, width:'90%', color: 'white'}} variant="success" onClick={() => this.modalNewOSToggle()}>New OS</Button>
            </Col>
          </Row>
          <Card>
            <Card.Title style={{fontWeight: 'bolder'}}>{this.state.currenttime12H}</Card.Title>
            <Card.Title style={{fontWeight: 'bolder'}}>{new Date().getMonth()+1}/{new Date().getDate()}/{new Date().getFullYear()}</Card.Title>
          </Card>
          <p style={{color: 'white', fontSize:50}}>
            Order Slips
          </p>
        </div>
      <header className="App-header">
          <Row>
            {
                Object.keys(this.state.orderslips).map((keyName, i) => {
                  const orders = this.state.orderslips[i].orders !== undefined ? JSON.parse(this.state.orderslips[i].orders): []

                  return (this.state.orderslips[i] && this.state.orderslips[i].cancelled !== "1" && this.state.orderslips[i].billed === "0000-00-00 00:00:00") ? (
                    <Col xs={6} md={3}>
                      <Card style={{ width: '18rem' }}>
                        <Card.Body>
                            <Card.Title style={{fontSize:35}}>{this.state.orderslips[i].table} <Badge bg='dark'>{tConvertHM(dateConvert(this.state.orderslips[i].dtime))} - {this.state.tables[this.state.orderslips[i].table_no-1].table_name !== undefined ? this.state.tables[this.state.orderslips[i].table_no-1].table_name: ""}</Badge></Card.Title>
                            <Card.Text style={{fontSize:15}}>
                              <ListGroup as="ul">
                                {
                                  Array.from(orders).map((_,index) => { 

                                    return (orders[index].cancelled !== "1" && orders[index].cancelled !== 1) ? (
                                      <ListGroup.Item as="li">
                                        {orders[index].quantity} * {orders[index].item.name} <Badge pill bg={orders[index].donetime !== "0000-00-00 00:00:00" ? "success": orders[index].chef_id === null ? "warning": "primary"}>{orders[index].donetime !== "0000-00-00 00:00:00" ? "Done": orders[index].chef_id === null ? "Waiting": "Making..."}</Badge> - {parseInt(this.remainingTime(this.state.orderslips[i].dtime,orders[index].item.est_time))} mins left
                                      </ListGroup.Item>
                                  ): null
                                })
                                }
                                </ListGroup>
                            </Card.Text>
                            <Button onClick={() => {
                                this.setState({
                                  selectedorderslip: i
                                }, () => {
                                  this.modalOSToggle()
                                })
                              }} 
                              variant="success" >View Order Slip</Button>
                        </Card.Body>
                        </Card> 
                      </Col>
                  ): null
                })
              }
          </Row>
            
      </header>

      {/* NEW MENU ITEM */}
      <Modal size='lg' show={this.state.modalAddMenu}>
          <Modal.Header>
              ADD NEW MENU ITEM
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col xs={6} md={2}> Menu Name: </Col>
              <Col xs={6} md={4}>
                  <Form.Control value={this.state.newItem.name} type="text" onChange={(text) => {this.setState({ newItem: {...this.state.newItem, name: text.target.value}})}}/>
              </Col>
              <Col xs={6} md={2}> Category: </Col>
              <Col xs={6} md={4}>
                  <Dropdown>
                      <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                      {(this.state.newItem.cat == -1) ? "Select Unit": CAT_STRING(this.state.newItem.cat)} 
                      
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                      {
                          Array.from(CAT_ARR).map((_, index) => (<Dropdown.Item onClick={() => {
                              
                              this.setState({ newItem: {...this.state.newItem, cat: CAT_ARR[index]} }, () => {})}}>{CAT_STRING(CAT_ARR[index])}</Dropdown.Item>
                          ))
                      }
                      </Dropdown.Menu>
                  </Dropdown>
              </Col>
            </Row>
            <Row style={{marginTop: 10}}>
              <Col xs={6} md={2}> Estimated Minutes: </Col>
              <Col xs={6} md={4}>
                  <Form.Control value={this.state.newItem.est_time} type="text" onChange={(text) => {this.setState({ newItem: {...this.state.newItem, est_time: text.target.value}})}}/>
              </Col>
              <Col xs={6} md={2}> Type: </Col>
              <Col xs={6} md={4}>
                  <Dropdown>
                      <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                      {(this.state.newItem.type == -1) ? "Select Type": TYPE_STRING(this.state.newItem.type)} 
                      
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                      {
                          Array.from(TYPE_ARR).map((_, index) => (<Dropdown.Item onClick={() => {
                              
                              this.setState({ newItem: {...this.state.newItem, type: TYPE_ARR[index]} }, () => {})}}>{TYPE_STRING(TYPE_ARR[index])}</Dropdown.Item>
                          ))
                      }
                      </Dropdown.Menu>
                  </Dropdown>
              </Col>
            </Row>
            <Row style={{marginTop: 10}}>
              <Col xs={6} md={2}> Price: </Col>
              <Col xs={6} md={4}>
                  <Form.Control value={this.state.newItem.cogs} type="text" onChange={(text) => {this.setState({ newItem: {...this.state.newItem, cogs: text.target.value}})}}/>
              </Col>
            </Row>

          </Modal.Body>
          <Modal.Footer>
            <Button variant='danger' onClick={() => this.toggleModalAddMenu()}> Close </Button>
            <Button variant='success' disabled={this.checkInvalidNewItem()} onClick={() => this.saveMenu()}> Save </Button>
          </Modal.Footer>

      </Modal>
      
      {/*EXISTING OS*/}
      <Modal size='lg' show={this.state.modalOSShow}>
        <Modal.Header>
            <Modal.Title style={{width: '100%'}}>
              <Row>
                <Col xs={6} md={4}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      OS No.:
                    </InputGroup.Text>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      disabled
                      value={this.state.orderslips[this.state.selectedorderslip] !== undefined ? this.state.orderslips[this.state.selectedorderslip].os_no:""}
                    />
                  </InputGroup>
                </Col>
                <Col xs={6} md={8}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      Table:
                    </InputGroup.Text>
                    <Dropdown >
                      <Dropdown.Toggle variant="secondary" id="dropdown-basic" style={{width: "87%"}}>
                      {this.state.selectedorderslip !== 0 && this.state.orderslips[this.state.selectedorderslip] !== undefined ? (this.state.tables[this.state.orderslips[this.state.selectedorderslip].table_no-1].table_name !== undefined ? this.state.tables[this.state.orderslips[this.state.selectedorderslip].table_no-1].table_name: ""): ""}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {
                          Array.from(this.state.tables).map((_, index) => (
                            <Dropdown.Item onClick={() => {updateOSTable(index+1,this.state.orderslips[this.state.selectedorderslip].os_no,() => {})}} href="#/action-1" key={this.state.tables[index]}>{this.state.tables[index].table_name !== undefined ? this.state.tables[index].table_name: ""}</Dropdown.Item>
                          ))
                        }
                      </Dropdown.Menu>
                    </Dropdown>
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={6} md={4}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      Time:
                    </InputGroup.Text>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      disabled
                      value={this.state.orderslips[this.state.selectedorderslip] != null ? (tConvertHM(dateConvert(this.state.orderslips[this.state.selectedorderslip].dtime))): ""}
                    />
                  </InputGroup>
                </Col>
                <Col xs={6} md={8}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      Taker:
                    </InputGroup.Text>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      disabled
                      value={(this.state.orderslips[this.state.selectedorderslip] !== undefined && this.state.takers[this.state.orderslips[this.state.selectedorderslip].taker] !== undefined) ? this.state.takers[this.state.orderslips[this.state.selectedorderslip].taker].nickname: ""}
                    />
                  </InputGroup>
                </Col>
              </Row>
              
              <Badge bg="dark">{}</Badge>
              
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ListGroup as="ul">
                <Container>
                {
                  Array.from(this.state.orderslips[this.state.selectedorderslip] !== undefined ? this.state.orderslips[this.state.selectedorderslip].orders: 0).map((_,index) => {
                    const orders = JSON.parse(this.state.orderslips[this.state.selectedorderslip].orders)
                    
                    return (orders !== undefined && orders[index] !== undefined && orders.length !== 0 && this.state.orderslips[this.state.selectedorderslip] !== undefined && orders[index].cancelled !== "1" && orders[index].cancelled !== 1) ? (<ListGroup.Item as="li">
                      
                        <Row>
                          <Col xs={6} md={4} style={{width: '40%'}}>{orders[index].item.name} * {orders[index].quantity} {'('}{toWords(orders[index].quantity)}{')'} <Badge pill bg={orders[index].donetime !== "0000-00-00 00:00:00" ? "success": "warning"}>{orders[index].donetime !== "0000-00-00 00:00:00" ? "Done": "In Progress"}</Badge></Col>
                          <Col xs={6} md={2} style={{width: '30%'}}><Badge style={{width: '100%'}} bg={this.remainingTime(this.state.orderslips[this.state.selectedorderslip].dtime,orders[index].item.est_time) ? 'primary': 'danger'}>{parseInt(this.remainingTime(this.state.orderslips[this.state.selectedorderslip].dtime,orders[index].item.est_time))} mins left</Badge></Col>
                          <Col xs={6} md={4} style={{width: '30%'}}>
                              <Button on onClick={() => {this.cancelOrder(this.state.orderslips[this.state.selectedorderslip],index)}} 
                                style={{width: '100%', margin: 5}} 
                                variant="secondary">
                                  Cancel
                              </Button>
                              {orders[index].item.cat != CAT_CAFE && orders[index].donetime === "0000-00-00 00:00:00" ? <Button onClick={() => {
                                this.setState({
                                  selectedorder: {
                                    os: this.state.orderslips[this.state.selectedorderslip],
                                    index: index,
                                  }
                                })
                                this.modalOrderConfirmationToggle()
                              }} 
                                style={{width: '100%', margin: 5}} 
                                variant="success">
                                  Done
                              </Button>: null}
                              {/* {orders[index].donetime !== "" ? <Button onClick={() => {alert("Cancel?")}} 
                                style={{width: '100%', margin: 5}} 
                                variant="dark">
                                  Return
                              </Button>: null} */}
                          </Col>
                        </Row>
                    
                    </ListGroup.Item>): null
              })
                }
                <div className="d-none d-print-block" style={{ margin: "0", padding: "0", fontFamily: "Arial", fontSize: 6}} ref={el => (this.componentRef = el)}> {/*d-none d-print-block*/}
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>***************************</p>
                        <p>TABLE: {this.state.selectedorderslip !== 0 && this.state.tables[this.state.orderslips[this.state.selectedorderslip].table_no-1] !== undefined ? this.state.tables[this.state.orderslips[this.state.selectedorderslip].table_no-1].table_name: null}</p>
                        <p>TAKER: {this.state.selectedorderslip !== 0 && this.state.takers[this.state.orderslips[this.state.selectedorderslip].taker] !== undefined ? this.state.takers[this.state.orderslips[this.state.selectedorderslip].taker].name: null}</p>
                        <p>**********ORDERS***********</p>

                  {
                  Array.from(this.state.orderslips[this.state.selectedorderslip] !== undefined ? this.state.orderslips[this.state.selectedorderslip].orders: 0).map((_,index) => {
                    const orders = JSON.parse(this.state.orderslips[this.state.selectedorderslip].orders)
                    
                    return (orders !== undefined && orders[index] !== undefined && orders.length !== 0 && this.state.orderslips[this.state.selectedorderslip] !== undefined && orders[index].cancelled !== "1" && orders[index].cancelled !== 1) ? (
                        <div>
                          <div className='' style={{textAlign: 'center'}}>
                          <p>{orders[index] != null ? orders[index].quantity: ""} pcs of -- **{orders[index] != null ? orders[index].item.name: "Select Item"}**</p> 
                          </div>
                        </div> 
                    ): null
                  })

                }
                <p>*************************</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                        <p>--</p>
                    </div>  
                </Container>
              </ListGroup>
            
            <InputGroup style={{marginTop: 10}}>
              <InputGroup.Text>Note</InputGroup.Text>
              <Form.Control size='lg' as="textarea" aria-label="With textarea" disabled value={this.state.orderslips[this.state.selectedorderslip] != undefined ? this.state.orderslips[this.state.selectedorderslip].requests: ""}/>
            </InputGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.modalOSToggle()}>Close</Button>
            <Button variant="outline-danger" onClick={() => {this.cancelAll(this.state.orderslips[this.state.selectedorderslip])}}>Cancel All</Button>
            <Button variant="success" onClick={() => {
              this.modalDoneConfirmationToggle()
            }}>Billed</Button>
            <ReactToPrint content={() => this.componentRef}>
              <PrintContextConsumer>
                {({ handlePrint }) => (
                  <Button variant='warning' onClick={handlePrint}>Print</Button>
                )}
              </PrintContextConsumer>
            </ReactToPrint>
          </Modal.Footer>
      </Modal>

      {/*DONE ORDER*/}
      <Modal size='lg' show={this.state.modalOrderConfirmation}>
        <Modal.Header>
          <Modal.Title style={{justifyContent: "center"}}>
            Done Order?
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button style={{width: "100%"}} variant="secondary" onClick={() => this.modalOrderConfirmationToggle()}>No</Button>
          <Button style={{width: "100%"}} variant="success" onClick={() => { 
            this.doneKitchenOrder(this.state.selectedorder.os,this.state.selectedorder.index)
            }}>Yes</Button>
        </Modal.Footer>
      </Modal>

      {/*NEW OS*/}
      <Modal 
        fullscreen={true}
        show={this.state.modalNewOSShow}
      >
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
                        {(this.state.newOSTable == {} || this.state.newOSTable.table_name === undefined || this.state.newOSTable.table_name == null) ? "Select Table": this.state.newOSTable.table_name} 
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {
                          Array.from(this.state.tables).map((_, index) => (
                            <Dropdown.Item onClick={() => {this.setState({newOSTable: this.state.tables[index]})}} href="#/action-1" key={this.state.tables[index]}>{this.state.tables[index].table_name !== undefined ? this.state.tables[index].table_name: ""}</Dropdown.Item>
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
                <Row>
                  <Col xs={6} md={2}> Time: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="text" disabled value={tConvertHM(dateConvert(new Date()))} />
                  </Col>
                  <Col xs={6} md={2}> Rows: </Col>
                  <Col xs={6} md={4}>
                    <Form.Control  type="number" value={this.state.numberOfRows} onChange={(text) => {this.numberOfRowsCalc(text.target.value)}} />
                  </Col>
                </Row>
                
              </Col>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{overflow:'hidden'}}>
            <Row>
            <Col xs={6} md={3}>
              <Container>
              <p style={{textAlign: 'center', fontWeight: "bold"}}>MENU</p>
                  <ListGroup as="ul">
                      {/* IF DROPDOWN IS CHANGED AND NOT NONE, QTY IS 1 */}
                    {
                            Array(this.state.numberOfRows).fill(1).map((_,index) => (
                              <InputGroup className="mb-3">
                                <ButtonGroup justified style={{width: "80%"}}>
                                {this.state.orders[index] != null ? <Button onClick={() => { this.deleteOrder(index)}} variant="dark"> X </Button>: null}
                                  <Button variant={this.state.orders[index] != null ? (this.state.orders[index].item.cat == CAT_RESTAURANT ? "success": "dark"): "secondary"} style={{width: "100%", color: 'white'}}> {this.state.orders[index] != null ? this.state.orders[index].item.name: "Select Item"} </Button>
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
                  
                  <InputGroup style={{marginTop: 10, width: '100%'}}>
                    <InputGroup.Text style={{width: "15%"}}>Note</InputGroup.Text>
                    <Form.Control style={{width: "85%"}} size='lg' as="textarea" aria-label="With textarea" value={this.state.neworderslipnote} onChange={(data) => {this.setState({neworderslipnote: data.target.value})}}/>
                  </InputGroup>
              </Container>
              </Col>
              <Col xs={6} md={9} >
                <Row style={{overflowY: 'scroll', height: '500px'}}>
                      <Tabs
                        defaultActiveKey="profile"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                      > 
                        {
                          Array.from(TYPE_ARR).map((_,index) => (
                            <Tab eventKey={TYPE_ARR[index]} title={TYPE_STRING(TYPE_ARR[index])}>
                              <Row>
                                {Array.from(this.state.food).map((_,key) => {
                                      const food = this.state.food
                                      return this.state.food[index] !== undefined && this.state.food[key].type == TYPE_ARR[index] ? (<Card onClick={() => {this.saveOrder(key)}} style={{color: "white", height: 70, width: 140, margin: 1, backgroundColor: food[key].cat == 1 ? "#033500": "#231709"}}>
                                        <Card.Body>
                                            <Card.Title style={{fontSize:15}}>{food[key] !== undefined ? food[key].name: ""} </Card.Title>
                                        </Card.Body>
                                      </Card> ): null
                                }            
                                )}
                              </Row>
                              
                            </Tab>
                          ))
                        }
                      </Tabs>
                  {/* {
                        Array.from(this.state.food).map((_,key) => (
                          
                            <Card onClick={() => {this.saveOrder(key)}} style={{color: "white", height: 70, width: 140, margin: 1, backgroundColor: this.state.food[key].cat == 1 ? "#033500": "#231709"}}>
                              <Card.Body>
                                  <Card.Title style={{fontSize:15}}>{this.state.food[key] !== undefined ? this.state.food[key].name: ""} </Card.Title>
                              </Card.Body>
                            </Card> 
                          
                                      
                        ))
                  } */}
                  </Row>
              </Col>
            </Row>
            
            
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.modalNewOSToggle()}>Close</Button>
            <Button variant="success" onClick={() => {this.setState({modalRepeatOrders: true})}}>Order</Button>
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

      {/*EXISTING RESERVATIONS*/}
      { this.state.selectedIndex !== -1 ? <Modal size='lg' show={this.state.modalResShow}>
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
                      value={this.state.selectedIndex != -1 && this.state.reservations[this.state.selectedIndex].res_no !== undefined ? this.state.reservations[this.state.selectedIndex].res_no: ""}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    Taker:
                  </Col>
                  <Col xs={6} md={4}>
                    <Form.Control disabled type="text" value={this.state.selectedIndex !== -1 && this.state.takers[this.state.reservations[this.state.selectedIndex].taker] !== undefined ? this.state.takers[this.state.reservations[this.state.selectedIndex].taker].name: ""} />
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
                    <Form.Control disabled type="text" value={this.state.selectedIndex != -1 ? this.state.tables[this.state.reservations[this.state.selectedIndex].table_no-1].table_name: 0} />
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
            <Button variant="success" onClick={() => this.saveNewOrderslip()}>{ JSON.parse(this.state.reservations[this.state.selectedIndex].orders).length !== 0 ? "Create New OS": "Arrived"}</Button>
          </Modal.Footer>
      </Modal>: null}
      <Modal size='lg' show={this.state.modalRepeatOrders}>
          <Modal.Title style={{textAlign: 'center'}}>
              Please Repeat Orders
          </Modal.Title>
          <Modal.Body>
                <div className="reset-style" style={{ margin: "0", padding: "0", fontFamily: "Arial"}}>
                    {/* IF DROPDOWN IS CHANGED AND NOT NONE, QTY IS 1 */}
                  {
                          Array(this.state.numberOfRows).fill(1).map((_,index) => this.state.orders[index] != null ? (
                            <div>
                              <div className='' style={{textAlign: 'center'}}>
                               <p>{this.state.orders[index] != null ? this.state.orders[index].quantity: ""} pcs of -- **{this.state.orders[index] != null ? this.state.orders[index].item.name: "Select Item"}**</p> 
                              </div>
                            </div>
                          ): null)
                  }
                
                </div>
                <div className="d-none d-print-block" style={{ margin: "0", padding: "0", fontFamily: "Arial", fontSize: 8}} ref={el => (this.componentRef = el)}>
                    {/* IF DROPDOWN IS CHANGED AND NOT NONE, QTY IS 1 */}
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>***************************</p>
                    <p>TABLE: {this.state.newOSTable.table_name !== undefined ? this.state.newOSTable.table_name: ""}</p>
                    <p>TAKER: {this.state.newOSTaker.name !== undefined ? this.state.newOSTaker.name: ""}</p>
                    <p>**********ORDERS***********</p>
                  {
                          Array(this.state.numberOfRows).fill(1).map((_,index) => this.state.orders[index] != null ? (
                            <div>
                              <div className='' style={{textAlign: 'center'}}>
                               <p>{this.state.orders[index] != null ? this.state.orders[index].quantity: ""} pcs of -- **{this.state.orders[index] != null ? this.state.orders[index].item.name: "Select Item"}**</p> 
                              </div>
                            </div>
                          ): null)
                  }
                      <p>*************************</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                    <p>--</p>
                </div>
          </Modal.Body>
          <Modal.Footer>
          <ReactToPrint content={() => this.componentRef}>
              <PrintContextConsumer>
                {({ handlePrint }) => (
                  <Button variant='warning' onClick={handlePrint}>Print</Button>
                )}
              </PrintContextConsumer>
            </ReactToPrint>
              <Button variant="danger" onClick={() => {this.setState({modalRepeatOrders: false}, () => {})}}>Cancel</Button>
              <Button variant="success" onClick={() => {this.saveNewOS()}}>Order</Button>
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