const blessed = require('blessed')

const screen = blessed.screen({ smartCSR: true })
screen.title = 'Polling'



screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

screen.render()