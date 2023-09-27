import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import fetch from 'node-fetch';
import admZip from 'adm-zip';

const STREETS_URL = 'https://download.geosrbija.rs/adresniregistar_ulica?username=opendata&password=opendata&format=csv&geom=false';
const streamPipeline = promisify(pipeline);
const response = await fetch(STREETS_URL);

if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);

await streamPipeline(response.body, createWriteStream('./streets.zip'));

const zip = new admZip('./streets.zip');
zip.extractEntryTo("tmp/data/ready/adresni/ulica-sifarnik.csv", "./", false, true);
