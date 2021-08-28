# nodejs-wechatpay-v2 是什么?

一个实现了微信支付apiv2的nodejs库，包括微信支付服务商体系，2015年由作者开发并实际使用至今，一直稳定运行，封装简单，实用主义，适合新手。
核心功能一直在实际项目中运行 为了完整性添加了一些不常用的API实现，现实中并不常用，如有问题 欢迎反馈 bower.liu@gmail.com

# nodejs-wechatpay-v2 有什么主要功能？

* 微信支付服务商接口实现
* 微信支付普通商户接口实现


# 如何使用
## 安装引用

可以直接下载源码后直接引用也可以npm安装

执行命令：`npm install nodejs-wechatpay`

## 创建实例 
### 实例化服务商
```javascript
const { WechatPayPartner } = require('nodejs-wechatpay')//服务商
const wxpayPartner = new WechatPayPartner( {
	appid:'', //主商户对应的appid 必填
	mch_id:'',//主商户号 必填
	sub_appid:null, //子商户号对应的appid 可以传null
	sub_mch_id:'',//子商户号 必填
	key:'',//主商户号对应的key 必填
	notify_url:"",//支付回调地址 须公网可访问 
    ip:'',//发起请求的ip 
    cert:'',//  apiclient_cert.p12 文件路径; 必填
    profit_sharing:'N',// 是否分账 可以不传 默认不分账  ,
    debug:false // 默认false 开启会打印发送信息到console
});

```
### 实例化普通商户
```javascript
const { WechatPay } = require('nodejs-wechatpay')
const wxpay = new WechatPay( { // 普通商户
	appid:'', //商户对应的appid 必填
	mch_id:'',//商户号 必填
	key:'',//商户号对应的key 必填
	notify_url:"",//支付回调地址 须公网可访问 
    ip:'',//发起请求的ip 
    cert:'',//  apiclient_cert.p12 文件路径; 必填
    profit_sharing:'N',// 是否分账 可以不传 默认不分账  ,
    debug:false // 默认false 开启会打印发送信息到console
});

```
### 接口约定
1：方法名为微信支付api url最后单词 全部小写
如发红包接口url `https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack`
则 发红包调用方法 wxpayPartner.sendredpack()

2： 所以方法都有 success(成功回调) fall(失败回调) complete(完成回调) 
三个回调函数 自行调节

### 统一下单接口 unifiedorder
```javascript
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
```
*所以接口形式都一样，接口参数加上 success fall complete 三个回调函数 自行调节

### 例子：统一下单
   wxpayPartner.pay 为 wxpayPartner.unifiedorder 别名

```javascript
// 
wxpayPartner.pay({ //适用于公众号 小程序支付
	body:'买一个',
	money: 10,
	openid:'ortoKwa920J3j0rQo0z_aqJOd_F4',
    success:function(r){
        //JSAPI返回值示例
         {
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
})
```
**   jsapi_sign //此字段只有在success函数中会有 是对预支付prepay_id 进行paysign签名后的结果 可以直接在公众号小程序中使用


### 例子：二维码支付
 * payNative 是 unifiedorder({trade_type:"NATIVE"}) 简写
```javascript
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
``` 

### micropay 付款码支付接口
注意 需要专门此开通权限 
```javascript
 wxpayPartner.micropay({  
	money: 10,//金额 元  必传
    auth_code:auth_code,//付款码扫描结果 必传！！！
    body:'买一个',
    out_trade_no:out_trade_no,//可不传
    success:function(r){
    }
}
``` 

### sendredpack 发普通红包接口
注意 需要专门此开通权限  红包金额有一定限制
```javascript
 wxpayPartner.sendredpack({  
	money: 10,//金额 元  必传,
    total_num:total_num//红包发放总人数
    openid:"openid",// 必传！！！
    send_name:'商户名称',
    wishing:'红包祝福语',
    act_name:'活动名称',
    remark:'备注信息',
    out_trade_no:out_trade_no,//可不传
    success:function(r){
    }
}
``` 

## 订单相关
### orderquery 查询订单
### closeorder 完结订单
### refund 退款

## 下载相关
### downloadBill 下载交易账单
### downloadfundflow 下载资金账单

## 付款相关 只有普通商户才有此类接口
### transfers 企业付款 付款到微信零钱
### pay_bank 付款得到银行卡

## 红包相关
### sendredpack 发放裂变红包
### sendgroupredpack 发放裂变红包
### gethbinfo 查询红包记录

## 分账相关
### profitsharingaddreceiver  添加分账接收方
### profitsharingremovereceiver 删除分账接收方
### profitsharingfinish 完结分账
### profitsharing 请求单次分账
### multiprofitsharing 请求多次分账
### profitsharingquery 查询分账结果
### profitsharingorderamountquery 查询订单待分账金额
### profitsharingreturn 分账回退
### profitsharingreturnquery 分账回退结果查询