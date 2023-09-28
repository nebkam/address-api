import fs from 'fs';
import {parse} from 'csv-parse';
import {MongoClient, ServerApiVersion} from 'mongodb';

const uri = process.env.MONGODB_DSN;
const CSV_FILE = './ulica-sifarnik.csv';
const mongoClient = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

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
function csvRecordToDocument(row) {
	return {
		title: row.ulica_ime_lat,
		settlement: row.naselje_ime_lat,
		municipality: row.opstina_ime_lat,
	};
}

fs.createReadStream(CSV_FILE).pipe(parse({
	delimiter: ',',
	columns: true
}, function (err, records) {
	if (err) {
		console.warn(err);
	} else {
		const documents = records.map(csvRecordToDocument);

		mongoClient
			.connect()
			.then(() => {
				mongoClient
					.db('addresses')
					.collection('streets')
					.insertMany(documents)
					.then((result) => {
						console.log(`${result.insertedCount} documents were inserted`);

						mongoClient.close();
					});
			});
	}
}));