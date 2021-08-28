const crypto = require('crypto');
module.exports = {
	lib:{
		randomStr:randomStr,
		sign:sign,
		sign256:sign256,
		sign256Xml:sign256Xml,
		signXml:signXml,
        getsha256:getsha256,
        getMd5Str:getMd5Str
	}
};
function randomStr(){
	return getMd5Str(new Date().toISOString()+ Math.random())
}
function getsha256(key,StringToSign) {
	const hmac = crypto.createHmac('sha256', key);
	return hmac.update(StringToSign).digest('hex');
}
function getMd5Str(content) {
	let md5 = crypto.createHash('md5');
	md5.update(content);
	let d = md5.digest('hex'); 
	return d;
}
function sign(params,si,key) {
	let signname = "sign";
	if(si) signname = si;
	let paramarray = [];
	for (let key of Object.keys(params).sort()) {
		if(params[key] !== null){
			let p  =    (key) + "="  +  (params[key]);
			paramarray.push(p);
		}
	}
	let paramString = paramarray.join("&");
	let StringToSign=  paramString +"&key=" + key;
	let sign = getMd5Str(StringToSign).toUpperCase();
	paramString += "&sign=" + sign;
	params[signname] =sign;
	return params;
}
function sign256(params,key) {
	let signname = "sign";
	let paramarray = [];
	for (let key of Object.keys(params).sort()) {
		if(params[key] !== null){
			let p  =    (key) + "="  +  (params[key]);
			paramarray.push(p);
		}
	}
	let paramString = paramarray.join("&");
	let StringToSign=  paramString +"&key=" + key
	let sign = getsha256(key,StringToSign).toUpperCase();
	paramString += "&sign=" + sign;
	params[signname] =sign;
	return params;
}
function sign256Xml(params,key) {
	params = sign256(params,key)
	let xml = "<xml>"
	for(let k in params){
		xml += "<" + k + ">" + params[k] +"</" + k + ">"
	}
	xml += "</xml>";
	return xml;
}
function signXml(params,key) {
	params = sign(params,"sign",key)
	let xml = "<xml>"
	for(let k in params){
		xml += "<" + k + ">" + params[k] +"</" + k + ">"
	}
	xml += "</xml>";
	return xml;
}