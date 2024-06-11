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

    console.log('Order found, Finding the person in pipedrive ...');
    let person = await findPersonByEmail(customer.email);

    if (!person) {
      console.log('Person not found in Pipedrive, Creating new person ...');
      person = await createPerson({
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone,
      });
      console.log('New person has been created : ', {
        name: person.name,
        email: person.email[0].value,
        phone: person.phone[0].value,
      });
    } else {
      console.log('Person found : ', {
        name: person.item.name,
        email: person.item.emails[0],
        phone: person.item.phones[0],
      });
    }

    console.log(
      `Creating a deal for ${customer.first_name} ${customer.last_name} ...`
    );

    const deal = await createDeal({
      title: `${customer.first_name} ${customer.last_name}`,
    });

    console.log(`Deal has been created with title :`, deal.title);

    console.log('Finding the shopify products in pipedrive ...');

    for (const item of order.line_items) {
      if (!item.sku) {
        throw new Error(
          'Cannot find or create product, Product SKU is missing.'
        );
      }
      console.log('Finding product ...', { name: item.name, code: item.sku });
      let product = await findProductByCode(item.sku);

      if (!product) {
        console.log('Product not found, Creating product ...', {
          name: item.name,
          code: item.sku,
        });
        product = await createProduct({
          name: item.name,
          code: item.sku,
          prices: [{ price: item.price, currency: 'INR' }],
        });
        console.log('Product created - ', product);
      } else {
        console.log('Product found with code - ', product.item.code);
      }
      console.log(
        `Adding product to deal ${deal.title} (Deal ID : ${deal.id}) - product ID : ${product.item.id}`
      );
      let attachment = await attachProductToDeal(
        deal.id,
        product.item.id,
        parseFloat(item.price),
        item.quantity
      );
      console.log(
        'Successfully attached product to the Deal with attachment ID :',
        attachment.id
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
