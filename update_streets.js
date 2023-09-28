import {MongoClient, ServerApiVersion} from 'mongodb';
import { parse } from 'csv-parse/sync';
import {readFileSync} from "node:fs";

const CSV_FILE = './ulica-sifarnik.csv';

/**
 * @param {Object} row
 * @param {String} row.streetid
 * @param {String} row.ulica_maticni_broj
 * @param {String} row.ulica_ime
 * @param {String} row.ulica_ime_lat
 * @param {String} row.ulica_tip
 * @param {String} row.ulica_tip_lat
 * @param {String} row.created
 * @param {String} row.modificationdate
 * @param {String} row.retired
 * @param {String} row.naselje_maticni_broj
 * @param {String} row.naselje_ime
 * @param {String} row.naselje_ime_lat
 * @param {String} row.opstina_maticni_broj
 * @param {String} row.opstina_ime
 * @param {String} row.opstina_ime_lat
 * @param {String} row.primary_key
 */
function streetRecordToDocument(row) {
	return {
		title: row.ulica_ime_lat,
		settlement: row.naselje_ime_lat,
		municipality: row.opstina_ime_lat,
	};
}

const records = parse(readFileSync(CSV_FILE), {
	columns: true
});

const documents = records.map(streetRecordToDocument);

const client = new MongoClient(process.env.MONGODB_DSN, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

async function run() {
	try {
		await client.connect();
		const streetCollection = client.db('addresses').collection('streets');
		
		// Reset
		const deleteResult = await streetCollection.deleteMany();
		console.log("Deleted " + deleteResult.deletedCount + " documents");

		// Insert fresh
		const insertManyResult = await streetCollection.insertMany(documents);
		console.log(`${insertManyResult.insertedCount} documents were inserted`);
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close(true);
	}
}

run().catch(console.dir);