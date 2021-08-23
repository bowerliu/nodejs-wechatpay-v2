const lib =  require("./paylib.js").lib
const request = require("request");
const  {
	sign,
	sign256Xml,
	signXml,
	randomStr,
} = lib
const fs = require('fs');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true});
class WechatPayPartner {
	constructor(opt){
		this.appid = opt.appid;
		this.mch_id = opt.mch_id;
		this.key = opt.key;
		this.sub_appid = opt.sub_appid;
		this.sub_mch_id = opt.sub_mch_id;
		this.notify_url = opt.notify_url;
		this.profit_sharing = opt.profit_sharing || 'N' //默认不分账
		this.cert = fs.readFileSync(opt.cert); //fs.readFileSync( '/apiclient_cert.p12');
		this.ip = opt.ip || "8.8.8.8",
		this.debug = opt.debug || false;
	};
	setDebug(debug){
		this.debug = debug;
	}
	setOptions(opt){
		for(let key in opt){
			this[key] = opt[key]
		}
	}
	pay(opt,success,complete){
		let url = "https://api.mch.weixin.qq.com/pay/unifiedorder";	
		let out_trade_no = opt.out_trade_no || randomStr();
		let {body,openid,notify_url} = opt;
		let money =  parseInt(opt.money * 100);
		let nonce_str = randomStr();
		let params ={
			appid: this.appid,
			mch_id:this.mch_id,
			sub_mch_id:this.sub_mch_id,
			nonce_str:nonce_str,
			sign_type:"MD5",
			body:body,
			out_trade_no:out_trade_no,
			total_fee:money,
			spbill_create_ip:this.ip,
			notify_url: notify_url || this.notify_url,
			trade_type:"JSAPI",
			profit_sharing:this.profit_sharing
		}
		if(this.sub_appid){
			params.sub_appid = this.sub_appid;
			params.sub_openid = openid;
		}else{
			params.openid = openid;
		}
		let xml = signXml(params,this.key)
		let appid = this.appid;
		if(this.sub_appid){
			appid = this.sub_appid;
		}
		let {fall} = opt;
		if(!complete) complete = opt.complete;
		if(!success) success = opt.success;
		let key = this.key
		function paySign(xml){
			let r =  xml;
			let params = {
				'timeStamp': parseInt(new Date().getTime()/1000).toString() ,
				'nonceStr': randomStr(),
				'package': "prepay_id=" + r.prepay_id,
				'signType': 'MD5',
				'appId':appid
				}
			params = sign(params,"paySign",key);
			delete params['appId'];
			params.out_trade_no = out_trade_no;
			r.jsapi_sign =  params;
			success(r);//send
		}
		this.doTheReq(url,xml,paySign,fall,complete);
	}
	payNative(opt,complete){
		let url = "https://api.mch.weixin.qq.com/pay/unifiedorder";	
		let out_trade_no = opt.out_trade_no || randomStr();
		let {body,notify_url} = opt;
		let money =  parseInt(opt.money * 100);
		let nonce_str = randomStr();
		let params ={
			appid: this.appid,
			mch_id:this.mch_id,
			sub_mch_id:this.sub_mch_id,
			nonce_str:nonce_str,
			sign_type:"MD5",
			body:body,
			out_trade_no:out_trade_no,
			total_fee:money,
			spbill_create_ip:this.ip,
			notify_url: notify_url || this.notify_url,
			trade_type:"NATIVE",
			profit_sharing:this.profit_sharing
		}
		let appid = this.appid;
		if(this.sub_appid){
			appid = this.sub_appid;
			params.sub_appid = this.sub_appid
		}
		let xml = signXml(params,this.key);
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete);
	}
	doTheReq(url,xml,success,fall,complete){
		let option = {
			url: url,
			method: "POST",
			body: xml,
			agentOptions: {
				pfx: this.cert,
				passphrase: this.mch_id
			}
		}
		if(this.debug) console.log('request sending:',xml);
		request(option,function(err,req,body){ 
			if(this.debug) console.log('request return:',body);
			xmlParser.parseString(body, function (err, result) {
				if(!result){
					if(success) success(body);
					if(complete) complete(body);
					return;
				}
				let result_code = result && result.xml && result.xml.result_code  
				let return_code = result && result.xml && result.xml.return_code  
				if( return_code == 'FAIL' || result_code  == 'FAIL'){
					if(fall) fall(result.xml);
				}else{
					if(success) success(result.xml);
				}
				if(complete) complete(result.xml);
			});
		});
	}
	micropay(opt,complete){
/*  收银员使用扫码设备读取微信用户付款码以后，二维码或条码信息会传送至商户收银台，由商户收银台或者商户后台调用该接口发起支付。
    提醒1：提交支付请求后微信会同步返回支付结果。当返回结果为“系统错误”时，商户系统等待5秒后调用【查询订单API】，查询支付实际交易结果；当返回结果为“USERPAYING”时，
	商户系统可设置间隔时间(建议10秒)重新查询支付结果，直到支付成功或超时(建议45秒)；
    提醒2：在调用查询接口返回后，如果交易状况不明晰，请调用【撤销订单API】，此时如果交易失败则关闭订单，该单不能再支付成功；如果交易成功，则将扣款退回到用户账户。
	当撤销无返回或错误时，请再次调用。注意：请勿调用扣款后立即调用【撤销订单API】，建议至少15s后再调用。撤销订单API需要双向证书。*/
		let url = 'https://api.mch.weixin.qq.com/pay/micropay'
		let out_trade_no = opt.out_trade_no || randomStr();
		let auth_code = opt.auth_code;
		let body = opt.body || randomStr();
		let money =  parseInt(opt.money * 100);
		let nonce_str = randomStr();
		let params ={
			appid: this.appid,
			mch_id:this.mch_id,
			sub_appid:this.sub_appid,
			sub_mch_id:this.sub_mch_id,
			nonce_str:nonce_str,
			sign_type:"MD5",
			body:body,
			out_trade_no:out_trade_no,
			total_fee:money,
			spbill_create_ip:this.ip,
			notify_url:this.notify_url,
			auth_code:auth_code,
			profit_sharing:this.profit_sharing
		}
		let xml = signXml(params,this.key);
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	sendredpack(opt,complete){
		let url = "https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack";
		let nonce_str = randomStr();
		let {openid,money,out_trade_no,msg} = opt;
		let params ={
			wxappid: this.appid,
			msgappid:this.sub_appid,
			consume_mch_id:this.sub_mch_id,
			mch_id:this.mch_id,
			sub_mch_id:this.sub_mch_id,
			nonce_str:nonce_str,
			mch_billno:out_trade_no.substr(0,28),
			send_name:msg,
			re_openid:openid,
			act_name:"hello",
			remark:"woowow",
			total_amount:money,
			total_num:1,
			wishing:"hello world",
			client_ip:this.ip,
		}
		let xml = signXml(params,this.key);
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	orderquery(opt,complete){
		let {out_trade_no,transaction_id} = opt;
		let url = "https://api.mch.weixin.qq.com/pay/orderquery";
		let nonce_str = randomStr();
		let params ={
			appid:this.appid,
			mch_id:this.mch_id,
			sub_appid:this.sub_appid,
			sub_mch_id:this.sub_mch_id,
			nonce_str:nonce_str,
		}
		if(out_trade_no){
			params.out_trade_no =out_trade_no
		}
		if(transaction_id){
			params.transaction_id =transaction_id
		}
		let xml = signXml(params,this.key)
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	closeorder(opt,complete){
		let url = "https://api.mch.weixin.qq.com/pay/closeorder";
		let out_trade_no = opt.out_trade_no;
		let nonce_str = randomStr();
		let params ={
			appid:this.appid,
			mch_id:this.mch_id,
			sub_appid:this.sub_appid,
			sub_mch_id:this.sub_mch_id,
			nonce_str:nonce_str,
		}
		if(out_trade_no){
			params.out_trade_no =out_trade_no
		}
		let xml = signXml(params,this.key)
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	downloadBill(opt,complete){
		let url = "https://api.mch.weixin.qq.com/pay/downloadbill";
		let nonce_str = randomStr();
		let billdate = opt.billdate;
		let params ={
			appid:this.appid,
			sub_appid:this.sub_appid,
			mch_id:this.mch_id,
			sub_mch_id:this.sub_mch_id,
			nonce_str:nonce_str,
			sign_type:"HMAC-SHA256",
			bill_date:billdate,
			bill_type:"ALL"
		}
		let xml =  sign256Xml(params,this.key);
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	profitsharingaddreceiver(opt,complete){//添加分账接收方
		let that = this;
		let {account } = opt
		let url = `https://api.mch.weixin.qq.com/pay/profitsharingaddreceiver`;
		let nonce_str = randomStr();
		let receiver = {
			type:'PERSONAL_OPENID',
			account:account,
			relation_type:'DISTRIBUTOR'
		}
		receiver = JSON.stringify(receiver)
		let params ={
			appid:that.appid,
			mch_id:that.mch_id,
			sub_mch_id:that.sub_mch_id,
			nonce_str:nonce_str,
			receiver:receiver
		}
		let xml =  sign256Xml(params,this.key);
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	profitsharingremovereceiver(opt,complete){//remove分账接收方
		let that = this;
		let { account} = opt
		let url = `https://api.mch.weixin.qq.com/pay/profitsharingremovereceiver`;
		let nonce_str = randomStr();
		let receiver = {
			type:'PERSONAL_OPENID',
			account:account,
			relation_type:'DISTRIBUTOR'
		}
		receiver = JSON.stringify(receiver)
		let params ={
			appid:that.appid,
			mch_id:that.mch_id,
			sub_mch_id:that.sub_mch_id,
			nonce_str:nonce_str,
			receiver:receiver
		}
		let xml =  sign256Xml(params,that.key)
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	profitsharingfinish(opt,complete){// 
		let that = this;
		let { transaction_id} = opt
		let url = `https://api.mch.weixin.qq.com/secapi/pay/profitsharingfinish`;
		let nonce_str = randomStr();
		let out_order_no = randomStr();
		let description = '分账已完成';
 		let params ={
			appid:that.appid,
			mch_id:that.mch_id,
			sub_mch_id:that.sub_mch_id,
			transaction_id:transaction_id,
			nonce_str:nonce_str,
			out_order_no:out_order_no,
			description:description
		}
		let xml =  sign256Xml(params,that.key)
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
	profitsharing(opt,complete){//
		let that = this;
		let { receivers,transaction_id} = opt
		let url = `https://api.mch.weixin.qq.com/secapi/pay/profitsharing`;
		let nonce_str = randomStr();
		let out_order_no = randomStr();
		// let receivers = 	[{
		// 	"type": "PERSONAL_OPENID",
		// 	"account":"o_FDOs_NZDWQMSeFnHkmEflQdD04",
		// 	"amount":1,
		// 	"description": "分到个人"
		// }]
		receivers = JSON.stringify(receivers)
		let params ={
			appid:that.appid,
			mch_id:that.mch_id,
			sub_mch_id:that.sub_mch_id,
			transaction_id:transaction_id,
			nonce_str:nonce_str,
			out_order_no:out_order_no,
			receivers:receivers
		}
		let xml =  sign256Xml(params,that.key)
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
		
	}
	refund(opt,complete){
		let url = `https://api.mch.weixin.qq.com/secapi/pay/refund`;
		let {total_fee,refund_fee,refund_desc,out_trade_no} = opt;
		let that = this;
		let nonce_str = randomStr();
		let out_refund_no = randomStr();
		let params ={
			appid:that.appid,
			mch_id:that.mch_id,
			sub_mch_id:that.sub_mch_id,
			nonce_str:nonce_str,
			out_trade_no:out_trade_no,
			out_refund_no:out_refund_no,
			total_fee:total_fee,
			refund_fee:refund_fee,
			refund_desc:refund_desc,
			notify_url:notify_url||"http://shop.dplus.tech/ws/wxrefundcb",
		}
		let xml = signXml(params,this.key)
		let {success,fall} = opt;
		if(!complete) complete = opt.complete;
		this.doTheReq(url,xml,success,fall,complete)
	}
}
module.exports = WechatPayPartner
