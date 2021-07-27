"use strict"
/**
 * @desc A simple library based on the WeChat API that supports getting permission signatures on Node.js.
 * @author Allen liu
 */
const crypto = require('crypto')
const cache = require('secure-cache')
const request = require('flexible-axios')
const _api = 'https://api.weixin.qq.com/cgi-bin/'//WeChat API

class weChatJSSDK {
    //初始化微信相关账号信息
    constructor(appId, appSecret) {
        this._appId = appId
        this._appSecret = appSecret
    }
    async getSignPackage(ctx) {
        const jsapiTicket = await this.getJsapiTicket()
        const nonceStr = this.createNonceStr()
        const timeStamp = Math.floor((new Date()).getTime() / 1000)
        const scheme = ctx.request.headers['x-forwarded-proto'] ? ctx.request.headers['x-forwarded-proto'] : 'http'
        const url = scheme + '://' + ctx.host + ctx.url

        //这里参数的顺序要按照 key 值 ASCII 码升序排序
        let str = 'jsapi_ticket=' + jsapiTicket
            + '&noncestr=' + nonceStr
            + '&timestamp=' + timeStamp
            + '&url=' + url
        const signature = crypto.createHash('sha1').update(str).digest('hex')
        let data = {
            appId: this._appId,
            timestamp: timeStamp,
            url: url,
            nonceStr: nonceStr,
            jsapiTicket: jsapiTicket,
            signature: signature,
        }
        return data
    }
    //获取JS-SDK权限通行证
    async getJsapiTicket() {
        let jsapiTicket = cache.get('jsapiTicket')
        //jssdk通行证过期
        if (!jsapiTicket) {
            let accessToken = await this.getAccessToken()
            const url = _api + 'ticket/getticket?'
                + 'access_token=' + accessToken
                + '&type=jsapi'
            const data = await request.get(url)
            if (data && data.errcode == 0) {
                jsapiTicket = data.ticket
                //写入缓存，2小时刷新
                cache.set('jsapiTicket', jsapiTicket, 1000 * 7200)
            }
        }
        return jsapiTicket
    }
    //获取许可口令
    async getAccessToken() {
        let accessToken = cache.get('accessToken')
        //token过期
        if (!accessToken) {
            const url = _api + 'token?grant_type=client_credential'
                + '&appid=' + this._appId
                + '&secret=' + this._appSecret
            const data = await request.get(url)
            if (data) {
                accessToken = data.access_token
                //写入缓存，2小时刷新
                cache.set('accessToken', accessToken, 1000 * 7200)
            }
        }
        return accessToken
    }
    //获取随机字符串
    createNonceStr(length = 16) {
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let str = '', index
        for (let i = 0; i < length; i++) {
            index = Math.floor(Math.random() * chars.length)
            str += chars.charAt(index)
        }
        return str;
    }
}
module.exports = weChatJSSDK
