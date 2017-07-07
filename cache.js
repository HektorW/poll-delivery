const { readFile, writeFile, mkdir, readdirSync, unlinkSync } = require('fs')
const { promisify } = require('util')
const { join } = require('path')


const asyncReadFile = promisify(readFile)
const asyncWriteFile = promisify(writeFile)
const asyncMkdir = promisify(mkdir)


const cacheFolder = join(__dirname, '.cache')
const getCacheFileName = name => `${cacheFolder}/${name}.txt`


module.exports = {
  clear: () =>
    readdirSync(cacheFolder)
      .forEach(file => unlinkSync(
        join(cacheFolder, file)
      )),

  write: (name, data) =>
    asyncMkdir(cacheFolder)
      .catch(error => {
        if (error.code !== 'EEXIST') throw error
      })
      .then(() =>
        asyncWriteFile(
          getCacheFileName(name),
          JSON.stringify(data),
          'utf8'
        )
      ),

  get: name =>
    asyncReadFile(getCacheFileName(name), 'utf8')
      .then(content => JSON.parse(content))
      .catch(() => ({})),
}
