import { app, Menu } from 'electron';
import os from 'os';
import openPreference from 'utils/process/openPreference';
import i18n from 'constants/i18n';

// reference by https://electronjs.org/docs/api/menu#examples
function createMenu() {
  const text = i18n().menu;
  const template = [
    {
      label: text.edit,
      submenu: [
        { label: text.undo, role: 'undo' },
        { label: text.redo, role: 'redo' },
        { type: 'separator' },
        { label: text.cut, role: 'cut' },
        { label: text.copy, role: 'copy' },
        { label: text.paste, role: 'paste' },
        { label: text.pasteStyle, role: 'pasteandmatchstyle' },
        { label: text.deleteText, role: 'delete' },
        { label: text.selectAll, role: 'selectall' },
      ],
    },
    {
      label: text.view,
      submenu: [
        { label: text.forceReload, role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { label: text.actualSize, role: 'resetzoom' },
        { label: text.zoomIn, role: 'zoomin' },
        { label: text.zoomOut, role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: text.window,
      submenu: [
        { label: text.minimize, role: 'minimize' },
        { label: text.close, role: 'close' },
      ],
    },
  ];

  // when user OS is MacOS,
  if (os.platform() === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: text.about, role: 'about' },
        {
          label: text.preference,
          accelerator: 'CommandOrControl+,',
          click: () => { openPreference(); },
        },
        { type: 'separator' },
        { label: text.services, role: 'services', submenu: [] },
        { type: 'separator' },
        { label: text.hide, role: 'hide' },
        { label: text.hideOther, role: 'hideothers' },
        { label: text.showAll, role: 'unhide' },
        { type: 'separator' },
        { label: text.quit, role: 'quit' },
      ],
    });

    // Edit menu
    template[1].submenu.push(
      { type: 'separator' },
      {
        label: text.speech,
        submenu: [
          { label: text.startSpeech, role: 'startspeaking' },
          { label: text.stopSpeech, role: 'stopspeaking' },
        ],
      },
    );

    // Window menu
    template[3].submenu = [
      { label: text.closeWindow, role: 'close' },
      { label: text.minimize, role: 'minimize' },
      { label: text.zoom, role: 'zoom' },
      { type: 'separator' },
      { label: text.bringAllToFront, role: 'front' },
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = createMenu;
