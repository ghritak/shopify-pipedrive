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

dotenv.config();

async function integrateShopifyToPipedrive(orderId) {
  try {
    console.log('Fetching the order from shopify ...');
    const order = await getOrder(orderId);
    const customer = order.customer;

    if (!customer?.email) {
      throw new Error(
        'Order found but email is missing in Shopify customer details.'
      );
    }

    console.log('Order found, Finding the customer in pipedrive ...');
    let person = await findPersonByEmail(customer.email);

    if (!person) {
      console.log('Customer not found in Pipedrive, Creating new customer ...');
      person = await createPerson({
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone,
      });
    }

    const deal = await createDeal({
      title: `${customer.first_name} ${customer.last_name}`,
    });

    console.log('Finding the shopify products in pipedrive ...');

    for (const item of order.line_items) {
      if (!item.sku) {
        throw new Error(
          "Couldn't find or create product, Product SKU is missing."
        );
      }

      let product = await findProductByCode(item);

      if (!product) {
        product = await createProduct({
          name: item.name,
          code: item.sku,
          prices: [{ price: item.price, currency: 'INR' }],
        });
      }

      console.log(`Adding product ${product.name} (${product.id}) to deal ...`);

      await attachProductToDeal(
        deal.id,
        product.id,
        parseFloat(item.price),
        item.quantity
      );
    }

    return 'Success';
  } catch (error) {
    console.error('Failure:', error.message);
    return 'Failure';
  }
}

// Get the order ID from the command line arguments
const orderId = process.argv[2];
if (!orderId) {
  console.error('Please provide a Shopify order ID.');
  process.exit(1);
}

integrateShopifyToPipedrive(orderId);
