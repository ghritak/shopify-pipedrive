function isNumber(str) {
  // Checking if a given string is number or not
  return !isNaN(parseFloat(str)) && isFinite(str);
}

function isValidOrderId(orderId) {
  // Checking if the order id is empty or not
  if (!orderId) {
    console.error('Order ID is required, please try again.');
    return false;
  }
  // Checking if the order ID is a valid number
  if (!isNumber(orderId)) {
    console.error(`Please provide a valid order ID.`);
    return false;
  }
  return true;
}

module.exports = { isNumber, isValidOrderId };
