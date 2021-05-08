'use strict';
const util = require('util');
const execSync = require('child_process').execSync;
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const https = require('https');
const {exists, writeFileSync,writeFile} = require("fs");
const fetch = require('node-fetch');
const HttpProxyAgent = require('http-proxy-agent');
const url = require('url');

const jsonUrl = 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/META-INF/interactives.json';
const file = {
	baseUrl: 'https://storage.libmanuels.fr/Delagrave/specimen/9782206309071/1/OEBPS/'
}


async function main() {
	const stylesUrls = await getCssStyleUrl(file.baseUrl, getPagesInfos);
	stylesUrls.forEach((elm,index)=>{
	 	cssAutoprefixerOutput(elm,index);
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

async function getCssStyleUrl(cssBaseUrl, callback) {
	//const page = await getPagesInfos(jsonUrl);
	const page = await callback(jsonUrl);
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

function pageSrcRefs(page) {
	return page.map(({attributes}) => attributes.src);
}

function getCssRef(srcRefs) {
	const regex = /[^0-9]/g;
	return srcRefs.map(elm => {
		return elm.split('.')[0].replace(regex, '');
	})
}


async function cssAutoprefixerOutput(cssUrl,index) {

	const pURL = new URL(cssUrl);

	const options={
		host:pURL.host,
		port:443,
		path:pURL.href,
		method: 'GET',
		headers: {
			Host: pURL.hostname
		}
	}

	const response = await fetch(cssUrl,options);

	//console.log(response.headers);
	//process.exit()

	let data = await response.text();

	setTimeout(()=>{},3000);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	postcss([
		autoprefixer({overrideBrowserslist: ['last 1 version']})])
		.process(data, {
			from: undefined
		})
		.then(result => {
			try {
				writeFile(`css/${index}.css`, result.css, ()=>{});
				console.log("css processing done!");
			} catch (e) {
				console.log(e)
			}
		})
		.catch(err => console.log('failed to load style'));
}




main().catch(err=>console.log(err));