import fetch from 'node-fetch';

const response = await fetch('https://download.geosrbija.rs/adresniregistar_ulica?username=opendata&password=opendata&format=csv&geom=false');
const body = await response.text();

console.log(body);