import { parse } from 'csv-parse/sync';
import { ServiceBusClient } from '@azure/service-bus';

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING!;
const topicName = process.env.SERVICE_BUS_TOPIC_NAME!;

/**
 * Azure Function triggered by new blob in 'uploaded' container.
 */
export async function run(context, myBlob) {
  const blobName = context.bindingData.name;

  try {
    const csvText = myBlob.toString('utf8');

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    if (records.length === 0) {
      context.log('⚠️ No records found in CSV.');
      return;
    }

    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(topicName);

    const messages = records.map(record => ({
      body: record,
      contentType: "application/json",
    }));

    await sender.sendMessages(messages);

    await sender.close();
    await sbClient.close();

    context.log(`📬 Sent ${messages.length} messages to Service Bus Topic.`);
  } catch (error) {
    context.log.error(`❌ Failed to process blob '${blobName}':`, error.message);
  }
}
