/**
 * @param {Set<String>} set
 * @param {String} title
 */
function stem(set, title) {
	const word = title.toLocaleLowerCase();
	const stemFrom = 3;
	for (let i = stemFrom; i <= word.length; i++) {
		set.add(word.substring(0, i));
	}
}
/**
 * @param {Set<String>} set
 * @param {String} sentence
 */
function stemByWords(set, sentence) {
	const words = sentence.split(' ');
	if (words.length > 1) {
		words.forEach(word => stem(set, word));
	}
	// Stem the sentence as a whole, too
	stem(set, sentence);
}

/**
 * @param {Object} street
 * @param {String} street.ulica_ime
 * @param {String} street.ulica_ime_lat
 * @return {Set<String>}
 */
function stemStreet(street) {
	let set = new Set();

	stemByWords(set, street.ulica_ime);
	stemByWords(set, street.ulica_ime_lat);

	return set;
}

export {stemStreet};
