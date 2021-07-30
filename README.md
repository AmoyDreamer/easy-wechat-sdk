# easy-wechat-sdk
A simple library based on the WeChat API that supports getting permission signatures on Node.js.

## Install
### Using npm
```bash
npm install easy-wechat-sdk --save
```

## Usage

### Website Service => [WeChat-JSSDK](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#1)
**Get Permission verification configuration**

```
const url = 'https://test.demo.com/usage/wechat'
const WeChatSDK = require('easy-wechat-sdk')
const WeChatJSSDK = new WeChatSDK('your_appId', 'your_appSecret')
let signPackage = null
try {
    signPackage = await WeChatJSSDK.getSignPackage(url)
} catch(e) {
    //Some exception, such as network error => request timeout.
}
```

## Method
getSignPackage(url)
- url => {String} The url of current page.(required)
- return => {Object} permission verification configuration

Permission verification configuration
- appId => {String} WeChat AppId
- timestamp => {Number} timestamp, unit is seconds
- url => {String} the url of current page
- nonceStr => {String} random string
- jsapiTicket => {String} Temporary ticket for calling the WeChat JS interface
- signature => {String} permission signature

## WeChat API
The following interfaces are used under the module **easy-wechat-sdk**
- [Get_access_token](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)
- [Get JS-SDK permission ticket](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)

## License
google-recaptcha-api is [MIT licensed](https://github.com/AmoyDreamer/easy-wechat-sdk/blob/master/LICENSE).
