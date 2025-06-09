import { parse } from 'csv-parse/sync';

/**
 * Azure Function triggered by new blob in 'uploaded' container.
 */
export async function run(context, myBlob) {
    context.log('🚀 Blob import function triggered');
    const blobName = context.bindingData.name;

    try {
        const csvText = myBlob.toString('utf8');
        context.log(`📄 Parsing CSV from blob: ${blobName}`);

        const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
        });

        if (records.length === 0) {
            context.log('⚠️ No records found in CSV.');
            return;
        }

        context.log(`✅ Parsed ${records.length} records:`);

        for (const [index, record] of records.entries()) {
            context.log(`🔹 Record ${index + 1}: ${JSON.stringify(record)}`);
        }
    } catch (error) {
        context.log.error(`❌ Failed to parse CSV from blob '${blobName}':`, error.message);
    }
}
