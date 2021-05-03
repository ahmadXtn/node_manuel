const srcList = require('./utils/srcPages');
const html_to_pdf = require('html-pdf-node');
const fs = require('fs');
const util = require('util');
const path = require("path");

const exec = util.promisify(require('child_process').exec);
const file = {url: "https://storage.libmanuels.fr/Delagrave/specimen/9782206307909/3/OEBPS/page044.xhtml"};





html_to_pdf.generatePdf(file,
	{width: '2048', height: '2048'})
	.then(pdfBuffer => {
		console.log("PDF Buffer:-", pdfBuffer);
		fs.writeFileSync("download/html_to_pdf_output.pdf", pdfBuffer);
	});




async function lsExample() {
	const { stdout, stderr } = await exec(`wkhtmltopdf ${file.url} wkhtmltopdf_output.pdf`,{
		cwd:path.resolve('download')
	});
	console.log('stdout:', stdout);
	console.error('stderr:', stderr);
}
lsExample();