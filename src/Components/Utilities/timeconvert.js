export function tConvert (time) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
}

export function tConvertHM (time) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }

    const convertedTime = time.join('')
    
    
    return String(convertedTime).slice(0,convertedTime.length-5) + String(convertedTime).slice(convertedTime.length-2,convertedTime.length); // return adjusted time or original string
}

export function dateConvert(date) {
    const nDate = new Date(date)
    const hour = nDate.getHours().toString().length == 1 ? "0" + nDate.getHours(): nDate.getHours()
    const minutes = nDate.getMinutes().toString().length == 1 ? "0" + nDate.getMinutes(): nDate.getMinutes()
    const seconds = nDate.getSeconds().toString().length == 1 ? "0" + nDate.getSeconds(): nDate.getSeconds()

    return hour + ':' + minutes + ':' + seconds;
}

export function tSQLConvert(date) {
  // Split timestamp into [ Y, M, D, h, m, s ]

  var t = date.split(/[- :]/);
  
  // Apply each element to the Date function
  var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
  
  return d;
}

export function tSQLConvertD(date) {
  // Split timestamp into [ Y, M, D, h, m, s ]

  var t = date.split(/[- :]/);
  
  // Apply each element to the Date function
  var d = new Date(Date.UTC(t[0], t[1]-1, t[2]));
  
  return d;
}

export function arrayToObject(array) {
  const target = {}; 
  array.forEach((key, index) => target[array[index].id] = array[index]);
  
  return target
}

export function countProgressItems(orders,cat) {
  const ordersDone = orders.filter(item => item.donetime === "0000-00-00 00:00:00");
  const ordersCancelled = ordersDone.filter(item => item.cancelled !== 1);
  const ordersCat = ordersCancelled.filter(item => item.item.cat == cat);
  const count = ordersCat.length;
  
  return count;
}

export function getStringDate(sDate,separator=''){

  let newDate = new Date(sDate)
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  
  return `${month<10?`0${month}`:`${month}`}${separator}${date<10?`0${date}`:`${date}`}${separator}${year}`
}