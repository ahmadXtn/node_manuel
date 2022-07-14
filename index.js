'use strict';

const execSync = require('child_process').execSync;
const https = require('https');
const path = require('path');
const {writeFile} = require("fs");
const fetch = require('node-fetch');
const fs = require('fs');
const mkdirp = require('mkdirp');
const utf8 = require('utf8');

const inquirer = require('inquirer')


const rootPath = path.resolve(__dirname);

inquirer
	.prompt([
		{
			name: 'json',
			message: 'Enter Book ead_id:\n',
		},
	])

	//https://exobank.hachette-livre.fr/contents/final/9782216166626-fxl/OEBPS/page1.xhtml
	.then(answers => {
		const jsonUrl = new URL(`https://educadhoc.hachette-livre.fr/api/extract/${answers.json}/complet.json`);
		const sPathName = jsonUrl.pathname.split('/');
		const eanId = sPathName[3];
		const eanVersion = sPathName[4];
		const editor = sPathName[1];


		const targetJsonUrl = ``;
		const basUrls = {xhtmlUrl: ``}


		let nBook = {
			'url': jsonUrl.href,
			getBookInfo: async function () {
				const response = await fetch(this.url, {
					"headers": {
						"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
						"accept-language": "en-US,en;q=0.9",
						"sec-fetch-dest": "document",
						"sec-fetch-mode": "navigate",
						"sec-fetch-site": "none",
						"sec-fetch-user": "?1",
						"sec-gpc": "1",
						"upgrade-insecure-requests": "1"
					},
					"referrerPolicy": "strict-origin-when-cross-origin",
					"body": null,
					"method": "GET",
					"mode": "cors"
				});
				return await response.json();
			},
			bookInfo: async function () {
				const dataInfo = await this.getBookInfo();
				return {
					'id': dataInfo.id,
					'ean': dataInfo.ean,
					'title': dataInfo.title,
					'editor': dataInfo.editor,
					'pages_count': dataInfo.pages_count,
					'ratio': dataInfo.ratio,
					'textbook_type': dataInfo.textbook_type,
					'alternatives': dataInfo.alternatives,
					'summary_url': dataInfo.summary_url,
					'resources_url': dataInfo.resources_url,
					'cover': dataInfo.cover,
				};
			},
			getBookData: async function () {
				const book_info = await this.bookInfo();
				const book_id = await book_info.id;
				const response = await fetch(`https://educadhoc.hachette-livre.fr/api/book-data.json?book_id=${book_id}&book_type=extract`, {
					"headers": {
						"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
						"accept-language": "en-US,en;q=0.9",
						"cache-control": "max-age=0",
						"if-none-match": "\"be50ed4ec56ae63f954d65d6ae1dce6e-gzip\"",
						"sec-fetch-dest": "document",
						"sec-fetch-mode": "navigate",
						"sec-fetch-site": "none",
						"sec-fetch-user": "?1",
						"sec-gpc": "1",
						"upgrade-insecure-requests": "1",
						"cookie": "XSRF-TOKEN=P3FY1mg6hLmj1xx0mGItd4C3%2Fw5IgKtazwT8eE2TZTs%3D; _session_id=dfdc3e3db8809ccb2b04dd6f91122315"
					},
					"referrerPolicy": "strict-origin-when-cross-origin",
					"body": null,
					"method": "GET",
					"mode": "cors"
				});
				return await response.json();
			},
			bookData: async function () {
				const dataInfo = await this.getBookData();
				return {
					'data': dataInfo,
					'pages': dataInfo.pages,
					'preview_dimensions': dataInfo.preview_dimensions
				};
			},
			createHtmlTargetUrls: async function () {
				const book_info = await this.bookInfo();
				const pages_count = await book_info.pages_count;
				const bookData = await this.bookData();

				const pagesRef = Object.values(bookData.pages);

				const baseUrl = `https://exobank.hachette-livre.fr/contents/final/${book_info.ean}-fxl/OEBPS/`;

				const htmlUrls = pagesRef.slice(0, pages_count + 1).map((elm, index) => {
					return `${baseUrl}${elm}`;
				});

				const resourceUrls = pagesRef.slice(-(pagesRef.length - (pages_count + 1))).map((elm, index) => {
					return `${baseUrl}${elm}`;
				});

				return {
					"htmlUrls": htmlUrls,
					"resourceUrls": resourceUrls
				}

			},
			startDownload: async function () {
				const response = await this.createHtmlTargetUrls();
				const book_info = await this.bookInfo();
				const bookData = await this.bookData();
				const editor =await book_info.editor;
				const eandId = await book_info.ean;

				const [pgW,pgH] = await bookData.preview_dimensions['1'];

				const htmlUrls = response.htmlUrls;

				const pgHeightOption =`--page-height ${pgH}`;
				const pgWidthOption =`--page-height ${pgW}`;

				//${pgHeightOption} ${pgWidthOption}
				console.log(editor);

				mkdirp(`download/${eandId}`).then(made => {
					htmlUrls.forEach((elm, index) => {
						// --page-height 175 --page-width 131
						switch (editor.toLowerCase()) {
							case 'didier':
								execSync(`wkhtmltopdf --print-media-type ${elm}  download/${eanId}/${index}.pdf`);
								break;
							case 'foucher':
								execSync(`wkhtmltopdf --page-height ${pgH} --page-width ${pgW}  --print-media-type ${elm}  download/${eanId}/${index}.pdf`);
								break;
							case 'hachette-education':
								execSync(`wkhtmltopdf --page-height ${pgH} --page-width ${pgW} --load-media-error-handling skip --print-media-type ${elm}  download/${eanId}/${index}.pdf`);
								break;
							case 'hatier':
								execSync(`wkhtmltopdf  --print-media-type ${elm}  download/${eanId}/${index}.pdf`);
								break;
							case 'istra':
								break;
							default:
								console.log(`Sorry, we are out of ${editor}.`);
						}
					})
				})

			}
		}


		async function main() {
			const data = await nBook.startDownload();
		}

		main();

// main().catch(err => console.log(err));

	})
;


/**
 * complet.json https://educadhoc.hachette-livre.fr/api/extract/9782857088295/complet.json
 * Book_data https://educadhoc.hachette-livre.fr/api/book-data.json?book_id=6057&book_type=extract
 */




