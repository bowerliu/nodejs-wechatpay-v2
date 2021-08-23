const {WechatPay }= require('../index')
const {WechatPayPartner }= require('../index')
 
let wxp = new WechatPayPartner( {
	appid:'', //主商户对应的appid
	mch_id:'',//主商户号
	sub_appid:null, //子商户号对应的appid 可以传null
	sub_mch_id:'',//子商户号
	key:'',//主商户号对应的key
	notify_url:"",//回调地址 须公网可访问
    ip:'',//发起请求的ip 
    cert:'',//  apiclient_cert.p12 文件路径;
    profit_sharing:'N' //默认不分账
});
