module.exports = {
  createPoller: (callback, pollTimeoutMs) => {
    let timeoutId

    async function poll () {
      try {
        await callback()
      } catch (error) {
        console.error(error)
      }

      if (timeoutId !== 'stopped') {
        timeoutId = setTimeout(poll, pollTimeoutMs)
      }
    }

    return {
      start: () => { poll(); timeoutId = null },
      poll: () => { clearTimeout(timeoutId); poll() },
      stop: () => { clearTimeout(timeoutId); timeoutId = 'stopped' }
    }
  }
}