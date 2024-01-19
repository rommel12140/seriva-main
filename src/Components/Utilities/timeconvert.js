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
    const hour = date.getHours().toString().length == 1 ? "0" + date.getHours(): date.getHours()
    const minutes = date.getMinutes().toString().length == 1 ? "0" + date.getMinutes(): date.getMinutes()
    const seconds = date.getSeconds().toString().length == 1 ? "0" + date.getSeconds(): date.getSeconds()

    return hour + ':' + minutes + ':' + seconds;
}
   