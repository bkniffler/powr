const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

export default mainWindow => {
  ipcMain.on('update', (event, { type }) => {
    if (type === 'check') {
      autoUpdater.checkForUpdates();
    } else if (type === 'install') {
      log.info('Quit and install...');
      autoUpdater.quitAndInstall();
    }
  });

  // Confirm
  autoUpdater.on('checking-for-update', (ev, data) => {
    log.info('Checking for update...');
    mainWindow.webContents.send('update', { type: 'checking', data });
    mainWindow.webContents.send('checking-for-update', data);
  });

  // Response
  autoUpdater.on('update-available', (ev, data) => {
    log.info('Update available.', ev, data);
    mainWindow.webContents.send('update', { type: 'available', data });
    mainWindow.webContents.send('update-available', data);
  });
  autoUpdater.on('update-not-available', (ev, data) => {
    log.info('Update not available.', ev, data);
    mainWindow.webContents.send('update', {
      type: 'not-available',
      data
    });
    mainWindow.webContents.send('update-not-available', data);
  });
  autoUpdater.on('error', (ev, data) => {
    log.info('Error in auto-updater.', ev, data);
    mainWindow.webContents.send('update', { type: 'error', data });
    mainWindow.webContents.send('update-error', data);
  });

  // More
  autoUpdater.on('download-progress', (ev, data) => {
    log.info('Download progress...', data);
    mainWindow.webContents.send('update', { type: 'progress', data });
    mainWindow.webContents.send('update-progress', data);
  });
  autoUpdater.on('update-downloaded', (ev, data) => {
    log.info('Update downloaded. Will quit and install.');
    // autoUpdater.quitAndInstall();
    mainWindow.webContents.send('update', { type: 'downloaded', data });
    mainWindow.webContents.send('update-downloaded', data);
  });
};
