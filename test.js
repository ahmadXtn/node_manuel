'use strict';

const execSync = require('child_process').execSync;
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const https = require('https');
const {writeFile} = require("fs");
const fetch = require('node-fetch');
const fs = require('fs');
const inquirer = require('inquirer')
const path = require("path");


inquirer
	.prompt([
		{
			name: 'id',
			message: 'Enter Book EanId:',
		},
	])
	.then(answers => {

			const eanId = answers.id;

			const file = {
				baseUrl: `https://educadhoc.hachette-livre.fr/extract/complet/${answers.id}/show-page/`,
				bookInfo: `https://educadhoc.hachette-livre.fr/api/extract/${eanId}/complet.json`,
				bookData: `https://educadhoc.hachette-livre.fr/api/book-data.json?book_id=5886&book_type=extract`
			}

			async function main() {
				const pages_count = (await getBookInfo(file.bookInfo)).page_count;
				const book_title = (await getBookInfo(file.bookInfo)).title;
				const htmlUrls = await getHtmlUrls(pages_count);

				startDownload(htmlUrls, book_title);

			}

			async function getBookData() {
				const book_info = await getBookInfo(file.bookInfo);
				const bookData = `https://educadhoc.hachette-livre.fr/api/book-data.json?book_id=${book_info.bookId}&book_type=extract`;

				let response = await fetch(bookData);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return await response.json();
			}

			async function getHtmlUrls(pages_count) {
				const bookData = await getBookData();
				const pageRef = await Object.values(bookData.pages);
				const targetPagesRef = pageRef.slice(0, pages_count);

				//console.dir(targetPagesRef, {'maxArrayLength': null});

				return targetPagesRef.map(ref => {
					return `${file.baseUrl}${ref}`;
				})

			}

			async function getBookInfo(bookInfoUrl) {

				let bookInfo;

				let response = await fetch(bookInfoUrl);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				bookInfo = await response.json();

				return {
					'bookId': bookInfo.id,
					'title': bookInfo.title,
					'page_count': bookInfo['pages_count'],
					'discipline': bookInfo.discipline,
					'editor': bookInfo.editor
				}
			}


			function startDownload(targetUrls, title) {
				if (!(fs.existsSync(`download/mesmanuels_v/${eanId}`))) {
					fs.mkdir(`download/mesmanuels_v/${eanId}`, {}, (err) => {
						if (!err) console.log("PDF folder created");
						targetUrls.forEach((elm, index) => {
							execSync(`wkhtmltopdf  --page-height 175mm --page-width 125mm  ${targetUrls[index]} download/mesmanuels_v/${eanId}/${index}.pdf`);
							//execSync(`wkhtmltopdf --user-style-sheet download/mesmanuels_v/css/${eanId}/ENE.css --page-height 175mm --page-width 125mm  ${targetUrls[index]} download/mesmanuels_v/${eanId}/${index}.pdf`);
						});
					});
				} else {
					console.log("folder exist");
				}
			}

			async function downloadCss() {


				if (!(fs.existsSync(`download/mesmanuels_v/css/${eanId}`))) {
					fs.mkdir(`download/mesmanuels_v/css/${eanId}`, {}, (err) => {
						if (!err) console.log("PDF folder created");
					});
				}


				const cssBaseUrl = `https://educadhoc.hachette-livre.fr/extracts/complet/${eanId}/OEBPS/css/ENE.css`;
				const result = await fetch(cssBaseUrl);
				const data = await result.text();

				console.log(path.resolve(`download/mesmanuels_v/css/${eanId}/ENE.css`));

				process.exit();

				writeFile(`download/mesmanuels_v/css/${eanId}/ENE.css`, data, {}, () => {
					console.log("css processing done!");
				});

			}


			main().catch(err => console.log(err));

		}
	);









