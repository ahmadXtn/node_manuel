const axios = require('axios').default;




async function getSrcPages(){
	return await axios.get('https://storage.libmanuels.fr/Delagrave/specimen/9782206307909/3/META-INF/interactives.json')
		.then(res => res.data)
		.then(object => object.pages)
		.then(pages => pages.page)
		.then(page => {
			let src = [];
			page.forEach(elm => src.push(elm.attributes.src));
			return src;
		});
}


module.exports = getSrcPages();