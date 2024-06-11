# Shopify Pipedrive Integration

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository**

   ```
   git clone https://github.com/ghritak/shopify-pipedrive.git
   ```

2. **Navigate into the Project directory**

   ```
   cd shopify-pipedrive
   ```

3. **Install dependencies**

   ```
   yarn install
   ```

4. **Run the integration program**

   ```
   yarn start
   ```

5. **Enter the Shopify Order ID in the prompt like below**

   ```
   Please enter the Shopify order ID: 5891325493548
   ```

6. **Lists all the orders associated with the shopify account**

   ```
   yarn orders
   ```

## Configure Environment variables

Create a file named .env and put the below code. Replace the values with the actual credentials from email.

```sh
SHOPIFY_DOMAIN="https://example-store.myshopify.com"
SHOPIFY_TOKEN="<example_shopify_api_token>"
PIPEDRIVE_DOMAIN="https://api.pipedrive.com/v1"
PIPEDRIVE_TOKEN="<example_pipedrive_api_token>"
```

**_Thanks for visiting_**
