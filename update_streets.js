import fs from 'fs';
import { parse } from 'csv-parse';

const CSV_FILE = './ulica-sifarnik.csv';

const parser = parse({
	delimiter: ',',
	columns: true
}, function(err, data){
	if (err) {
		console.warn(err);
	} else {
		console.log(data);
	}
});

fs.createReadStream(CSV_FILE).pipe(parser);