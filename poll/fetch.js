const fetch = require('node-fetch')
const HttpProxyAgent = require('http-proxy-agent')

const { assign } = Object


const proxy =
  process.env.HTTP_PROXY ||
  process.env.http_proxy
const agent = proxy
  ? new HttpProxyAgent(proxy)
  : null


module.exports = (url, options) =>
  fetch(url, assign({ agent }, options))
