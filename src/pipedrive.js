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
    if (response.data.data.items) {
      return response.data.data.items[0];
    } else {
      throw new Error(`No person found with email ${email}`);
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
    return response.data.data;
  } catch (error) {
    throw new Error(`Failed to create person: ${error.message}`);
  }
}

async function findProductByCode(code) {
  try {
    const response = await axios.get(
      `${process.env.PIPEDRIVE_DOMAIN}/products/search`,
      {
        params: {
          term: code,
          fields: 'code',
          api_token: process.env.PIPEDRIVE_TOKEN,
          exact_match: true,
        },
      }
    );
    if (response.data.data.items) {
      return response.data.data.items[0];
    } else {
      throw new Error(`No product found with code ${code}`);
    }
  } catch (error) {
    throw new Error(`Failed to find product: ${error.message}`);
  }
}

async function createProduct(product) {
  try {
    const response = await axios.post(
      `${process.env.PIPEDRIVE_DOMAIN}/products`,
      product,
      {
        params: { api_token: process.env.PIPEDRIVE_TOKEN },
      }
    );
    if (response.data.data) {
      const { name, code, prices } = response.data.data;
      return { name, code, price: prices[0].price };
    } else {
      throw new Error(`Couldn't create product.`);
    }
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

async function createDeal(deal) {
  try {
    const response = await axios.post(
      `${process.env.PIPEDRIVE_DOMAIN}/deals`,
      deal,
      {
        params: { api_token: process.env.PIPEDRIVE_TOKEN },
      }
    );
    return response.data.data;
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
