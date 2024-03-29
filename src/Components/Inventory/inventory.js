import React from 'react';
import '../../App.css';
import { Button, ButtonGroup, Col, Dropdown, Form, InputGroup, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { arrayToObject } from '../Utilities/timeconvert';
import { addInventoryBatch, addItem, addSupplier, getEmployees, getInvItems, getInventory, getLastBatch, getServers, getSupplier } from '../Utilities/requests';
import { AREA_ADMIN, AREA_ARR, AREA_COMMI, AREA_FOH_CAFE, AREA_FOH_RESTAURANT, AREA_KITCHEN_RESTAURANT, AREA_STRING, CAT_CAFE, CAT_RESTAURANT, ICAT_ARR, ICAT_CAFE, ICAT_KIT, ICAT_RES, ICAT_STRING, INV_ARR, INV_CM, INV_IN, INV_OUT, INV_PORTION, INV_STAT_ARR, INV_STAT_STRING, INV_WST, ST_ARR, ST_STRING, UNIT_ARR, UNIT_STRING } from '../Utilities/data';
import { format } from 'date-fns';

const ITEM_DEFAULT = {
    cat: -1,
    name: "",
    storage: -1,
    current_cost: 0,
    unit: -1,
    supplier: -1,
}

class InventoryN extends React.Component  {

  state = {
    modalAddInv: false,
    modalAddItem: false,
    modalInvSum: false,
    inventory: {},
    inventoryTotal: {},
    editor: -1,
    checker: -1,
    items: {},
    suppliers: {},
    staff: {},
    status: -1,
    newInventory: [],
    newItem: ITEM_DEFAULT,
    area: -1,
    filterArea: -1,
    filteredItems: {},
    rows: 3,
    loading: false,
    notes: "No Notes",
    areaitems: {},
    batchdate: null,
    currentdate: new Date(new Date().setDate(new Date().getDate()-1)),
  }
  
  componentDidMount() {
    this.reload()
  }

  reload() {
    getInventory((responseInv) => {
        getSupplier((responseSuppliers) => {
            getInvItems((responseItems) => {
                getEmployees((responseEmployees) => {
                    this.setState({
                        staff: arrayToObject(responseEmployees.response),
                        items: arrayToObject(responseItems.response),
                        suppliers: arrayToObject(responseSuppliers.response),
                        inventory: arrayToObject(responseInv.response),
                        filterArea: -1,
                    },() => {
                        this.calculateTotalInventoryItem()
                        this.changeAreaItems(-1)
                    })
                  })
            })
        }) 
    })
    
  }

  setCurrentDate(date){
    this.setState({
        currentdate: date,
    }, () => {
        this.calculateTotalInventoryItem()
    })
  }

  calculateTotalInventoryItem(){
    var tempInventory = {}
    if(this.state.filterArea !== -1) {
        const filteredInventory = arrayToObject(Object.values(this.state.inventory).filter((obj) => {
                                        return (Number(obj.area) === Number(this.state.filterArea));
                                    }));
        this.setState({inventoryTotal: {}}, () => {
            Object.keys(filteredInventory !== undefined ? filteredInventory: {}).map((key,index) => {
                const currentInventory = this.state.inventory[key]
                const existing = tempInventory[currentInventory.item]
                const batchD = format(new Date(currentInventory.batch_date), 'yyyy-MM-dd')
                const currentD = format(this.state.currentdate, 'yyyy-MM-dd')
                
                if(new Date(currentD).getTime() >= new Date(batchD).getTime()){
                    if(batchD !== currentD) {
                        
                        if(Number(currentInventory.stat) === INV_IN){
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) + Number(currentInventory.qty), 
                                beginning: Number(existing !== undefined ? existing.beginning !== undefined ? existing.beginning: 0: 0) + Number(currentInventory.qty)
                            }
                        } else {
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) - Number(this.state.inventory[key].qty), 
                                beginning: Number(existing !== undefined ? existing.beginning !== undefined ? existing.beginning: 0: 0) - Number(currentInventory.qty)
                            }
                            
                        }
                    } else {
                        if(Number(currentInventory.stat) === INV_IN){
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) + Number(currentInventory.qty), 
                                [currentInventory.stat]: Number(existing !== undefined ? existing[currentInventory.stat] !== undefined ? existing[currentInventory.stat]: 0: 0) + Number(currentInventory.qty)
                            }
                        } else {
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) - Number(this.state.inventory[key].qty), 
                                [currentInventory.stat]: Number(existing !== undefined ? existing[currentInventory.stat] !== undefined ? existing[currentInventory.stat]: 0: 0) + Number(currentInventory.qty)
                            }
                        }
                    }
                }
            })
            this.setState({inventoryTotal: tempInventory})
        })
    } else {
        this.setState({inventoryTotal: {}}, () => {
            Object.keys(this.state.inventory).map((key,index) => {
                const currentInventory = this.state.inventory[key]
                const existing = tempInventory[currentInventory.item]
                const batchD = format(new Date(currentInventory.batch_date), 'yyyy-MM-dd')
                const currentD = format(this.state.currentdate, 'yyyy-MM-dd')

                if(new Date(currentD).getTime() >= new Date(batchD).getTime()){
                    if(batchD !== currentD) {
                        
                        if(Number(currentInventory.stat) === INV_IN){
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) + Number(currentInventory.qty), 
                                beginning: Number(existing !== undefined ? existing.beginning !== undefined ? existing.beginning: 0: 0) + Number(currentInventory.qty)
                            }
                        } else {
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) - Number(this.state.inventory[key].qty), 
                                beginning: Number(existing !== undefined ? existing.beginning !== undefined ? existing.beginning: 0: 0) - Number(currentInventory.qty)
                            }
                            
                        }
                    } else {
                        if(Number(currentInventory.stat) === INV_IN){
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) + Number(currentInventory.qty), 
                                [currentInventory.stat]: Number(existing !== undefined ? existing[currentInventory.stat] !== undefined ? existing[currentInventory.stat]: 0: 0) + Number(currentInventory.qty)
                            }
                        } else {
                            tempInventory[this.state.inventory[key].item] = {
                                ...existing,
                                total: Number(existing !== undefined ? existing.total: 0) - Number(this.state.inventory[key].qty), 
                                [currentInventory.stat]: Number(existing !== undefined ? existing[currentInventory.stat] !== undefined ? existing[currentInventory.stat]: 0: 0) + Number(currentInventory.qty)
                            }
                        }
                    }
                }
                
            })
            this.setState({inventoryTotal: tempInventory})
        })
    }
  }

  changeAreaItems(area) {
    var currentCat = -1
    
    if(area == AREA_FOH_CAFE){
        currentCat = ICAT_CAFE
    } else if(area == AREA_COMMI || area == AREA_KITCHEN_RESTAURANT) {
        currentCat = ICAT_KIT
    }  else if(area == AREA_FOH_RESTAURANT) {
        currentCat = ICAT_RES
    }

    if(area !== -1){
        this.setState({area:area}, () => {
            const filteredItems = arrayToObject(Object.values(this.state.items).filter((obj) => {
                return (Number(obj.cat) === currentCat);
            }));
            this.setState({
                filteredItems: filteredItems
            })
        })
    } else {
        this.setState({
            filteredItems: this.state.items
        })
    }
    
  }

  toggleModalAddInv() {
    this.reload()
    this.setState({
        modalAddInv: this.state.modalAddInv ? false: true,
        checker: -1,
        editor: -1,
        newInventory: [],
        area: -1,
        status: -1,
    })
  }

  toggleModalInvSummary() {
    this.reload()
    this.setState({
        modalInvSum: this.state.modalInvSum ? false: true,
        batchdate: null,
    })
  }

  toggleModalAddItem() {
    this.reload()
    this.setState({
        modalAddItem: this.state.modalAddItem ? false: true,
        newItem: ITEM_DEFAULT,
    })
  }

  addSupplier() {
    const selection = prompt("Supplier Name:")
    if(selection !== undefined && selection !== null && selection !== "") {
        addSupplier(selection, () => {
            this.reload()
        })
    }
  }

  saveInventory(item) {
    this.setState({
        newInventory: [...this.state.newInventory, {...item, qty: 0}],
        rows: this.state.newInventory.length + 1 === this.state.rows ? this.state.rows + 1: this.state.rows,
    })
  }

  saveBatchInventory() {
    const filteredArray = this.state.newInventory.filter(element => element);
    this.setState({
        loading: true,
    }, () => {
        getLastBatch((responseBatch) => {
            const batch = responseBatch.response[0] !== undefined ? Number(responseBatch.response[0].batch) + 1: 1
            addInventoryBatch(batch, filteredArray.length,this.state.notes,filteredArray,this.state.checker,this.state.editor,this.state.area,this.state.status,this.state.batchdate, (resp) => {
                this.setState({
                    loading: false,
                })
                this.toggleModalAddInv()
                this.setState({
                    notes: "No Notes"
                })
            })
        })
    })
  }

  setBatchDate(date) {
    this.setState({
        batchdate: date,
    })
  }

  deleteItem(index) {
    var tempInventory = this.state.newInventory

    delete tempInventory[index]

    tempInventory = tempInventory.filter(function( element ) {
        return element !== undefined;
    });

    this.setState({
        newInventory: tempInventory,
        rows: this.state.rows - 1,
    })
  }

  saveItem() {
    addItem(this.state.newItem,() => {
        
    })
    this.toggleModalAddItem()
  }

  checkFields() {
    return this.state.newItem.cat === ITEM_DEFAULT.cat || this.state.newItem.current_cost === ITEM_DEFAULT.current_cost || this.state.newItem.name === ITEM_DEFAULT.name || this.state.newItem.storage === ITEM_DEFAULT.storage || this.state.newItem.supplier === ITEM_DEFAULT.supplier || this.state.newItem.unit === ITEM_DEFAULT.unit
  }

  checkInvFields() {
    return !(this.state.checker === -1 || this.state.editor === -1 || this.state.area === -1 || this.state.batchdate === null )
  }

  changeSummaryArea(data) {
    this.setState({filterArea: data}, () => {
        this.calculateTotalInventoryItem()
    })
  }

  render() {
    return (
        <div className="App">
            <div className="top-nav">
                <Row style={{width: '100%', paddingTop: 5}}>
                    <Col sm>
                        <Button style={{width:'90%', color: 'white'}} variant="secondary" href="/">Back</Button>
                    </Col>
                    <Col sm>
                        <Button style={{width: '90%'}} variant="dark" onClick={() => this.toggleModalInvSummary()}>Summary Inventory</Button>
                    </Col>
                    <Col sm>
                        <Button style={{width: '90%'}} variant="dark" onClick={() => this.toggleModalAddInv()}>Add Inventory</Button>   
                    </Col>
                    <Col sm>
                        <Button style={{width: '90%', color: 'white'}} variant="info" onClick={() => this.toggleModalAddItem()}>Add Item</Button>
                    </Col>
                </Row>
                <Row  style={{margin: 10, width: '25%', alignItems: 'center'}}>
                    BATCH DATE:
                    <Form.Control type="date" value={this.state.batchdate} onChange={(text) => {this.setBatchDate(text.target.value)}} />
                </Row>
                
                <div style={{marginTop: 30}}>
                    <Table responsive="sm" striped='columns' style={{textAlign: 'center', margin: 10, width: '90%'}}>
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Date Time</th>
                            <th>AREA</th>
                            <th>STATUS</th>
                            <th>ITEM</th>
                            <th>QUANTITY</th>
                            <th>UNIT</th>
                            <th>ADDED BY</th>
                            <th>CONFIRMED BY</th>
                            <th>BATCH</th>
                            
                            <th>NOTES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(this.state.inventory).reverse().map((key, index) => {
                                const inv = this.state.inventory[key]
                                return (
                                    <tr 

                                        onClick={() => {
                                            
                                        }}
                                    >
                                        <td>{inv.id}</td>
                                        <td>{inv.dt}</td>
                                        <td>{AREA_STRING(Number(inv.area))}</td>
                                        <td>{INV_STAT_STRING(Number(inv.stat))}</td>
                                        <td>{this.state.items[inv.item].name}</td>
                                        <td>{inv.qty}</td>
                                        <td>{UNIT_STRING(Number(this.state.items[inv.item].unit))}</td>
                                        <td>{this.state.staff[inv.emp_no].name}</td>
                                        <td>{this.state.staff[inv.confirmed_by].name}</td>
                                        <td>{inv.batch}</td>
                                        <td>{inv.notes}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
                
            </div>
        <Modal show={this.state.modalAddInv} fullscreen>
            <Modal.Title>
                <Row sm style={{padding: 10}}>
                    <Col sm>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-default">
                                Created By:
                            </InputGroup.Text>
                            <Dropdown>
                                <Dropdown.Toggle disabled={this.state.loading} variant="dark" id="dropdown-basic" style={{width: "80%"}}>
                                    {(this.state.staff == {} || this.state.editor == -1) ? "Select": this.state.staff[this.state.editor].name}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                {
                                    Object.keys(this.state.staff).map((key, index) => (<Dropdown.Item onClick={() => {this.setState({editor: key})}} key={key}>{this.state.staff[key] !== undefined ? this.state.staff[key].name: null}</Dropdown.Item>
                                    ))
                                }
                                </Dropdown.Menu>
                            </Dropdown>
                        </InputGroup>
                        </Col>
                        <Col sm>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-default">
                                Status:
                            </InputGroup.Text>
                            <Dropdown>
                            <Dropdown.Toggle disabled={this.state.loading} variant="dark" id="dropdown-basic" style={{width: "80%"}}>
                                {(this.state.status == -1) ? "Status": INV_STAT_STRING(this.state.status)} 
                                
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                {
                                    Array.from(INV_STAT_ARR).map((_, index) => (<Dropdown.Item onClick={() => {this.setState({status: INV_STAT_ARR[index]})}}>{INV_STAT_STRING(INV_STAT_ARR[index])}</Dropdown.Item>
                                    ))
                                }
                                </Dropdown.Menu>
                            </Dropdown>
                        </InputGroup>
                        </Col>
                </Row>
                <Row sm style={{padding: 10}}>
                    <Col sm>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-default">
                                Batch No.:
                            </InputGroup.Text>
                            <Form.Control
                                aria-label="Default"
                                aria-describedby="inputGroup-sizing-default"
                                disabled
                                value={""}
                            />
                        </InputGroup>
                        </Col>
                        <Col sm>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-default">
                                Area:
                            </InputGroup.Text>
                            <Dropdown>
                            <Dropdown.Toggle disabled={this.state.loading} variant="dark" id="dropdown-basic" style={{width: "80%"}}>
                                {(this.state.area == -1) ? "Area": AREA_STRING(this.state.area)} 
                                
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                {
                                    Array.from(AREA_ARR).map((_, index) => (<Dropdown.Item onClick={() => {this.changeAreaItems(AREA_ARR[index])}}>{AREA_STRING(AREA_ARR[index])}</Dropdown.Item>
                                    ))
                                }
                                </Dropdown.Menu>
                            </Dropdown>
                        </InputGroup>
                        </Col>
                </Row>
                <Row sm style={{padding: 10}}>
                    <Col sm>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="inputGroup-sizing-default">
                                Batch Date:
                            </InputGroup.Text>
                            <Form.Control  type="date" value={this.state.batchdate} onChange={(text) => {this.setBatchDate(text.target.value)}} />
                        </InputGroup>
                    </Col>
                    <Col sm>
                        </Col>
                </Row>
                
                
            </Modal.Title>
            <Modal.Body>
                <p style={{textAlign: 'center', fontSize: 30}}> INVENTORY </p>
                {Array(this.state.rows).fill(1).map((_,index) => (
                        <Row>
                            <InputGroup className="mb-3">
                                <ButtonGroup justified style={{width: "80%"}}>
                                    {this.state.newInventory[index] !== undefined ? <Button disabled={this.state.loading} onClick={() => { this.deleteItem(index)}} variant="danger"> X </Button>: null}
                                    <Dropdown>
                                        <Dropdown.Toggle disabled={this.state.loading} variant="dark" id="dropdown-basic" style={{width: "80%"}}>
                                        {(this.state.items == {} || this.state.newInventory[index] === undefined) ? "Select Inventory": this.state.newInventory[index].name} 
                                        
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                        {
                                            Object.keys(this.state.filteredItems).map((key, index) => (<Dropdown.Item onClick={() => {this.saveInventory(this.state.items[key])}} key={key}>{this.state.items[key] !== undefined ? this.state.items[key].name: null}</Dropdown.Item>
                                            ))
                                        }
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </ButtonGroup>
                                
                                <Form.Control disabled={this.state.newInventory[index] === undefined || this.state.loading} value={this.state.newInventory[index] !== undefined ? this.state.newInventory[index].qty: 0} type='number' style={{width: '10%', flex: 'none'}}
                                    onChange={(data) => {
                                        const tempInventory = this.state.newInventory;
                                        const currentQty = data.target.value
                                        
                                        tempInventory[index] = {
                                        ...tempInventory[index],
                                        qty: currentQty < 0 ? 0: currentQty,
                                        }

                                        this.setState({
                                            newInventory: tempInventory,
                                        })
                                        

                                    }} aria-label="Text input with dropdown button" />
                                <Form.Control disabled value={this.state.newInventory[index] !== undefined ? UNIT_STRING(Number(this.state.newInventory[index].unit)): ""} type='text' style={{width: '10%', flex: 'none'}}
                                onChange={(data) => {
                                    const tempInventory = this.state.newInventory;
                                    const currentQty = data.target.value
                                    
                                    tempInventory[index] = {
                                    ...tempInventory[index],
                                    qty: currentQty < 0 ? 0: currentQty,
                                    }

                                    this.setState({
                                        newInventory: tempInventory,
                                    })
                                    

                                }} aria-label="Text input with dropdown button" />
                            </InputGroup>
                        </Row>
                        
                    ))}
                <InputGroup style={{marginTop: 10}}>
                    <InputGroup.Text>Note</InputGroup.Text>
                    <Form.Control size='lg' as="textarea" aria-label="With textarea" value={this.state.notes} onChange={(data) => {
                        const cdata = data.target.value
                        this.setState({
                            notes: cdata,
                        })
                    }}/>
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='danger' onClick={() => {this.toggleModalAddInv()}} >Close</Button>
                <Dropdown>
                    <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                    {(this.state.staff == {} || this.state.checker == -1) ? "Confirmed By": this.state.staff[this.state.checker].name} 
                    
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                    {
                        Object.keys(this.state.staff).map((key, index) => (<Dropdown.Item onClick={() => {this.setState({checker: key})}} key={key}>{this.state.staff[key] !== undefined ? this.state.staff[key].name: null}</Dropdown.Item>
                        ))
                    }
                    </Dropdown.Menu>
                </Dropdown>
                {this.checkInvFields() ? <Button disabled={this.state.loading} variant='success' onClick={() => {this.saveBatchInventory()}} >Save <Spinner hidden={!this.state.loading} animation="border" /> </Button> : null}
                
            </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalAddItem} size='lg'>
            <Modal.Title>
                <p style={{textAlign: 'center'}}>Add Item</p>
            </Modal.Title>
            <Modal.Body>
                <Row style={{margin: 5}}>
                    <Col xs={6} md={2}> Category: </Col>
                    <Col xs={6} md={4}>
                        <Dropdown>
                            <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                            {(this.state.newItem.cat == -1) ? "Select Category": ICAT_STRING(this.state.newItem.cat)} 
                            
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            {
                                Array.from(ICAT_ARR).map((_, index) => (
                                    <Dropdown.Item key={"cat_arr" + index} onClick={() => {
                                        this.setState({ newItem: {...this.state.newItem, cat: ICAT_ARR[index]} }, () => {})}}>{ICAT_STRING(ICAT_ARR[index])}
                                    </Dropdown.Item>
                                ))
                            }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col xs={6} md={2}> Name: </Col>
                    <Col xs={6} md={4}>
                        <Form.Control value={this.state.newItem.name} type="text" onChange={(text) => {this.setState({ newItem: {...this.state.newItem, name: text.target.value}})}}/>
                    </Col>
                </Row>
                <Row style={{margin: 5}}>
                    <Col xs={6} md={2}> Storage: </Col>
                    <Col xs={6} md={4}>
                        <Dropdown>
                            <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                            {(this.state.newItem.storage == -1) ? "Select Storage": ST_STRING(this.state.newItem.storage)} 
                            
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            {
                                Array.from(ST_ARR).map((_, index) => (<Dropdown.Item onClick={() => {
                                    
                                    this.setState({ newItem: {...this.state.newItem, storage: ST_ARR[index]} }, () => {})}}>{ST_STRING(ST_ARR[index])}</Dropdown.Item>
                                ))
                            }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col xs={6} md={2}> Current Cost: </Col>
                    <Col xs={6} md={4}>
                        <Form.Control value={this.state.newItem.current_cost} type="number" onChange={(text) => {this.setState({ newItem: {...this.state.newItem, current_cost: text.target.value}})}}/>
                    </Col>
                </Row>
                <Row style={{margin: 5}}>
                    <Col xs={6} md={2}> Unit: </Col>
                    <Col xs={6} md={4}>
                        <Dropdown>
                            <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                            {(this.state.newItem.unit == -1) ? "Select Unit": UNIT_STRING(this.state.newItem.unit)} 
                            
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            {
                                Array.from(UNIT_ARR).map((_, index) => (<Dropdown.Item onClick={() => {
                                    
                                    this.setState({ newItem: {...this.state.newItem, unit: UNIT_ARR[index]} }, () => {})}}>{UNIT_STRING(UNIT_ARR[index])}</Dropdown.Item>
                                ))
                            }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col xs={6} md={2}> Supplier: </Col>
                    <Col xs={6} md={4}>
                        <Dropdown>
                            <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                                {(this.state.newItem.supplier == -1) ? "Select Supplier": this.state.suppliers[this.state.newItem.supplier].name}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            {
                                Object.keys(this.state.suppliers).map((key, index) => (<Dropdown.Item onClick={() => {
                                    this.setState({ newItem: {...this.state.newItem, supplier: key} }, () => {})}}>{this.state.suppliers[key].name}</Dropdown.Item>
                                ))
                            }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='danger' onClick={() => {this.toggleModalAddItem()}} >Close</Button>
                <Button variant='dark' onClick={() => {this.addSupplier()}} >New Supplier</Button>
                <Button variant='success' disabled={this.checkFields()} onClick={() => {this.saveItem()}} >Add</Button>
            </Modal.Footer>
        </Modal>
        <Modal show={this.state.modalInvSum} fullscreen>
            <Modal.Title>
                <p style={{textAlign: 'center'}}>Item Summary</p>
                <Row>
                    <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                        Batch Date:
                    </InputGroup.Text>
                        <Form.Control  type="date" value={this.state.currentdate} onChange={(text) => {this.setCurrentDate(text.target.value)}} />
                    </InputGroup>
                </Row>
                <Dropdown>
                    <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{width: "100%"}}>
                        {(this.state.filterArea == -1) ? "Area": AREA_STRING(this.state.filterArea)} 
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => {this.changeSummaryArea(-1)}}>ALL</Dropdown.Item>
                    {
                        Array.from(AREA_ARR).map((_, index) => (<Dropdown.Item onClick={() => {this.changeSummaryArea(AREA_ARR[index])}}>{AREA_STRING(AREA_ARR[index])}</Dropdown.Item>))
                    }
                    </Dropdown.Menu>
                </Dropdown>
                FOR DATE: {format(this.state.currentdate, 'MM/dd/yyyy' )} {format(new Date(new Date().setDate(new Date().getDate()-1)), 'MM/dd/yyyy') === format(this.state.currentdate, 'MM/dd/yyyy') ? "**YESTERDAY**": ""}
            </Modal.Title>
            <Modal.Body>
                <Row style={{margin: 5}}>
                <Table responsive="sm" variant='dark' style={{textAlign: 'center', margin: 10, width: '90%'}}>
                    <thead>
                        <tr>
                            <th>AREA</th>
                            <th>ITEM</th>
                            <th>BEGINNING</th>
                            <th>IN</th>
                            <th>OUT</th>
                            <th>WASTAGE</th>
                            <th>CREW MEAL</th>
                            <th>PORTION</th>
                            <th>TOTAL</th>
                            <th>UNIT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(this.state.inventoryTotal).map((key, index) => {
                            const inv = this.state.inventoryTotal[key]
                            return this.state.items[key] !== undefined ? (
                                <tr 
                                onClick={() => {
                                    
                                }}
                                >
                                <td>{this.state.items[key].area}</td>
                                <td>{this.state.items[key].name}</td>
                                <td>{inv.beginning}</td>
                                <td>{inv[INV_IN]}</td>
                                <td style={{color: 'red'}}>{inv[INV_OUT]}</td>
                                <td style={{color: 'red'}}>{inv[INV_WST]}</td>
                                <td style={{color: 'red'}}>{inv[INV_CM]}</td>
                                <td style={{color: 'red'}}>{inv[INV_PORTION]}</td>
                                <td style={{color: inv.total > 2 ? inv.total > 10 ? 'green': 'yellow':'red'}}>{inv.total}</td>
                                <td>{UNIT_STRING(Number(this.state.items[key].unit))}</td>
                                </tr>
                            ): null
                        })}
                    </tbody>
                </Table>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='danger' onClick={() => {this.toggleModalInvSummary()}} >Close</Button>
            </Modal.Footer>
        </Modal>
        </div>
    )
    
  }
    
}

function Inventory(props) {
    let navigate = useNavigate();

    return (
            <InventoryN {...props} navigate={navigate}/>
      
    )
}

export default Inventory