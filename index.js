'use strict';
const util = require('util');
const execSync = require('child_process').execSync;
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const https = require('https');
const {exists, writeFileSync} = require("fs");


const file = {
	htmlBaseUrl: 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/OEBPS/',
	cssBaseUrl: 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/OEBPS/css/'
}
const options = new URL('https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/META-INF/interactives.json');

let targetCss = path.resolve(`css/out.css`)


https.get(options, (resp) => {
	let data = '';
	// A chunk of data has been received.
	resp.on('data', (chunk) => {
		data += chunk.toString();
	});
	// The whole response has been received. Print out the result.
	resp.on('end', () => {
		let pages = JSON.parse(data).pages;
		let page = pages.page;
		let pageIterator = page.values();
		let result = pageIterator.next();
		for (let elm of page) {
			let src = elm.attributes.src;
			let styleRef = src.split('.')[0].replace(/[^0-9]/g, '');
			let cssTargetUrl = `${file.cssBaseUrl}Styles${styleRef}.css`;

			if (styleRef === "") {
				styleRef = "cover"
				cssTargetUrl = `${file.cssBaseUrl}${styleRef}.css`;
			}
			getStyleSheet(cssTargetUrl, styleRef, src);

		}
		/*
		while (!result.done) {
			let src = result.value.attributes.src;
			let styleRef = src.split('.')[0].replace(/[^0-9]/g, '');
			let targetUrl = `${file.cssBaseUrl}Styles${styleRef}.css`;

			if (styleRef === "") {
				styleRef = "cover"
				targetUrl = `${file.cssBaseUrl}${styleRef}.css`;
			}


			result = pageIterator.next();
		}*/
	});
}).on("error", (err) => {
	console.log("Error: de" + err.message);
});

 function getStyleSheet(url, styleRef, src) {
	const options = new URL(url);
	const cssPath = path.resolve(`css/${styleRef}.css`);
	let htmlTargetUrl = `${file.htmlBaseUrl}${src}`;

	https.get(options, (resp) => {
		let data = '';
		// A chunk of data has been received.
		resp.on('data', (chunk) => {
			data += chunk.toString();
		});
		// The whole response has been received. Print out the result.
		resp.on('end', async (path, callback) => {
			await postcss([
				autoprefixer({overrideBrowserslist: ['last 1 version']})])
				.process(data, {
					from: undefined
				})
				.then(result => {
					try {
						writeFileSync(`css/${styleRef}.css`, result.css, {});
					}catch (e){console.log(e)}
					console.log("css processing done!");
					//execSync(`wkhtmltopdf --user-style-sheet ${cssPath}  -s A3  ${htmlTargetUrl} download/9782206307909/${styleRef}.pdf`);
				})
				.catch(err => console.log('failed to load style'));
		});
	}).on("error", (err) => {
		console.log("Error: de" + err.message);
	});

}



async function processCss(cssUrl) {

}

