const alert = require('alert-node')


module.exports = {
  setFetching: () => process.stdout.write(`${new Date().toLocaleTimeString()}, Polling`),
  setFetchResult: result => process.stdout.write(` (${result})\n`),

  printNewStatus: statusMessage => {
    console.log(statusMessage)
    alert(statusMessage)
  },

  write: (...messages) => console.log(...messages),
}