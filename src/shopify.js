const axios = require('axios');

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
    throw new Error(`Failed to fetch order: ${error.message}`);
  }
}

module.exports = { getOrder };
