import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import fetch from 'node-fetch';
import admZip from 'adm-zip';
import fs from 'fs';
import { parse } from 'csv-parse';

const streamPipeline = promisify(pipeline);

const REMOTE_ZIP = 'https://download.geosrbija.rs/adresniregistar_ulica?username=opendata&password=opendata&format=csv&geom=false';
const LOCAL_ZIP = './streets.zip';
const ZIP_ENTRY = 'tmp/data/ready/adresni/ulica-sifarnik.csv';
const CSV_FILE = './ulica-sifarnik.csv';

const response = await fetch(REMOTE_ZIP);

if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

await streamPipeline(response.body, createWriteStream(LOCAL_ZIP));

const zip = new admZip(LOCAL_ZIP);
zip.extractEntryTo(ZIP_ENTRY, "./", false, true);

const parser = parse({
	delimiter: ',', 
	columns: true,
	cast: function(value, context){
		if (context.column === 'streetid') {
			return parseInt(value);
		}
		if (context.column === 'created' && value) {
			return new Date(value);
		}
		if (context.column === 'modificationdate' && value) {
			return new Date(value);
		}
		if (context.column === 'retired' && value) {
			return new Date(value);
		}
		if (context.column === 'primary_key') {
			return parseInt(value);
		}
		
		return value;
	}
}, function(err, data){
	if (err) {
		console.warn(err);
	} else {
		console.log(data);
	}
});

fs.createReadStream(CSV_FILE).pipe(parser);