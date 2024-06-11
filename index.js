const readline = require('readline');
const { getOrder } = require('./src/shopify');
const {
  findPersonByEmail,
  createPerson,
  findProductByCode,
  createProduct,
  createDeal,
  attachProductToDeal,
} = require('./src/pipedrive');
const dotenv = require('dotenv');
const { isValidOrderId } = require('./src/utils');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function integrateShopifyToPipedrive(orderId) {
  try {
    console.log('Fetching the order from shopify ...');

    // Featch the shopify order details by the given order ID
    const order = await getOrder(orderId);
    const customer = order.customer;

    if (!customer?.email) {
      throw new Error(
        'Order found but email is missing in Shopify customer details.'
      );
    }

    console.log('Order found, Finding the customer in pipedrive ...');

    // Find the shopify customer in pipedrive by email
    let person = await findPersonByEmail(customer.email);

    if (!person) {
      console.log('Customer not found in Pipedrive, Creating new customer ...');

      // Create a new customer if the shopify customer doesn't exist in pipedrive
      person = await createPerson({
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone,
      });
    }

    // Create a new deal for the customer
    const deal = await createDeal({
      title: `${customer.first_name} ${customer.last_name}`,
    });

    console.log('Finding the shopify products in pipedrive ...');

    // Loop through all the ordered items from the shopify order line_items
    for (const item of order.line_items) {
      if (!item.sku) {
        throw new Error(
          "Couldn't find or create product, Product SKU is missing."
        );
      }

      // Find shopify product in pipedrive by SKU
      let product = await findProductByCode(item);

      if (!product) {
        // Create product in pipedrive is it doesn't exist
        product = await createProduct({
          name: item.name,
          code: item.sku,
          prices: [{ price: item.price, currency: 'INR' }],
        });
      }

      console.log(`Adding product ${product.name} (${product.id}) to deal ...`);

      // Attach products to the newly created deal
      await attachProductToDeal(
        deal.id,
        product.id,
        parseFloat(item.price),
        item.quantity
      );
    }

    // Integration process has been completed, Exit from the process
    return 'Process completed';
  } catch (error) {
    console.error('Failure:', error.message);
    return 'Failure';
  }
}

function promptOrderId() {
  rl.question('Please enter the Shopify order ID: ', (orderId) => {
    if (!isValidOrderId(orderId)) {
      rl.close();
      return;
    }

    integrateShopifyToPipedrive(orderId)
      .then((result) => {
        console.log(result);
        rl.close();
      })
      .catch((error) => {
        console.error('Error:', error.message);
        rl.close();
      });
  });
}

promptOrderId();
