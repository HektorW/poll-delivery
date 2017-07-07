
if (process.argv[2] === '--rmcache') {
  try {
    require('./gui').write('Clearing cache')
    require('./cache').clear()
  } catch (error) {
    console.error(error)
  }
}

require('./poll/postnord').startPolling()
