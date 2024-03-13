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
export const AREA_COMMI = 5
export const AREA_KITCHEN_RESTAURANT_TOOLS = 6

export const CAT_RESTAURANT = 1
export const CAT_CAFE = 2
export const CAT_EVENTS = 3

// Cat 1: Restaurant, 2: Cafe
// Restaurant Type 1: Appetizer, 2: Soups, 3: Mains, 
// 4: Dessert, 5: Salads, 6: Pasta, 7: Sandwiches
// Cafe Type 8: Drinks, 9: Snacks

export const TYPE_APPETIZER = 1
export const TYPE_SOUPS = 2
export const TYPE_MAINS = 3
export const TYPE_DESSERT = 4
export const TYPE_SALADS = 5
export const TYPE_PASTA = 6
export const TYPE_SANDWICHES = 7
export const TYPE_DRINKS = 8
export const TYPE_SNACKS = 9

export const ICAT_RES = 1 //RESTAURANT
export const ICAT_KIT = 2 //KITCHEN
export const ICAT_CAFE = 3 //CAFE
export const ICAT_EVENTS = 4 //EVENTS

export const ST_FREEZE = 1
export const ST_CHILL = 2
export const ST_DRY = 3

export const UNIT_KG = 1
export const UNIT_G = 2
export const UNIT_PCS = 3
export const UNIT_L = 4
export const UNIT_ML = 5
export const UNIT_SET = 6

export const INV_IN = 1
export const INV_OUT = 2
export const INV_WST = 3
export const INV_CM = 4
export const INV_BRK = 5
export const INV_USED = 6
export const INV_LOST = 7
export const INV_PORTION = 8

export const TYPE_ARR = [1,2,3,4,5,6,7,8,9]
export const AREA_ARR = [0,1,2,3,4,5,6]
export const ICAT_ARR = [1,2,3,4]
export const CAT_ARR = [1,2,3]
export const ST_ARR = [1,2,3]
export const UNIT_ARR = [1,2,3,4,5,6]
export const INV_STAT_ARR = [1,2,3,4,5,6,7,8]

export const CAT_STRING = (data) => {
    switch(data) {
        case CAT_RESTAURANT: return "Restaurant";
        case CAT_CAFE: return "Cafe";
        case CAT_EVENTS: return "Events";

        default: return "N/A";
    }
}

export const TYPE_STRING = (data) => {
    switch(data) {
        case TYPE_APPETIZER: return "Appetizer";
        case TYPE_SOUPS: return "Soups";
        case TYPE_MAINS: return "Mains";
        case TYPE_DESSERT: return "Dessert";
        case TYPE_SALADS: return "Salads";
        case TYPE_PASTA: return "Pasta";
        case TYPE_SANDWICHES: return "Sandwiches";
        case TYPE_DRINKS: return "Drinks";
        case TYPE_SNACKS: return "Snacks";

        default: return "N/A";
    }
}

export const ICAT_STRING = (data) => {
    switch(data) {
        case ICAT_RES: return "Restaurant";
        case ICAT_KIT: return "Kitchen";
        case ICAT_CAFE: return "Cafe";
        case ICAT_EVENTS: return "Events";

        default: return "N/A";
    }
}

export const ST_STRING = (data) => {
    switch(data) {
        case ST_FREEZE: return "Freeze";
        case ST_CHILL: return "Chill";
        case ST_DRY: return "Dry";

        default: return "N/A";
    }
}

export const UNIT_STRING = (data) => {
    switch(data) {
        case UNIT_KG: return "Kilograms";
        case UNIT_G: return "Grams";
        case UNIT_PCS: return "Pieces";
        case UNIT_L: return "Liters";
        case UNIT_ML: return "Milliliters";
        case UNIT_SET: return "Sets";

        default: return "N/A";
    }
}

export const INV_STAT_STRING = (data) => {
    switch(data) {
        case INV_IN: return "In/Add";
        case INV_OUT: return "Out/Subtract";
        case INV_BRK: return "Breakage";
        case INV_CM: return "Crew Meal";
        case INV_USED: return "Used";
        case INV_WST: return "Wastage";
        case INV_LOST: return "LOST/UNTRACED";
        case INV_PORTION : return "PORTION";

        default: return "N/A";
    }
}

export const AREA_STRING = (data) => {
    switch(data) {
        case AREA_ADMIN: return "Admin";
        case AREA_FOH_CAFE: return "FOH Cafe";
        case AREA_FOH_RESTAURANT: return "FOH Restaurant";
        case AREA_KITCHEN_RESTAURANT: return "Kitchen Restaurant";
        case AREA_SUPERADMIN: return "Superadmin";
        case AREA_COMMI: return "Commissary";
        case AREA_KITCHEN_RESTAURANT_TOOLS: return "Kitchen Restaurant - Tools";

        default: return "N/A";
    }
}