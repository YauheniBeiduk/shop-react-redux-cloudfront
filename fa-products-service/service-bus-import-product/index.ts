import { AzureFunction, Context } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const serviceBusTrigger: AzureFunction = async function (context: Context, message: string): Promise<void> {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key      = process.env.COSMOS_KEY;

  if (!endpoint || !key) {
    context.log.error("Missing Cosmos DB credentials");
    return;
  }

  const client = new CosmosClient({ endpoint, key });
  const database  = client.database(process.env.COSMOS_DB!);
  const container = database.container(process.env.COSMOS_CONTAINER_PRODUCTS!);

  context.log("Received message:", message);

  let product;

  try {
    product = typeof message === 'string' ? JSON.parse(message) : message;
  } catch (error) {
    context.log.error("Failed to parse message JSON", error);
    return;
  }

  try {
    await container.items.create(product);
    context.log("Inserted product into Cosmos:", product);
  } catch (error) {
    context.log.error("Failed to insert into Cosmos", error);
  }
};

export default serviceBusTrigger;
