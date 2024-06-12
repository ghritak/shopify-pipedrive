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
    console.log(`Fetching order ${orderId} from shopify ...`);

    // Featch the shopify order details by the given order ID
    const order = await getOrder(orderId);
    const customer = order.customer;

    if (!customer?.email) {
      throw new Error(
        'Order found but email is missing in Shopify customer details.'
      );
    }

    console.log('Order found, Finding the customer by email in pipedrive ...');

    // Find the shopify customer in pipedrive by email
    let person = await findPersonByEmail(customer.email);

    if (!person) {
      console.log(
        `Customer not found in Pipedrive, Creating customer ${customer.first_name} ${customer.last_name} ...`
      );

      // Create a new customer if the shopify customer doesn't exist in pipedrive
      person = await createPerson({
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone,
      });
    }

    console.log('Finding the shopify products in pipedrive ...');

    let globalProducts = [];

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

      // Storing all the product created or found from pipedirve
      globalProducts.push({
        ...product,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Create a new deal for the customer
    const deal = await createDeal({
      title: `${customer.first_name} ${customer.last_name}`,
    });

    // Attach all the products to the newly created deal
    for (const product of globalProducts) {
      console.log(`Adding product ${product.name} (${product.id}) to deal ...`);
      await attachProductToDeal(
        deal.id,
        product.id,
        parseFloat(product.price),
        product.quantity
      );
    }

    console.log('Successfully attached products to the Deal.');

    // Integration process has been completed, Exit from the process
    return 'Process completed';
  } catch (error) {
    console.error('Failure:', error.message);
    return 'Failure';
  }
}

function promptOrderId() {
  rl.question('Please enter the Shopify order ID: ', (orderId) => {
    // Checking wheather orderId is valid or not
    if (!isValidOrderId(orderId)) {
      rl.close();
      return;
    }

    // Running the integration process
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
