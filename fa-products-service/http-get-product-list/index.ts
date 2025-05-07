import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";


const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DB!;
const productsContainerId = process.env.COSMOS_CONTAINER_PRODUCTS!;
const stocksContainerId = process.env.COSMOS_CONTAINER_STOCKS!;

const client = new CosmosClient({ endpoint, key });

const httpGetProductList: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

    const db = client.database(databaseId);
    const productsContainer = db.container(productsContainerId);
    const stocksContainer = db.container(stocksContainerId);

    context.log("Incoming request to get product list", {
        method: req.method,
        query: req.query,
        headers: req.headers,
    });

    try {
        const { resources: products } = await productsContainer.items.readAll().fetchAll();
        const { resources: stocks } = await stocksContainer.items.readAll().fetchAll();
        context.log(`Fetched ${products.length} products and ${stocks.length} stock records`);

        const stockMap = new Map(stocks.map((s) => [s.product_id, s.count]));

        const joined = products.map((p) => ({
            ...p,
            count: stockMap.get(p.id) ?? 0,
        }));

        context.log(`Successfully fetched and joined ${joined.length} products with stock data`);

        context.res = {
            status: 200,
            body: joined,
        };
    } catch (err: any) {
        context.log("Error fetching product list", { error: err.message });

        context.res = {
            status: 500,
            body: { message: "Failed to load products", error: err.message },
        };
    }
};

export default httpGetProductList;
