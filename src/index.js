"use strict"
/**
 * @desc A simple library based on the WeChat API that supports getting permission signatures on Node.js.
 * @author Allen liu
 */
const crypto = require('crypto')
const cache = require('secure-cache')
const request = require('flexible-axios')
const _api = 'https://api.weixin.qq.com/cgi-bin/'//WeChat API

class WeChatJSSDK {
    //Initialize WeChat-related account information
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

        //Here the order of the parameters should be sorted in ascending order of the key value ASCII code
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
    //Get a JS-SDK permission ticket
    async getJsapiTicket() {
        let jsapiTicket = cache.get('jsapiTicket')
        //JS-SDK pass permission ticket expired
        if (!jsapiTicket) {
            let accessToken = await this.getAccessToken()
            const url = _api + 'ticket/getticket?'
                + 'access_token=' + accessToken
                + '&type=jsapi'
            const data = await request.get(url)
            if (data && data.errcode == 0) {
                jsapiTicket = data.ticket
                //Write to cache, 2 hours refresh
                cache.set('jsapiTicket', jsapiTicket, 1000 * 7200)
            }
        }
        return jsapiTicket
    }
    //Get Access Token
    async getAccessToken() {
        let accessToken = cache.get('accessToken')
        //token expired
        if (!accessToken) {
            const url = _api + 'token?grant_type=client_credential'
                + '&appid=' + this._appId
                + '&secret=' + this._appSecret
            const data = await request.get(url)
            if (data) {
                accessToken = data.access_token
                //Write to cache, 2 hours refresh
                cache.set('accessToken', accessToken, 1000 * 7200)
            }
        }
        return accessToken
    }
    //Get random string
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
module.exports = WeChatJSSDK
