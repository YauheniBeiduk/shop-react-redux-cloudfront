import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
import { faker } from '@faker-js/faker';

dotenv.config();

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT;
const COSMOS_KEY = process.env.COSMOS_KEY;
const COSMOS_DB = process.env.COSMOS_DB;
const COSMOS_CONTAINER_PRODUCTS = process.env.COSMOS_CONTAINER_PRODUCTS;
const COSMOS_CONTAINER_STOCKS = process.env.COSMOS_CONTAINER_STOCKS;
const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });

const db = client.database(COSMOS_DB);
const productsContainer = db.container(COSMOS_CONTAINER_PRODUCTS);
const stocksContainer = db.container(COSMOS_CONTAINER_STOCKS);

async function seedData() {
  const products = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseInt(faker.commerce.price(), 10),
  }));

  for (const product of products) {
    await productsContainer.items.upsert(product);
    await stocksContainer.items.upsert({
      product_id: product.id,
      count: faker.number.int({ min: 0, max: 100 }),
    });
  }

  console.log("Seeded products and stock data to Cosmos DB");
}

seedData().catch((err) => {
  console.error("Failed to seed data", err);
});
