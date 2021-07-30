"use strict"
/**
 * @desc A simple library based on the WeChat API that supports getting permission signatures on Node.js.
 * @author Allen liu
 */
const crypto = require('crypto')
const cache = require('secure-cache')
const request = require('flexible-axios')
const API = 'https://api.weixin.qq.com/cgi-bin/'//WeChat API

class WeChatJSSDK {
    //Initialize WeChat-related account information
    constructor(appId, appSecret) {
        this._appId = appId
        this._appSecret = appSecret
    }
    /**
     * @method Get sign packages
     * @param {String} url => The url of current page.(required)
     */
    async getSignPackage(url) {
        const jsapiTicket = await this.getJsapiTicket()
        const nonceStr = this.createNonceStr()
        const timeStamp = Math.floor((new Date()).getTime() / 1000)
        //Here the order of the parameters should be sorted in ascending order of the key value ASCII code
        const str = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timeStamp}&url=${url}`
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
    /**
     * @method Get a JS-SDK permission ticket
     * @document https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
     */
    async getJsapiTicket() {
        let jsapiTicket = cache.get('jsapiTicket')
        //JS-SDK pass permission ticket expired
        if (!jsapiTicket) {
            let accessToken = await this.getAccessToken()
            try {
                const url = `${API}ticket/getticket?type=jsapi&access_token=${accessToken}`
                const data = await request.get(url)
                console.log(`Get "jsapi_ticket" by request url => "${url}"`, data)
                if (data && data.errcode == 0) {
                    jsapiTicket = data.ticket
                    //Write to cache, 2 hours refresh
                    cache.set('jsapiTicket', jsapiTicket, 1000 * 7200)
                }
            } catch(e) {
                throw new Error('easy-wechat-sdk: network error, please try again later.')
            }
        }
        return jsapiTicket
    }
    /**
     * @method Get Access Token
     * @document https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
     */
    async getAccessToken() {
        let accessToken = cache.get('accessToken')
        //Access token expired
        if (!accessToken) {
            try {
                const url = `${API}token?grant_type=client_credential&appid=${this._appId}&secret=${this._appSecret}`
                const data = await request.get(url)
                console.log(`Get "access_token" by request url => "${url}"`, data)
                if (data && data.access_token) {
                    accessToken = data.access_token
                    //Write to cache, 2 hours refresh
                    cache.set('accessToken', accessToken, 1000 * 7200)
                }
            } catch(e) {
                throw new Error('easy-wechat-sdk: network error, please try again later.')
            }
        }
        return accessToken
    }
    /**
     * @method Get random string
     * @param {Number} length => The length of random string, default is 16.(optional)
     */
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
