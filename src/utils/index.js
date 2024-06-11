function isNumber(str) {
  return !isNaN(parseFloat(str)) && isFinite(str);
}

function isValidOrderId(orderId) {
  if (!orderId) {
    console.error('Order ID is required, please try again.');
    return false;
  }
  if (!isNumber(orderId)) {
    console.error(`Please provide a valid order ID.`);
    return false;
  }
  return true;
}

module.exports = { isNumber, isValidOrderId };
