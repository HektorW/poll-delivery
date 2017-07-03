const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')
const { parse } = require('url')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const alert = require('alert-node')
const HttpProxyAgent = require('http-proxy-agent')

const url = 'http://webtrack.dhlglobalmail.com/?mobile=&trackingnumber=GM545322949112368187&locale=en'
const proxy =
  process.env.HTTP_PROXY ||
  process.env.http_proxy
const proxyAgent = proxy
  ? new HttpProxyAgent(proxy)
  : null

const cacheFile = join(__dirname, 'cache.txt')

const getLatestResult = () =>
  promisify(readFile)(cacheFile, 'utf8')
    .catch(() => '{}')
    .then(content => JSON.parse(content))

const writeCacheResult = result =>
  promisify(writeFile)(cacheFile, JSON.stringify(result), 'utf8')


const getPageObj = html => {
  const $ = cheerio.load(html)

  return {
    message: $('.timeline-last .timeline-description').text(),
    dateLocationStr: $('.status-info').text()
      .replace(/(\n|\t)/g, ' ')
      .replace(/\W{2,}/g, ' ')
      .replace(/(\W$|^\W)/g, ''),
  }
}

const isSamePage = (a, b) =>
  a.dateLocationStr === b.dateLocationStr &&
  a.message === b.message
  

const alertNewStatus = pageObj => {
  writeCacheResult(pageObj).catch(console.error)
  const message = `
    ${pageObj.dateLocationStr}

    The latest message is: ${pageObj.message}.
  `

  console.log(message)
  alert(message)
}


async function fetchAndCompare() {
  process.stdout.write(`${new Date().toISOString()}, Fetching and scraping page`)

  const response = await fetch(url, { agent: proxyAgent })
  const html = await response.text()

  const pageObj = getPageObj(html)
  const lastPageObj = await getLatestResult()

  if (!isSamePage(pageObj, lastPageObj)) {
    process.stdout.write(' (new status!)')
    process.stdout.write('\n')
    alertNewStatus(pageObj)
  } else {
    process.stdout.write(' (no changes)')
    process.stdout.write('\n')
  }
}

async function poll() {
  try {
    await fetchAndCompare()
  } catch (error) {
    console.error(error)
  }

  const MINUTES = 1000 * 60
  setTimeout(poll, MINUTES * 10)
}


if (require.main === module) {
  if (process.argv[2] === '--rmcache') {
    try {
      require('fs').unlinkSync(cacheFile)
    } catch (error) {
      if (error.code !== 'ENOENT') console.error(error)
    }
  }

  poll()
}
