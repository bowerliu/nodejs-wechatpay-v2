const {WechatPay } = require('nodejs-wechatpay')
const {WechatPayPartner } = require('nodejs-wechatpay')
let wxpayPartner = new WechatPayPartner( {
	appid:'', //主商户对应的appid
	mch_id:'',//主商户号
	sub_appid:null, //子商户号对应的appid 可以传null
	sub_mch_id:'',//子商户号
	key:'',//主商户号对应的key
	notify_url:"",//回调地址 须公网可访问
    ip:'',//发起请求的ip 
    cert:'',//  apiclient_cert.p12 文件路径;
    profit_sharing:'N' ,//默认不分账,
    debug:true
});


wxpayPartner.unifiedorder({ //统一下单
    money:100,//支付金额 单位:元
    openid:"xxxxxx",//必传
    body:"",//支付文字内容
    out_trade_no:"xxx",//32位 不传会随机生成 建议自行维护
    trade_type:"NATIVE",//可以不传 默认为 JSAPI 
    notify_url:"可以不传",//不传则为实例上的notify_url
    success:function(r){console.log(r)},//成功回调，可以为空
    fall:function(r){console.log(r)},//失败回调，可以为空
    complete:function(r){console.log(r)}// 完成回调 不管成功失败都会调用，可以为空
})

// wxpayPartner.pay 为 wxpayPartner.unifiedorder 别名
wxpayPartner.pay({ //适用于公众号 小程序支付
	body:'买一个',
	money: 10,
	openid:'ortoKwa920J3j0rQo0z_aqJOd_F4',
    success:function(r){
        //JSAPI返回值示例
        r == {
            return_code: 'SUCCESS',
            return_msg: 'OK',
            result_code: 'SUCCESS',
            mch_id: 'xxxxx',
            appid: 'xxxxx',
            sub_mch_id: '147xxxxx3202602',
            nonce_str: 'gx2OFxAimo8zVSlM',
            sign: 'F176617F873BE2F4D25D292FA85C749A',
            prepay_id: 'wx241524234819671fa78f8ab6cd0e050000',
            trade_type: 'JSAPI',
            jsapi_sign: { //只有在success函数中会对api进行paysign签名 可以直接在公众号小程序中使用
              timeStamp: '1629789863',
              nonceStr: '9552795855f189d6a96773323c8d4d29',
              package: 'prepay_id=wx241524234819671fa78f8ab6cd0e050000',
              signType: 'MD5',
              paySign: '33495814BEE8BF0F695E4C0C7C1DBC41',
              out_trade_no: '6c331f639d49c4bcbd81f45b574d1415'
            }
          }
    }
})
//二维码支付
wxpayPartner.payNative({ // payNative 是 unifiedorder({trade_type:"NATIVE"}) 简写
	body:'买一个',
	money: 10,
	openid:'ortoKwa920J3j0rQo0z_aqJOd_F4',
    success:function(r){
        //JSAPI返回值示例
        r == {
            return_code: 'SUCCESS',
            return_msg: 'OK',
            result_code: 'SUCCESS',
            mch_id: 'xxxxx',
            appid: 'xxxxxxxxxxx',
            sub_mch_id: 'xxxxxxx',
            nonce_str: 'ecezq8fFRjAx1YuM',
            sign: 'A50E77ECD9D8C413FC4CBFE6332ABBDE',
            prepay_id: 'wx24155740491366bcc45e81063590060000',
            trade_type: 'NATIVE',
            code_url: 'weixin://wxpay/bizpayurl?pr=eE2yFA7zz' //此为二维码url
          }
    }
})