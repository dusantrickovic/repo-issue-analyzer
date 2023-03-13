function isValidDateFormat(date) {
    const dateObject = new Date();
    // Use a regular expression to match the date format
    const dateFormatString = /^\d{4}-\d{2}-\d{2}$/;
    // Find current date
    const currentDay = dateObject.getDate();
    const currentMonth = dateObject.getMonth() + 1;  // Begins counting from 0
    const currentYear = dateObject.getFullYear();
  
    // If the date string matches the regular expression, check if the month and day values are valid
    if (dateFormatString.test(date)) {
      const year = parseInt(date.slice(0, 4));
      const month = parseInt(date.slice(5, 7));
      const day = parseInt(date.slice(8, 10));
      // There's no month past December and no day past 31st and no search can look into the future

      if (month <= 12 && day <= 31) {
        if (year < currentYear || (year === currentYear && month < currentMonth) || 
            (year === currentYear && month === month && day <= currentDay)) {
                return true;
        }
      }
    }
  
    // If the date string is invalid or the month and day values are invalid, return false
    return false;
  }

  module.exports = isValidDateFormat;