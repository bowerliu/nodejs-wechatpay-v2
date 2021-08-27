process.env.TZ = 'Asia/Shanghai';
const express = require('express');
const APP = express();
const bodyParser = require('body-parser'); 
require('body-parser-xml')(bodyParser);
APP.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
APP.use(bodyParser.raw()); // for parsing application/x-www-form-urlencoded
APP.use(bodyParser.xml({
	limit: '1MB',   // Reject payload bigger than 1 MB 
	xmlParseOptions: {
		normalize: true,     // Trim whitespace inside text nodes 
		normalizeTags: true, // Transform tags to lowercase 
		explicitArray: false // Only put nodes in array if >1 
	}
}));
APP.listen(3920);
APP.use("*",function (req, res, next) {
	console.log("router:",req.baseUrl,new Date());
	next();
})
APP.post('/payback', function(req, res, next){
	console.log('wxcb post',req.body);
	let x = req && req.body && req.body.xml;
	if(!x) {
		res.send('ok');
		return;
	}
	console.log(x)
	if(x.result_code == "SUCCESS" && x.return_code == 'SUCCESS'){
        // 注意微信回调会重复执行 要有应对机制
	}
	res.send(`<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`)
})
 

 