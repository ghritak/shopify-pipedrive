const axios = require('axios');

// Fetch a shopify order details using order ID
async function getOrder(orderId) {
  try {
    const response = await axios.get(
      `${process.env.SHOPIFY_DOMAIN}/admin/api/2024-04/orders/${orderId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        },
      }
    );

    return response.data.order;
  } catch (error) {
    if (error.response.status === 404) {
      throw new Error(`Not found, Order with ID ${orderId} doesn't exist.`);
    }
    throw new Error(`Failed to fetch order: ${error.message}`);
  }
}

module.exports = { getOrder };
