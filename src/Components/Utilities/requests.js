import axios, { Axios } from "axios";
import { format } from "date-fns";
import { getStringDate } from "./timeconvert";

const POST_METHOD = "POST"
const GET_METHOD = "GET"

//GET
const API_SUPPLIER_GET = "getSuppliers.php"
const API_INV_GET = "getInventory.php"
const API_INV_ITEMS_GET = "getInventoryItems.php"
const API_MENU_GET = "getMenu.php"
const API_AVAIABLE_MENU_GET = "getAvailableMenu.php"
const API_TABLES_GET = "getTables.php"
const API_OS_GET = "getOrderSlips.php"
const API_LAST_OS_GET = "getLastOS.php"
const API_LAST_BATCH_GET = "getLastBatch.php"
const API_OPEN_OS_GET = "getOpenOrderSlips.php"
const API_EMPLOYEES_GET = "getEmployees.php"
const API_SERVERS_GET = "getServers.php"
const API_COOKS_GET = "getCooks.php"
const API_BARISTA_GET = "getBarista.php"
const API_RESERVATIONS_GET = "getReservations.php"
const API_OPEN_RESERVATIONS_GET = "getOpenReservations.php"
const API_INCOMING_RESERVATIONS_GET = "getIncomingReservations.php"

//UPDATE
const API_OS_CANCEL_UPDATE = "cancelOrderSlip.php"
const API_RES_CANCEL_UPDATE = "cancelReservation.php"
const API_RES_OS_UPDATE = "updateOSReservation.php"
const API_ORDER_UPDATE = "updateOrder.php"
const API_OS_TABLE_UPDATE = "updateOSTable.php"
const API_ORDER_DONE_UPDATE = "updateOrderDone.php"
const API_ORDER_BILLED_UPDATE = "updateOSBilled.php"

const API_ORDER_RETURN_UPDATE = "returnOrder.php"

//POST
const API_MENU_POST = "addMenu.php"
const API_OS_POST = "addOrderSlip.php"
const API_ITEM_POST = "addInventoryItems.php"
const API_SUPPLIER_POST = "addSupplier.php"
const API_INV_POST = "addInventory.php"
const API_RES_POST = "addReservation.php"

export const getIPAddress = "http://192.168.68.123/"

