const cache = require('../cache')
const gui = require('../gui')
const fetch = require('./fetch')
const { createPoller } = require('./poller')


const cacheName = 'postnord'
const url = 'http://www.postnord.se/api/shipment/CG009176265DE/en'
// http://www.postnord.se/en/online-tools/tools/track/track-and-trace#dynamicloading=true&shipmentid=CG009176265DE


const extractTrackingEvents = trackingJson =>
  trackingJson
    .response
    .trackingInformationResponse
    .shipments[0]
    .items[0]
    .events


const hasNewStatus = (oldEvents, newEvents) =>
  oldEvents.length !== newEvents.length


const formatEvent = event => `
  ${event.eventDescription}
  Timestamp: ${event.eventTime}

  Location:
  ${event.location.displayName}
  ${event.location.city || ''} ${event.location.country}
`


async function fetchAndCompare () {
  gui.setFetching()

  const responses = await fetch(url)
  const json = await responses.json()


  const events = extractTrackingEvents(json)
  const { events: oldEvents = [] } = await cache.get(cacheName)

  if (hasNewStatus(oldEvents, events)) {
    gui.setFetchResult('new status!')

    cache.write(cacheName, { events })
    gui.printNewStatus(
      formatEvent(events[0])
    )
  } else {
    gui.setFetchResult('no updates')
  }
}


module.exports.startPolling = function startPolling () {
  const MINUTES = 1000 * 60
  const poller = createPoller(fetchAndCompare, MINUTES * 10)
  poller.start()
  return poller
}


if (require.main === module) {
  module.exports.startPolling()
}
