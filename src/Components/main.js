import '../App.css';
import { Card, Button, Col, Row } from 'react-bootstrap';
import React from 'react';
import { getLoyverseAuth, getLoyverseItems, getLoyverseoauth } from './Utilities/loyverseRequest';

export default class Main extends React.Component {

  state = {
    isLoggedIn: false
  }

  componentDidMount() {
    const authorizationCode = new URLSearchParams(window.location.search).get('code')
    if(authorizationCode !== null){
      getLoyverseAuth(authorizationCode,(response) => {
        console.log(response.response)
        getLoyverseItems(response.response,(respItm) => {
          console.log(respItm.response)
        })
      })
    }
  }

  logIn() {
    getLoyverseoauth(() => {
      
    })
  }

  render() {
    return (
    <div className="App">
      <header className="App-header-main">
        <p style={{fontSize:50}}>
          Welcome to SE·RI·VA
        </p>
        <div className="main-card">
          <Row>
            <Col xs={6} md={4}>
              <Card className='card-dimensions' style={{height: 250, margin: 10}}>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Order Slips</Card.Title>
                      <Card.Text>
                        Our order slip system is designed to relay customer orders to the kitchen.
                      </Card.Text>
                      
                  </Card.Body>
                  <Card.Footer>
                    <Button variant="success" className='card-button-dimensions' href="/orderslipssummary">Order Slips</Button>
                  </Card.Footer>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className='card-dimensions' style={{height: 250, margin: 10}}>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Kitchen View</Card.Title>
                      <Card.Text>
                        Our state-of-the-art kitchen display system is the heartbeat of our culinary operations.
                      </Card.Text>
                      
                  </Card.Body>
                  <Card.Footer>
                  <Button className='card-button-dimensions' variant="success" href="/kitchenviewsummary">Kitchen System</Button>
                  </Card.Footer>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className='card-dimensions' style={{height: 250, margin: 10}}>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Cafe View</Card.Title>
                      <Card.Text>
                        Our cafe display system is designed to help manage and control the operations of of our cafe operations.
                      </Card.Text>
                      
                  </Card.Body>
                  <Card.Footer>
                    <Button className='card-button-dimensions' variant="success" href="/cafeviewsummary">Cafe System</Button>
                  </Card.Footer>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={6} md={4}>
            <Card className='card-dimensions' style={{height: 250, margin: 10}}>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Reservations</Card.Title>
                      <Card.Text>
                        Our order slip system is designed to relay customer orders to the kitchen.
                      </Card.Text>
                      
                  </Card.Body>
                  <Card.Footer>
                    <Button variant="success" className='card-button-dimensions' href="/reservationssummary">Reservations</Button>
                  </Card.Footer>
              </Card>
            </Col>
            <Col xs={6} md={4}>
            <Card className='card-dimensions' style={{height: 250, margin: 10}}>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Inventory</Card.Title>
                      <Card.Text>
                        Inventory Management
                      </Card.Text>
                      
                  </Card.Body>
                  <Card.Footer>
                    <Button variant="success" className='card-button-dimensions' href="/inventory">Inventory</Button>
                  </Card.Footer>
              </Card>
              <Card hidden className='card-dimensions' style={{height: 250, margin: 10}}>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Synchronize Log-in</Card.Title>
                      <Card.Text>
                        Sync
                      </Card.Text>
                      
                  </Card.Body>
                  <Card.Footer>
                    <Button variant="success" className='card-button-dimensions' onClick={() => {this.logIn()}}>Synchronize</Button>
                  </Card.Footer>
              </Card>
            </Col>
          </Row>
        </div>
      </header>
    </div>
    )
  }
}