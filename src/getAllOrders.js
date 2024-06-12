const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Fetch all the order from shopify store
async function getAllOrder() {
  try {
    const response = await axios.get(
      `${process.env.SHOPIFY_DOMAIN}/admin/api/2024-04/orders.json?status=any`,
      {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        },
      }
    );

    const orders = response.data.orders;

    if (orders.length) {
      console.log(
        '\nTotal',
        orders.length,
        'orders found\n------------------------------------------------------------------\n'
      );
      // Looping through all the Shopify orders
      orders.forEach((order) => {
        console.log('ID :', order.id);

        // Looping through each order item
        order.line_items.forEach((item) => {
          console.log({
            name: item.name,
            price: `${item.price} INR`,
            quantity: item.quantity,
          });
        });
        console.log(
          '\n------------------------------------------------------------------\n'
        );
      });
    }

    // Fetching data completed
    return 'Success';
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(
        `Not found, There is no order associated with the shopify account.`
      );
    }
    throw new Error(`Failed to fetch orders : ${error.message}`);
  }
}

getAllOrder();
