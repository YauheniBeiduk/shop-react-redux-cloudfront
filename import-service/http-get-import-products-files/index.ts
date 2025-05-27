import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from "@azure/storage-blob";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const fileName = req.query.name;

    if (!fileName) {
        context.res = {
            status: 400,
            body: "Missing 'name' query parameter"
        };
        return;
    }

    const accountName = process.env.BLOB_ACCOUNT_NAME!;
    const accountKey = process.env.BLOB_ACCOUNT_KEY!;
    const containerName = process.env.BLOB_CONTAINER_NAME!;

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName: fileName,
        permissions: BlobSASPermissions.parse("w"),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
        protocol: SASProtocol.Https
    }, sharedKeyCredential).toString();

    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

    context.res = {
        status: 200,
        body: { uploadUrl: url }
    };
};

export default httpTrigger;
