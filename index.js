'use strict';

const execSync = require('child_process').execSync;
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const https = require('https');
const {writeFile} = require("fs");
const fetch = require('node-fetch');
const fs = require('fs');
const inquirer = require('inquirer')


inquirer
	.prompt([
		{
			name: 'json',
			message: 'Enter Json Url',
		},
		{
			type: 'list',
			name: 'choice',
			message: 'CSS OR PDF',
			choices: ['CSS', 'PDF'],
		},
	])
	.then(answers => {
		const jsonUrl = new URL(answers.json);
		const sPathName = jsonUrl.pathname.split('/');
		const eanId = sPathName[3];
		const eanVersion = sPathName[4];
		const editor = sPathName[1];


		const targetJsonUrl = `https://storage.libmanuels.fr/${editor}/specimen/${eanId}/${eanVersion}/META-INF/interactives.json`;

		const file = {
			baseUrl: `https://storage.libmanuels.fr/${editor}/specimen/${eanId}/${eanVersion}/OEBPS/`,
		}


		async function main() {
			const stylesUrls = await getCssStyleUrl(file.baseUrl, getPagesInfos);
			const htmlUrls = await getHtmlUrls(file.baseUrl);

			if (!(fs.existsSync(`download/${eanId}`) && fs.existsSync(`css/${eanId}`))) {
				fs.mkdir(`download/${eanId}`, {}, (err) => {
					if (!err) console.log("Id folder created");
				});
				fs.mkdir(`css/${eanId}`, {}, (err) => {
					if (!err) console.log("css folder created");
				});
			}

			stylesUrls.forEach((elm, index) => {
				if (answers.choice.toLowerCase() === "css") {
					saveCssPref(elm, index);
				} else if (answers.choice.toLowerCase() === "pdf") {
					execSync(`wkhtmltopdf   --user-style-sheet css/${eanId}/${index}.css  -s A3  ${htmlUrls[index]} download/${eanId}/${index}.pdf`);
				}

			})

		}

		async function getPagesInfos(jsonUrl) {
			let data;
			let response = await fetch(jsonUrl);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			data = await response.json();
			return data.pages.page;
		}

		function pageSrcRefs(page) {
			return page.map(({attributes}) => attributes.src);
		}

		function getCssRef(srcRefs) {
			const regex = /[^0-9]/g;
			return srcRefs.map(elm => {
				return elm.split('.')[0].replace(regex, '');
			})
		}

		async function getHtmlUrls(baseUrl) {
			const page = await getPagesInfos(targetJsonUrl);
			const pageRef = pageSrcRefs(page);

			return pageRef.map(ref => {
				if (ref === "") {
					ref = "cover"
					return `${baseUrl}${ref}`
				}
				return `${baseUrl}${ref}`
			});
		}

		async function getCssStyleUrl(cssBaseUrl) {
			const page = await getPagesInfos(targetJsonUrl);
			const pageRef = pageSrcRefs(page);
			const cssRef = getCssRef(pageRef);

			return cssRef.map(ref => {
				if (ref === "") {
					ref = "cover"
					return `${cssBaseUrl}css/${ref}.css`
				}
				return `${cssBaseUrl}css/Styles${ref}.css`
			});
		}

		async function saveCssPref(cssUrl, index) {

			const httpsAgent = new https.Agent({
				keepAlive: true,
				rejectUnauthorized: false,
				strictSSL: false,
			});

			const options = {agent: httpsAgent}
			const response = await fetch(cssUrl, options);
			let data = await response.text();

			await postcss([
				autoprefixer({overrideBrowserslist: ['last 1 version']})])
				.process(data, {
					from: undefined
				})
				.then(result => {
					writeFile(`css/${eanId}/${index}.css`, result.css, {}, () => {
						console.log("css processing done!");
					});
				})
			return `css/${eanId}/${index}.css`;
		}


		main().catch(err => console.log(err));

	});







