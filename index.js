'use strict';
const util = require('util');
const execSync = require('child_process').execSync;
const exec = util.promisify(require('child_process').exec);
const axios = require('axios').default;
const path=require('path');


const jsonData = 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/META-INF/interactives.json';
const file = {
	baseURLrl: 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/OEBPS/'
}


const customStyleSheet = path.resolve('css/custom.css');


axios.get(jsonData, {})
	.then((res) => {
		let page = res.data.pages.page;
		let pageIterator = page.values();
		let result = pageIterator.next();

		while (!result.done) {
			let src = result.value.attributes.src;
			execSync(`wkhtmltopdf --user-style-sheet ${customStyleSheet} --no-stop-slow-scripts -s A3  ${file.baseURLrl}${src} download/9782206307909/${src.substring(0, src.length - 5)}pdf`);
			/**
			 * High Memory Usage
			 * Multiple wkhtmltopdf instance Running Simultaneously
			 * fast downloading
			const { stdout, stderr } =  exec(`wkhtmltopdf --page-size A3  ${file.baseURLrl}${src} download/9782206307909/${src.substring(0, src.length - 5)}pdf`);
			 */
			result = pageIterator.next();
		}
	});





