const { session, shell } = require('electron');
const path = require('path');

export default app => {
  session.defaultSession.on('will-download', (event, item) => {
    // event.preventDefault();
    const temp = path.resolve(app.getPath('temp'), '_pdf.pdf');
    item.setSavePath(temp);

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully');
        /* const win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
              plugins: true
            }
          }); */
        // PDFWindow.addSupport(win);
        shell.openItem(temp);
        // win.loadURL(`file://${temp}`);
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });
};