export async function getInvItems(callback) {
    fetch(GET_METHOD, API_INV_ITEMS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getInventory(callback) {
    fetch(GET_METHOD, API_INV_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getSupplier(callback) {
    fetch(GET_METHOD, API_SUPPLIER_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}


export async function getMenu(callback) {
    fetch(GET_METHOD, API_MENU_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getAvailableMenu(callback) {
    fetch(GET_METHOD, API_AVAIABLE_MENU_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getTables(callback) {
    fetch(GET_METHOD, API_TABLES_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getOrderSlips(callback) {
    fetch(GET_METHOD, API_OS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getLastBatch(callback) {
    fetch(GET_METHOD, API_LAST_BATCH_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getLastOS(callback) {
    fetch(GET_METHOD, API_LAST_OS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getOpenOrderSlips(callback) {
    fetch(GET_METHOD, API_OPEN_OS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getEmployees(callback) {
    fetch(GET_METHOD, API_EMPLOYEES_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getServers(callback) {
    fetch(GET_METHOD, API_SERVERS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getChefs(callback) {
    fetch(GET_METHOD, API_COOKS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getBarista(callback) {
    fetch(GET_METHOD, API_BARISTA_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getReservations(callback) {
    fetch(GET_METHOD, API_OPEN_RESERVATIONS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}

export async function getReservationsIncoming(callback) {
    fetch(GET_METHOD, API_INCOMING_RESERVATIONS_GET, null, (responseFetch) => {
        const response = responseFetch.response
        callback({response: response.data})
    })
}


export async function cancelOrderSlip(os,callback) {
    //Update status
    
    const orders = JSON.parse(os.orders)
    var newOrder = []
    for (var i =0 ; i < orders.length; i++) {

        const tempOrder = {
            item: orders[i].item,
            cancelled: 1,
            donetime: orders[i].donetime,
            quantity: orders[i].quantity,
            returned: orders[i].returned,
        }

        newOrder.push(tempOrder)
    }

    var formData = new FormData();
    formData.append("os_no", os.os_no)
    formData.append("orders", JSON.stringify(newOrder))
    formData.append("cancelled", 1)

    fetch(POST_METHOD, API_OS_CANCEL_UPDATE, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function cancelReservation(res,callback) {
    //Update status

    var formData = new FormData();
    formData.append("res_no", res)
    formData.append("cancelled", 1)

    fetch(POST_METHOD, API_RES_CANCEL_UPDATE, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function updateOSTable(table_no,os,callback) {
    //Update status

    var formData = new FormData();
    formData.append("table_no", table_no)
    formData.append("os_no", os)
    
    fetch(POST_METHOD, API_OS_TABLE_UPDATE, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function updateOSReservation(res,os,callback) {
    //Update status

    var formData = new FormData();
    formData.append("res_no", res)
    formData.append("os_no", os)

    fetch(POST_METHOD, API_RES_OS_UPDATE, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function cancelOrderFromOS(os,index,callback) {
    //Update status
    var orders = JSON.parse(os.orders)

    const ordersIteration = orders.filter(item => item.cancelled === 0);
    const ordersCount = ordersIteration.length;
    if(ordersCount === 1){
        cancelOrderSlip(os, (responseFetch) => {
            const response = responseFetch.response

            callback({response: response})
        })

    } else {
        orders[index] = {
            item: orders[index].item,
            cancelled: 1,
            donetime: orders[index].donetime,
            quantity: orders[index].quantity,
            returned: orders[index].returned,
        }

        var formData = new FormData();
        formData.append("os_no", os.os_no)
        formData.append("orders", JSON.stringify(orders))
        
        fetch(POST_METHOD, API_ORDER_UPDATE, formData, (responseFetch) => {
            
            console.log(responseFetch.data)
            callback({response: responseFetch.data})
        })
    }   
}

export async function updateChefFromOrder(os,index,chef_id,callback) {
    //Update status
    var orders = JSON.parse(os.orders)
    
    orders[index] = {
        item: orders[index].item,
        cancelled: orders[index].cancelled,
        donetime: orders[index].donetime,
        quantity: orders[index].quantity,
        returned: orders[index].returned,
        chef_id: chef_id,
    }

    var formData = new FormData();
    formData.append("os_no", os.os_no)
    formData.append("orders", JSON.stringify(orders))
    formData.append("donetime", "")
    
    fetch(POST_METHOD, API_ORDER_UPDATE, formData, (responseFetch) => {
        
        console.log(responseFetch.data)
        callback({response: responseFetch.data})
    })
}

export async function billedAllOrders(os,callback) {
    var formData = new FormData();

    formData.append("os_no", os.os_no)
    formData.append("billed", format(new Date(), 'yyyy/MM/dd kk:mm:ss'))
    
    fetch(POST_METHOD, API_ORDER_BILLED_UPDATE, formData, (responseFetch) => {
        console.log(responseFetch.data)
        callback({response: responseFetch.data})
    })
}

export async function completeAllOrders(os,index,callback) {
    var orders = JSON.parse(os.orders)

    orders[index] = {
        item: orders[index].item,
        cancelled: orders[index].cancelled,
        donetime: format(new Date(), 'yyyy/MM/dd kk:mm:ss'),
        quantity: orders[index].quantity,
        returned: orders[index].returned,
        chef_id: orders[index].chef_id,
    }

    var formData = new FormData();
    formData.append("os_no", os.os_no)
    formData.append("orders", JSON.stringify(orders))
    formData.append("donetime", format(new Date(), 'yyyy/MM/dd kk:mm:ss'))
    
    fetch(POST_METHOD, API_ORDER_DONE_UPDATE, formData, (responseFetch) => {
        
        console.log(responseFetch.data)
        callback({response: responseFetch.data})
    })
}

export async function updateOrderStatusDone(os,index,callback) {
    //Update status
    var orders = JSON.parse(os.orders)
    const ordersIteration = orders.filter(item => item.donetime === "0000-00-00 00:00:00");
    const count = ordersIteration.length;
    
    if(count>1) {
    orders[index] = {
        item: orders[index].item,
        cancelled: orders[index].cancelled,
        donetime: format(new Date(), 'yyyy/MM/dd kk:mm:ss'),
        quantity: orders[index].quantity,
        returned: orders[index].returned,
        chef_id: orders[index].chef_id,
    }

    var formData = new FormData();
    formData.append("os_no", os.os_no)
    formData.append("orders", JSON.stringify(orders))
    formData.append("donetime", "")
    
    fetch(POST_METHOD, API_ORDER_UPDATE, formData, (responseFetch) => {
        console.log(responseFetch.data)
    })
    } else {
        completeAllOrders(os,index,(responseFetch) => {
            callback({response: responseFetch.data})
        })
    }
}

export async function addOrderSlip(order, callback) {

    var filterOrders = order.orders
    filterOrders = filterOrders.filter(function( element ) {
        return element !== undefined;
     });
     
    var formData = new FormData();
    formData.append("os_no", 0)
    formData.append("dtime", format(new Date(), 'yyyy/MM/dd kk:mm:ss'))
    formData.append("taker", order.taker)
    formData.append("orders", JSON.stringify(filterOrders))
    formData.append("table_no", order.table)
    formData.append("requests", order.requests)
    formData.append("donetime", null)
    formData.append("billed", null)
    formData.append("cancelled", 0)
    
    fetch(POST_METHOD, API_OS_POST, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function addMenu(menu, callback) {

    var formData = new FormData();
    formData.append("menu_id", 0)
    formData.append("name", menu.name)
    formData.append("cat", menu.cat)
    formData.append("type", menu.type)
    formData.append("est_time", menu.est_time)
    formData.append("cogs", menu.cogs)
    formData.append("available", menu.available)
    formData.append("qty", menu.qty)
    formData.append("removed", menu.removed)
    
    fetch(POST_METHOD, API_MENU_POST, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function addItem(item, callback) {
    var formData = new FormData();
    formData.append("id", 0)
    formData.append("cat", item.cat)
    formData.append("name", item.name)
    formData.append("storage", item.storage)
    formData.append("updated_date", new Date(format(new Date(), 'yyyy/MM/dd')))
    formData.append("current_cost", item.current_cost)
    formData.append("unit", item.unit)
    formData.append("supplier", item.supplier)
    formData.append("price_history", "")
    
    fetch(POST_METHOD, API_ITEM_POST, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function addSupplier(name, callback) {
    var formData = new FormData();
    formData.append("id", 0)
    formData.append("name", name)
    formData.append("address", "")
    formData.append("supplies", "")
    formData.append("first_trans", new Date(format(new Date(), 'yyyy/MM/dd')))
    
    fetch(POST_METHOD, API_SUPPLIER_POST, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}

export async function addInventoryBatch(batch, length, notes, inventory, checker, editor, area, status, callback) {
    var formData = new FormData();
    if(length !== 0) {
        
        formData.append("id", 0)
        formData.append("dt", format(new Date(), 'yyyy/MM/dd kk:mm:ss'))
        formData.append("stat", status)
        formData.append("item", inventory[length-1].id)
        formData.append("qty", inventory[length-1].qty)
        formData.append("notes", notes)
        formData.append("emp_no", editor)
        formData.append("confirmed_by", checker)
        formData.append("batch", batch)
        formData.append("area", area)
        
        fetch(POST_METHOD, API_INV_POST, formData, (responseFetch) => {
            const response = responseFetch.response
            console.log("sent")
            addInventoryBatch(batch, length-1, notes, inventory, checker, editor, area, status, (response) => {
                callback({response: length})
            })
        })
    } else {
        callback({response: length})
    }
    
}

export async function addReservations(res, callback) {

    var filterOrders = res.orders
    filterOrders = filterOrders.filter(function( element ) {
        return element !== undefined;
     });
     
    var formData = new FormData();
    formData.append("res_no", 0)
    formData.append("res_name", res.res_name)
    formData.append("res_date", format(new Date(), 'yyyy/MM/dd kk:mm:ss'))
    formData.append("res_contact", res.res_contact)
    formData.append("pax", res.pax)
    formData.append("orders", JSON.stringify(filterOrders))
    formData.append("notes", res.notes)
    formData.append("service_time", format(new Date(res.service_time), 'yyyy/MM/dd kk:mm:ss'))
    formData.append("table_no", res.table_no)
    formData.append("os_no", 0)
    formData.append("taker", res.taker)
    formData.append("cancelled", res.cancelled)
    
    fetch(POST_METHOD, API_RES_POST, formData, (responseFetch) => {
        const response = responseFetch.response
        console.log(response.data)
        callback({response: response.data})
    })
}


async function fetch(method, api, params, callback){
    const dbAPI = "seriva-resort-main/"
    if(method == "GET") {
        await axios.get(getIPAddress + dbAPI + api, params).then((response)=>{
            callback({response: response})
        }).catch((error) => {
            console.log(error)
        })
    } else if(method == "POST") {
        await axios.post(getIPAddress + dbAPI + api, params).then((response)=>{
            callback({response: response})
        }).catch((error) => {
            alert(error)
            console.log(error)
        })
    }
}

