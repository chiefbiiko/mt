var electron = require('electron')
var ipcMain = require('electron').ipcMain
var local = require('my-local-ip')
// var fsPlug = require('fs-plug')
var fsPlug = require('./../bs-plug')

var plug = fsPlug({ strict: false })
var mw

electron.app.on('ready', function () {
  mw = new electron.BrowserWindow({ width: 400, height: 500 })
  mw.loadURL('file://' + __dirname + '/index.html')
//mw.openDevTools()
})

ipcMain.on('plug-listen', function plugListenHandler (e, plugport) {
  if (plug.listening) {
    return plug.close(plugListenHandler.bind(null, e, plugport))
  }
  plug.supplied = plug.consumed = 0
  plug.listen(plugport, local())
})

ipcMain.on('supply-count', function (e, _) {
  e.sender.send('supplied-count', plug.supplied)
})

ipcMain.on('plug-consume', function (e, conf, size, iconid) {
  plug.consume(conf, function (err, localPath) {
    mw.setProgressBar(-1)
    e.sender.send('plug-consumed', err, localPath, iconid)
  })
  plug.on('bytes-consumed', function (bytes) {
    mw.setProgressBar(0.419) // bytes / size
  })
})

process.on('exit', function () {
  plug.close()
})