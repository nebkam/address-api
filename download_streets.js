import {createWriteStream, unlink} from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import fetch from 'node-fetch';
import admZip from 'adm-zip';

const streamPipeline = promisify(pipeline);

const REMOTE_ZIP = 'https://download.geosrbija.rs/adresniregistar_ulica?username=opendata&password=opendata&format=csv&geom=false';
const LOCAL_ZIP = './streets.zip';
const ZIP_ENTRY = 'tmp/data/ready/adresni/ulica-sifarnik.csv';

const response = await fetch(REMOTE_ZIP);

if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);

await streamPipeline(response.body, createWriteStream(LOCAL_ZIP));

const zip = new admZip(LOCAL_ZIP);
zip.extractEntryTo(ZIP_ENTRY, "./", false, true);

unlink(LOCAL_ZIP, (err) => {
	if (err) throw err;
});