'use strict';
const util = require('util');
const execSync = util.promisify(require('child_process').execSync);
const exec = util.promisify(require('child_process').exec);
const axios = require('axios').default;
const path = require('path');
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const fs = require("fs");


const jsonUrl = 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/META-INF/interactives.json';
const file = {
	baseUrl: 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/OEBPS/',
	cssBaseUrl: 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/OEBPS/css/cover.css'
}




axios.get(jsonUrl, {})
	.then((res) => {
		let page = res.data.pages.page;
		let pageIterator = page.values();
		let result = pageIterator.next();

		while (!result.done) {
			let src = result.value.attributes.src;
			let styleRef = "Styles".concat(src.split('.')[0].replace(/[^0-9]/g, ''));
			if (styleRef === "Styles") {
				execSync(`wkhtmltopdf  -s A3  ${file.baseUrl}${src} download/9782206307909/${src.substring(0, src.length - 5)}pdf`);
			}
			axios.get(`https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/OEBPS/css/${styleRef}.css`, {})
				.then((res) => {
					postcss([
						autoprefixer({overrideBrowserslist: ['last 1 version']})])
						.process(res.data, {
							from: undefined
						})
						.then(result => {
							fs.writeFileSync(`css/${styleRef}.css`, result.css,(err)=>{
								if (err) console.log(err)
							});
							const customStyleSheet = path.resolve(`css/${styleRef}.css`);
							execSync(`wkhtmltopdf --user-style-sheet ${customStyleSheet}  -s A3  ${file.baseUrl}${src} download/9782206307909/${src.substring(0, src.length - 5)}pdf`);
						})
						.catch(err=>console.log('failed to load style'))
				});


			/**
			 * High Memory Usage
			 * Multiple wkhtmltopdf instance Running Simultaneously
			const { stdout, stderr } =  exec(`wkhtmltopdf --page-size A3  ${file.baseURLrl}${src} download/9782206307909/${src.substring(0, src.length - 5)}pdf`);
			 */
			result = pageIterator.next();
		}

	});


function getJsonData() {
	return axios.get(jsonUrl);
}

