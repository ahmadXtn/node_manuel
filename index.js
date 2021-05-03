const srcList = require('./utils/srcPages');
const html_to_pdf = require('html-pdf-node');
const fs = require('fs');







const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function lsExample() {
	const { stdout, stderr } = await exec('wkhtmltopdf https://storage.libmanuels.fr/Delagrave/specimen/9782206307909/3/OEBPS/page044.xhtml out.pdf');
	console.log('stdout:', stdout);
	console.error('stderr:', stderr);
}
lsExample();