'use strict';
const wkhtmltopdf = require('wkhtmltopdf');
const axios = require('axios').default;
const jsonData = 'https://storage.libmanuels.fr/Delagrave/specimen/9782206307909/3/META-INF/interactives.json';
const file = {
	baseURLrl: 'https://storage.libmanuels.fr/Delagrave/specimen/9782206307909/3/OEBPS/'
}
axios.get(jsonData, {})
	.then((res) => {
		let page = res.data.pages.page;
		let pageIterator = page.values();
		let result = pageIterator.next();

		while (!result.done) {
			let src = result.value.attributes.src;
			wkhtmltopdf(`${file.baseURLrl}${src}`, {
				output: `download/9782206307909/${src.substring(0, src.length - 5)}pdf`,
				"s": "A3"
			});
			result = pageIterator.next();
		}
	})

