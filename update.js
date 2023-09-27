import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import fetch from 'node-fetch';
import admZip from 'adm-zip';
import fs from 'fs';
import {parse} from 'csv-parse';
import {stemStreet} from "./alphabetical.js";

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

let alphabeticalIndex = new Map();
fs.createReadStream(CSV_FILE).pipe(parse({
	delimiter: ',',
	columns: true
}, function (err, streets) {
	if (err) {
		console.warn(err);
	} else {
		streets.forEach(street => {
			const terms = stemStreet(street);
			terms.forEach(term => {
				if (alphabeticalIndex.has(term)) {
					let items = alphabeticalIndex.get(term);
					items.push(street);
					alphabeticalIndex.set(term, items);
				} else {
					alphabeticalIndex.set(term, [street]);
				}
			});

			//Remove (currently) redundant properties
			delete street.streetid;
			delete street.ulica_maticni_broj;
			delete street.ulica_ime;
			delete street.naselje_maticni_broj;
			delete street.naselje_ime;
			delete street.opstina_maticni_broj;
			delete street.opstina_ime;
			delete street.tip;
			delete street.tip_lat;
			delete street.created;
			delete street.modificationdate;
			delete street.retired;
			delete street.primary_key
		});
		
		console.log(`Alphabetical index built with ${alphabeticalIndex.size} items`);
		console.log(alphabeticalIndex.get('zmaj'));
	}
}));