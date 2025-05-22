import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";
import { faker } from '@faker-js/faker';
import { isValidProduct } from "../utils/utils";

const endpoint = process.env.COSMOS_ENDPOINT!;
const key = process.env.COSMOS_KEY!;
const databaseId = process.env.COSMOS_DB!;
const productsContainerId = process.env.COSMOS_CONTAINER_PRODUCTS!;
const stocksContainerId = process.env.COSMOS_CONTAINER_STOCKS!;

const client = new CosmosClient({ endpoint, key });
const db = client.database(databaseId);
const productsContainer = db.container(productsContainerId);
const stocksContainer = db.container(stocksContainerId);

const httpPostProduct: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
    try {
        context.log("Incoming request to create a product", {
            method: req.method,
            body: req.body,
            headers: req.headers,
        });
        const { title, description, price, count } = req.body;

        const { valid, errors } = isValidProduct(req.body);

        if (!valid) {
            context.log("Validation failed", { errors });
            context.res = {
                status: 400,
                body: {
                    message: "Invalid product data",
                    errors,
                },
            };
            return;
        }

        const productId = faker.string.uuid();

        const newProduct = {
            id: productId,
            title,
            description,
            price,
        };

        const newStock = {
            id: faker.string.uuid(),
            product_id: productId,
            count,
        };
        context.log("Product successfully created", newStock, newProduct);

        const { resource: createdProduct } = await productsContainer.items.create(newProduct);

        await stocksContainer.items.create(newStock);

        context.res = {
            status: 201,
            body: createdProduct,
        };
    } catch (err: any) {
        context.log("Error creating product", { error: err.message });
        context.res = {
            status: 500,
            body: {
                message: "Failed to create product",
                error: err.message,
            },
        };
    }
};

export default httpPostProduct;
