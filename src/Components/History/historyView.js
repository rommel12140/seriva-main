import React from 'react';
import '../../App.css';
import { Card, Button, Col, Row, Modal, Alert, Badge, ListGroup, Container, Form, Dropdown, InputGroup, DropdownButton, ButtonGroup, Accordion, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { arrayToObject, dateConvert, getStringDate, tConvert, tConvertHM, tSQLConvert } from '../Utilities/timeconvert';
import { getNowDate, menu, tables, taker } from '../Utilities/data';
import { addOrderSlip, billedAllOrders, cancelOrderFromOS, cancelOrderSlip, cancelReservation, getAvailableMenu, getemployees, getEmployees, getLastOS, getMenu, getOpenOrderSlips, getOrderSlips, getReservations, getReservationsIncoming, getServers, getTables, updateOSReservation } from '../Utilities/requests';
import { toWords } from 'number-to-words';
import { format, isDate } from 'date-fns';

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

const ORDERSLIPDEFAULT = []


class HistoryViewSummaryN extends React.Component  {

  state = {
    currenttime12H: 0,
    currenttime: 0,
    modalOSShow: false,
    modalStatShow: false,
    modalSales: false,
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
    employees: [],
    adminpass: false,
    sales: {},
    dateselect: format(new Date(), 'yyyy-MM-dd')
  }
  
  componentDidMount() {
    

    this.getCurrentTime()
    getEmployees((responseEmps) => {
      getServers((responseEmployees) => {
        getTables((responseTables) => {
          getAvailableMenu((responseFood) => {
  
            this.setState({
              food: responseFood.response,
              tables: responseTables.response,
              takers: arrayToObject(responseEmployees.response),
              employees: arrayToObject(responseEmps.response),
            },() => {
              this.loadOrderSlips()
            })
          })
        })
      })
    })
    
  }

  computeAvgDiningTime(array) {
    var sum = 0
    const avg = 0
    var length = 0

    Array.from(array).map((_,index) => {
      if(array[index].billed !== "0000-00-00 00:00:00") {
        sum = sum + this.timeComputationRaw(array[index].dtime,array[index].billed)
        length = length + 1
      }
    })

    

    return sum/length
  }

  computeAvgServingFinish(array) {
    var sum = 0
    const avg = 0
    var length = 0

    Array.from(array).map((_,index) => {
      if(array[index].donetime !== "0000-00-00 00:00:00") {
        sum = sum + this.timeComputationRaw(array[index].dtime,array[index].donetime)
        length = length + 1
      }
    })

    

    return sum/length
  }

  computeTotalTables(array, table_no) {
    var sum = 0
    const avg = 0
    var length = 0

    Array.from(array).map((_,index) => {
      if(array[index].table_no === table_no) {
        sum = sum + 1
      }
    })

    

    return sum
  }

  computeAVGMake(array, id) {
    var sum = 0
    const avg = 0
    var length = 0
    
    Array.from(array).map((_,index) => {
        const arrayItems = JSON.parse(array[index].orders)
        Array.from(arrayItems).map((_,indexItem) => {
          if(arrayItems[indexItem].chef_id == id) {
            sum = sum + this.timeComputation(array[index].dtime,arrayItems[indexItem].donetime)
            length = length + 1
          }
        })
    })

    return sum/length
  }

  computeTotalMake(array, id) {
    var sum = 0
    const avg = 0
    var length = 0
    
    Array.from(array).map((_,index) => {
        const arrayItems = JSON.parse(array[index].orders)
        Array.from(arrayItems).map((_,indexItem) => {
          if(arrayItems[indexItem].chef_id == id) {
            sum = sum + 1
          }
        })
    })

    return sum
  }

  computeTotalTakes(array, id) {
    var sum = 0
    const avg = 0
    var length = 0
    
    Array.from(array).map((_,index) => {
      if(array[index].taker == id) {
        sum = sum + 1
      } 
    })

    return sum
  }

  loadOrderSlips() {
    getOrderSlips((responseOS) => {
      const resp = (responseOS.response.length !== 0 ? responseOS.response: [PLACEHOLDER_OS])
      this.setState({
        orderslips: resp,
      }, () => {
        setTimeout(() => this.loadOrderSlips(), 10000)
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

  changeServer = () => {
    if (localStorage.getItem("api") == "true"){
      localStorage.setItem("api", "false")
    } else {
      localStorage.setItem("api", "true")
    }
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

  timeComputation = (timeIn, timeOut) => {
    const nTimeIn = new Date(timeIn)
    const ntTimeOut = new Date(timeOut)
    const result = (ntTimeOut.getTime() - nTimeIn.getTime())/60000
    return result <= 0 || isNaN(result) ? "--": Math.round(Number(result).toFixed(2));
  }

  timeComputationRaw = (timeIn, timeOut) => {
    const nTimeIn = new Date(timeIn)
    const ntTimeOut = new Date(timeOut)
    const result = (ntTimeOut.getTime() - nTimeIn.getTime())/60000
    return result <= 0 || isNaN(result) ? 0: Number(result);
  }

  toggleModalStat() {
    

    if(this.state.adminpass) {
        this.setState({
          modalStatShow: this.state.modalStatShow ? false: true
        })
    } else {
      const selection = prompt("Password")

      if(selection === "123admin") {
        
        this.setState({
          adminpass: true,
        })
        
        this.setState({
          modalStatShow: this.state.modalStatShow ? false: true
        })
      } else {
        this.setState({
          adminpass: false,
        })
      }
    }
  }

  getMenuName(id){
    const index = this.state.food.findIndex(obj => {
      return obj.menu_id == id;
    });
    return index !== -1 ? this.state.food[index].name: id
  }

  toggleModalSales() {
    this.computeSales()
    this.setState({
      modalSales: this.state.modalSales ? false: true,
    })
  }

  computeSales() {
    this.setState({sales: {}}, () => {
      var sales = {}
      var dtime = this.state.dateselect
  
      var orderslips = this.state.orderslips.filter(item => { 
        return format(new Date(item.dtime), 'yyyy-MM-dd') == dtime
      });
  
      Array.from(orderslips).map((_,index) => {
        if (orderslips[index].cancelled != 1){
          const orders = JSON.parse(orderslips[index].orders)
          Array.from(orders).map((_, j) => {
            var order = orders[j]
            var menuid = order.item.menu_id
            if(order.cancelled != 1) {
              sales[menuid] = sales[menuid] !== undefined ? Number(sales[menuid])+Number(order.quantity): Number(order.quantity)
            }
            
          })
        }
        
      })
      this.setState({
        sales: sales,
      })
    })
  }

  render() {

    return (
      <div className="App">
        <div className="top-nav">
          <Row>
            <Col sm>
            <Button style={{margin: 10, width:'90%', color: 'white'}} variant="secondary" onClick={() => this.props.navigate(-1)}>Back</Button>
            </Col>
            <Col sm>
            <Button style={{margin: 10, width:'90%', color: 'white'}} variant="primary" onClick={() => this.toggleModalStat()}>Statistics</Button>
            </Col>
            <Col sm>
              <Button style={{margin: 10, width:'90%', color: 'white'}} variant="dark" onClick={() => this.toggleModalSales()}>Day Sales</Button>
            </Col>
          </Row>
        <div>
        <Table responsive="sm" striped='columns' style={{margin: 10, width: '90%'}}>
          <thead>
            <tr>
              <th>OS Number</th>
              <th>Date Time</th>
              <th>Taker</th>
              <th>Table</th>
              <th>Done Time</th>
              <th>Cancelled</th>
              <th>Billed</th>
              <th>Serving Finish</th>
              <th>Dining Time</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(this.state.orderslips.reverse()).map((_, index) => {
                const os = this.state.orderslips[index]
                return (
                    <tr 
                      onClick={() => {
                        this.setState({
                          selectedorderslip: index
                        }, () => {
                          this.modalOSToggle()
                        })
                      }}
                      
                    >
                      <td>{os.os_no}</td>
                      <td>{getStringDate(new Date(os.dtime), "-")} {tConvertHM(dateConvert(new Date(os.dtime)))}</td>
                      <td>{this.state.employees !== null && this.state.employees[os.taker] !== undefined ? this.state.employees[os.taker].nickname: ""}</td>
                      <td>{this.state.tables !== null && this.state.tables[os.table_no-1] !== undefined ? this.state.tables[os.table_no-1].table_name: " "}</td>
                      <td>{os.donetime !== '0000-00-00 00:00:00' ? getStringDate(new Date(os.donetime), "-"): ""} {os.donetime !== '0000-00-00 00:00:00' ? tConvertHM(dateConvert(new Date(os.donetime))): ""}</td>
                      <td>{os.cancelled == 1 ? "True": " "}</td>
                      <td>{os.billed !== '0000-00-00 00:00:00' ? getStringDate(new Date(os.billed), "-"): ""} {os.billed !== '0000-00-00 00:00:00' ? tConvertHM(dateConvert(new Date(os.billed))): ""}</td>
                      <td>{this.timeComputation(os.dtime,os.donetime)} mins</td>
                      <td>{this.timeComputation(os.dtime,os.billed)} mins</td>
                    </tr>
                )
              })}
          </tbody>
        </Table>
    </div>
        </div>
      

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
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      disabled
                      value={this.state.orderslips[this.state.selectedorderslip] !== undefined ? (this.state.tables[this.state.orderslips[this.state.selectedorderslip].table_no-1] !== undefined ? this.state.tables[this.state.orderslips[this.state.selectedorderslip].table_no-1].table_name: ""): ""}
                    />
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
                    

                    return (orders !== undefined && orders[index] !== undefined && orders.length !== 0 && this.state.orderslips[this.state.selectedorderslip] !== undefined) ? (<ListGroup.Item as="li">
                      
                        <Row>
                          <Col xs={6} md={4} style={{width: '40%'}}>{orders[index].item.name} * {orders[index].quantity} {'('}{toWords(orders[index].quantity)}{')'} <Badge pill bg={orders[index].donetime !== "0000-00-00 00:00:00" ? "success": "warning"}>{orders[index].donetime !== "0000-00-00 00:00:00" ? "Done": "In Progress"}</Badge></Col>
                          <Col xs={6} md={2} style={{width: '30%'}}>{orders[index].donetime === '0000-00-00 00:00:00' ? <Badge style={{width: '100%'}} bg={this.remainingTime(this.state.orderslips[this.state.selectedorderslip].dtime,orders[index].item.est_time) ? 'primary': 'danger'}>{parseInt(this.remainingTime(this.state.orderslips[this.state.selectedorderslip].dtime,orders[index].item.est_time))} mins left</Badge>: this.state.employees !== null && this.state.employees[orders[index].chef_id] !== undefined ? this.state.employees[orders[index].chef_id].nickname: null}</Col>
                          <Col xs={6} md={4} style={{width: '30%'}}>
                            Done Time: {this.state.orderslips[this.state.selectedorderslip].donetime !== '0000-00-00 00:00:00' ? getStringDate(new Date(this.state.orderslips[this.state.selectedorderslip].donetime), "-"): ""} {this.state.orderslips[this.state.selectedorderslip].donetime !== '0000-00-00 00:00:00' ? tConvertHM(dateConvert(new Date(this.state.orderslips[this.state.selectedorderslip].donetime))): ""} {String("("+ this.timeComputation(this.state.orderslips[this.state.selectedorderslip].dtime,orders[index].donetime) +" mins)")}
                          </Col>
                        </Row>
                    
                    </ListGroup.Item>): null
              })
                }
                </Container>
              </ListGroup>
            
            <InputGroup style={{marginTop: 10}}>
              <InputGroup.Text>Note</InputGroup.Text>
              <Form.Control size='lg' as="textarea" aria-label="With textarea" disabled value={this.state.orderslips[this.state.selectedorderslip] != undefined ? this.state.orderslips[this.state.selectedorderslip].requests: ""}/>
            </InputGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button style={{width: "100%"}} variant="secondary" onClick={() => this.modalOSToggle()}>Close</Button>
          </Modal.Footer>
      </Modal>
      {/* MODAL STATISTICS */}
      <Modal size='lg' show={this.state.modalStatShow}>
        <Modal.Header>
            <Modal.Title style={{width: '100%'}}>
              Statistics
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Col>
              <Row sm>
                Average Dining Time: {Number(this.computeAvgDiningTime(this.state.orderslips)).toFixed(1)} minutes
              </Row>
              <Row sm>
                Average Serving Finish: {Number(this.computeAvgServingFinish(this.state.orderslips)).toFixed(1)} minutes
              </Row>
                <Card>
                  <Card.Title>
                    Tables Used Overtime
                  </Card.Title>
                  <Card.Body>
                  {Array.from(this.state.tables).map((iteration) => {
                    const table_sum = this.computeTotalTables(this.state.orderslips,iteration.table_no)
                    
                    return table_sum != 0 ? (
                      <Row sm>
                        {iteration.table_name} - {table_sum}
                      </Row>
                    ): null
                  })}
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Title>
                    Chefs
                  </Card.Title>
                  <Card.Body>
                  {Object.keys(this.state.employees).map((key,index) => {
                    const table_sum =this.computeTotalMake(this.state.orderslips,this.state.employees[key].id)
                    const table_avg =this.computeAVGMake(this.state.orderslips,this.state.employees[key].id)
                    return this.state.employees[key].area == 3 ? (
                      <Row sm>
                        {this.state.employees[key].nickname} - TOTAL MADE: {table_sum} @ {Math.round(table_avg).toFixed(0)} mins AVG Serving Time
                      </Row>
                    ): null
                    
                  })}
                  </Card.Body>
                </Card>
                <Card>
                  <Card.Title>
                    Cafe Barista
                  </Card.Title>
                  <Card.Body>
                  {Object.keys(this.state.employees).map((key,index) => {
                    const table_sum =this.computeTotalMake(this.state.orderslips,this.state.employees[key].id)
                    const table_avg =this.computeAVGMake(this.state.orderslips,this.state.employees[key].id)
                    return this.state.employees[key].area == 4 ? (
                      <Row sm>
                        {this.state.employees[key].nickname} - TOTAL MADE: {table_sum} @ {Math.round(table_avg).toFixed(0)} mins AVG Serving Time
                      </Row>
                    ): null
                    
                  })}
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Title>
                    Takers
                  </Card.Title>
                  <Card.Body>
                  {Object.keys(this.state.employees).map((key,index) => {
                    const table_sum =this.computeTotalTakes(this.state.orderslips,this.state.employees[key].id)
                    return this.state.employees[key].area == 2 ? (
                      <Row sm>
                        {this.state.employees[key].nickname} - TOTAL TAKES: {table_sum}
                      </Row>
                    ): null
                    
                  })}
                  </Card.Body>
                </Card>
                
              <Row sm>
                
              </Row>
            </Col>
          </Modal.Body>

          <Modal.Footer>
            <Button style={{width: "100%"}} variant="secondary" onClick={() => this.toggleModalStat()}>Close</Button>
          </Modal.Footer>
      </Modal>
      <Modal size='lg' show={this.state.modalSales}>
        <Modal.Title>
                  Daily Sales
                  <InputGroup>
                  <InputGroup.Text id="inputGroup-sizing-default">
                        Batch Date:
                  </InputGroup.Text>
                  <Form.Control  type="date" value={this.state.dateselect} onChange={(text) => {
                    this.setState({ dateselect: format(new Date(text.target.value), 'yyyy-MM-dd')}, () => {this.computeSales()})
                  }} />
                  </InputGroup>
        </Modal.Title>
        <Modal.Body>
              {Object.keys(this.state.sales).map((key,index) => {
                  return ((<p>{this.getMenuName(key)}: {this.state.sales[key]}</p>))
              })}
        </Modal.Body>
        <Modal.Footer>
              <Button variant='danger' onClick={() => {this.toggleModalSales()}}> CLOSE </Button>
        </Modal.Footer>
      </Modal>
    </div>
    )
    
  }
    
}

function HistoryViewSummary(props) {
    let navigate = useNavigate();
    

    return (
        
            <HistoryViewSummaryN {...props} navigate={navigate}/>
      
    )
}

export default HistoryViewSummary