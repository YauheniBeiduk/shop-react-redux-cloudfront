import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DB!;
const productsContainerId = process.env.COSMOS_CONTAINER_PRODUCTS!;
const stocksContainerId = process.env.COSMOS_CONTAINER_STOCKS!;

const client = new CosmosClient({ endpoint, key });

const httpGetProductById: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
    const id = context.bindingData.productId;
    const db = client.database(databaseId);
    const productsContainer = db.container(productsContainerId);
    const stocksContainer = db.container(stocksContainerId);
    context.log(`Incoming request to get product by id: ${id}`, {
        method: req.method,
        query: req.query,
        headers: req.headers,
    });

    try {
        const { resource: product } = await productsContainer.item(id, id).read();

        if (!product) {
            context.res = {
                status: 404,
                body: { message: "Product not found" },
            };
            return;
        }
        context.log(`Fetching stock for product with id: ${id}`);

        const { resource: stock } = await stocksContainer.item(id, id).read();
        context.log(`Successfully fetched product and stock for product with id: ${id}`);

        context.res = {
            status: 200,
            body: {
                ...product,
                count: stock?.count ?? 0,
            },
        };
    } catch (err: any) {
        context.log(`Error fetching product with id: ${id}`, { error: err.message });

        context.res = {
            status: 500,
            body: { message: "Failed to get product", error: err.message },
        };
    }
};

export default httpGetProductById;
