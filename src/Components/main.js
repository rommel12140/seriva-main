import '../App.css';
import { Card, Button, Col, Row } from 'react-bootstrap';
import React from 'react';

export default class Main extends React.Component {
  
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
              <Card className='card-dimensions'>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Order Slips</Card.Title>
                      <Card.Text>
                        Our order slip system is designed to relay customer orders to the kitchen.
                      </Card.Text>
                      <Button className='card-button-dimensions' href="/orderslipssummary" variant="primary">Order Slips</Button>
                  </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className='card-dimensions'>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Kitchen View</Card.Title>
                      <Card.Text>
                        Our state-of-the-art kitchen display system is the heartbeat of our culinary operations.
                      </Card.Text>
                      <Button className='card-button-dimensions' variant="primary">Kitchen System</Button>
                  </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className='card-dimensions'>
                  <Card.Body>
                      <Card.Title style={{fontWeight:'bold'}}>Reservations</Card.Title>
                      <Card.Text>
                        Our state-of-the-art kitchen display system is the heartbeat of our culinary operations.
                      </Card.Text>
                      <Button className='card-button-dimensions' variant="primary">Reservation System</Button>
                  </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </header>
    </div>
    )
  }
}