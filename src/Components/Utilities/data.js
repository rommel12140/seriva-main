export const tables = [{table_no: 1, table_name: "Select Table"}]
export const chefs = {
    0: {id: 0, nickname: "Ann"},
    1: {id: 1, nickname: "Don"},
    2: {id: 2, nickname: "Shawn"},
}

export const taker = {
    0: {
        id: 0,
        name: "Rommel",
        nickname: "Mel",
        area: 0,
        position: "GM",
    }
}


// Cat 1: Restaurant, 2: Cafe
// Restaurant Type 1: Appetizer, 2: Soups, 3: Mains, 
// 4: Dessert, 5: Salads, 6: Pasta, 7: Sandwiches
// Cafe Type 8: Drinks, 9: Snacks

export const menu = [
    { 
        menu_id: 1,
        cat: 1,
        name: "Aglio Olio Gamberetti",
        type: 6,
        est_time: 20,
        cogs: 0,
    },
    { 
        menu_id: 2,
        cat: 1,
        name: "Maiale Brasato",
        type: 3,
        est_time: 20,
        cogs: 0,
    },
    { 
        menu_id: 3,
        cat: 2,
        name: "Clubhouse Sandwich",
        type: 6,
        est_time: 20,
        cogs: 0,
    },
    { 
        menu_id: 4,
        cat: 2,
        name: "Mango Shake",
        type: 5,
        est_time: 20,
        cogs: 0,
    },
]

export const language = "en-US";
export const timeZone = { timeZone: "Asia/Manila" };

export function getNowDate() {
    const convertToUTC = new Date().toLocaleString(language,timeZone);


    return convertToUTC;
}

//AREA
//0 - SUPERADMIN
//1 - ADMIN
//2 - FOH-RESTAURANT
//3 - KITCHEN-RESTAURANT
//4 - FOH-CAFE

export const AREA_SUPERADMIN = 0
export const AREA_ADMIN = 1
export const AREA_FOH_RESTAURANT = 2
export const AREA_KITCHEN_RESTAURANT = 3
export const AREA_FOH_CAFE = 4

export const CAT_RESTAURANT = 1
export const CAT_CAFE = 2