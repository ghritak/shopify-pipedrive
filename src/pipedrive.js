const axios = require('axios');

async function findPersonByEmail(email) {
  try {
    const response = await axios.get(
      `${process.env.PIPEDRIVE_DOMAIN}/persons/search`,
      {
        params: {
          term: email,
          fields: 'email',
          api_token: process.env.PIPEDRIVE_TOKEN,
        },
      }
    );
    if (response.data.data.items.length) {
      const data = response.data.data.items[0];
      console.log('Person found : ', {
        name: data.item.name,
        email: data.item.emails[0],
        phone: data.item.phones[0],
      });
      return data;
    } else {
      console.log(`No person found with email ${email}`);
    }
  } catch (error) {
    console.log("Couldn't find the person in pipedrive", error.message);
    throw new Error(`Failed to find person: ${error.message}`);
  }
}

async function createPerson(person) {
  try {
    const response = await axios.post(
      `${process.env.PIPEDRIVE_DOMAIN}/persons`,
      person,
      {
        params: { api_token: process.env.PIPEDRIVE_TOKEN },
      }
    );
    let data = response.data.data;
    console.log('New Customer has been created : ', {
      name: data.name,
      email: data.email[0].value,
      phone: data.phone[0].value,
    });
    return data;
  } catch (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}

async function findProductByCode(item) {
  try {
    const { sku, name, price } = item;
    console.log('Finding product ...', { name, sku, price });
    const response = await axios.get(
      `${process.env.PIPEDRIVE_DOMAIN}/products/search`,
      {
        params: {
          term: sku,
          fields: 'code',
          api_token: process.env.PIPEDRIVE_TOKEN,
          exact_match: true,
        },
      }
    );
    if (response.data.data.items.length) {
      const data = response.data.data.items[0].item;
      console.log('Product found with code - ', data.code);
      return data;
    } else {
      console.log(`No product found with code (SKU) ${sku}`);
    }
  } catch (error) {
    throw new Error(`Failed to find product: ${error.message}`);
  }
}

async function createProduct(product) {
  console.log('Creating product ...', {
    name: product.name,
    code: product.code,
  });
  try {
    const response = await axios.post(
      `${process.env.PIPEDRIVE_DOMAIN}/products`,
      product,
      {
        params: { api_token: process.env.PIPEDRIVE_TOKEN },
      }
    );
    if (response.data.data) {
      return response.data.data;
    } else {
      throw new Error(`Couldn't create product.`);
    }
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

async function createDeal(deal) {
  console.log(`Creating deal for customer ${deal.title} ...`);
  try {
    const response = await axios.post(
      `${process.env.PIPEDRIVE_DOMAIN}/deals`,
      deal,
      {
        params: { api_token: process.env.PIPEDRIVE_TOKEN },
      }
    );
    if (response.data.data) {
      const data = response.data.data;
      console.log(`Deal has been created with title :`, data.title);
      return data;
    }
  } catch (error) {
    throw new Error(`Failed to create deal: ${error.message}`);
  }
}

async function attachProductToDeal(dealId, product_id, item_price, quantity) {
  try {
    const response = await axios.post(
      `${process.env.PIPEDRIVE_DOMAIN}/deals/${dealId}/products`,
      {
        product_id,
        item_price,
        quantity,
      },
      {
        params: { api_token: process.env.PIPEDRIVE_TOKEN },
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to attach product to deal: ${error.message}`);
  }
}

module.exports = {
  findPersonByEmail,
  createPerson,
  findProductByCode,
  createProduct,
  createDeal,
  attachProductToDeal,
};
