const {
  Menu,
  app,
  BrowserWindow,
  crashReporter,
  dialog,
  shell
} = require('electron');

import App from '__resourceQuery';
import print from './print';
import updater from './updater';

require('electron-debug')({ enabled: true });
const log = require('electron-log');
const { machineIdSync } = require('node-machine-id');
const os = require('os');
const path = require('path');
const url = require('url');

// const elecApp = require('@electron');
log.transports.file.level = 'info';
global.MACHINE_ID_ORIGINAL = machineIdSync({ original: true });
global.MACHINE_ID = machineIdSync({ original: false });
global.MACHINE_NAME = os.hostname();

if (process.env.CRASHREPORT_URL) {
  crashReporter.start({
    productName: 'App',
    companyName: 'cool.app',
    submitURL: process.env.CRASHREPORT_URL,
    uploadToServer: true
  });
}

log.transports.file.level = 'info';
log.info('Starting');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const name = app.getName();
const template = [
  {
    label: name,
    submenu: [
      { label: `Über ${name}`, selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      {
        label: 'Beenden',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Bearbeitens',
    submenu: [
      { label: 'Rückgängig', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      {
        label: 'Wiederholen',
        accelerator: 'Shift+CmdOrCtrl+Z',
        selector: 'redo:'
      },
      { type: 'separator' },
      { label: 'Ausschneiden', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Kopieren', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Einfügen', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      {
        label: 'Alles Einfügen',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }
    ]
  },
  {
    label: 'Hilfe',
    submenu: [
      {
        label: 'Log-Datei',
        click() {
          shell.openItem(log.transports.file.file);
        }
      }
    ]
  }
];

function createWindow() {
  log.info('Starting');
  if (template.length) {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  log.info('Creating browser window');
  // Create the browser window.
  // mainWindow = new BrowserWindow({ width: 800, height: 600, frame: true, titleBarStyle: 'hidden' });
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    minWidth: 600,
    minHeight: 450,
    center: true,
    webPreferences: {
      nodeIntegrationInWorker: true,
      nativeWindowOpen: true
    },
    frame: false,
    titleBarStyle: 'hiddenInset'
  });

  mainWindow.webContents.on(
    'new-window',
    (event, url, frameName, disposition, options, additionalFeatures) => {
      if (frameName === 'oauth') {
        // open window as modal
        event.preventDefault();
        Object.assign(options, {
          modal: true,
          parent: mainWindow,
          width: 350,
          height: 650
        });

        const guest = (event.newGuest = new BrowserWindow(options));
        event.newGuest.webContents.on('will-navigate', (event, url) => {
          if (url.indexOf('com://callback') === 0) {
            guest.close();
          }
        });
        guest.webContents.on(
          'did-get-redirect-request',
          (event, oldUrl, newUrl) => {
            if (newUrl.indexOf('com://callback') === 0) {
              mainWindow.webContents.send('oauth-callback', newUrl);
              guest.close();
            }
          }
        );
      }
    }
  );

  log.info('Call app script');
  if (false && elecApp && elecApp.default) {
    try {
      elecApp.default(mainWindow);
    } catch (err) {
      dialog.showMessageBox({
        type: 'error',
        title: 'Error',
        message: JSON.stringify(err, null, 2)
      });
    }
  }

  if (process.env.NODE_ENV === 'production') {
    updater(mainWindow);
  }
  print(app);

  log.info('Loading url');
  // and load the index.html of the app.
  mainWindow.loadURL(
    process.env.INDEX_HTML ||
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      })
  );

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  const selectionMenu = Menu.buildFromTemplate([
    { role: 'copy' },
    { type: 'separator' },
    { role: 'selectall' }
  ]);

  const inputMenu = Menu.buildFromTemplate([
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectall' }
  ]);

  mainWindow.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup(mainWindow);
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup(mainWindow);
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

App(app, mainWindow);

/* process.on('uncaughtException', err => {
console.error(
  `${new Date().toUTCString()} uncaughtException: ${err.message}`
);
console.error(err.stack);
process.exit(1);
}); 
*/
