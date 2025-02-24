// const { pasteSelection } = require('./utils');

const doEverything = async () => {
  if (!window.require('photoshop').app.activeDocument) {
    throw new Error('No active document!');
  }

  const top = 100;
  const left = 200;
  const bottom = 800;
  const right = 400;

  await createSelection({ top, left, bottom, right });
  await copySelection();
  await newDoc({ width: right - left, height: bottom - top });
  await pasteSelection();
};

document.getElementById('btnExport').addEventListener('click', () => {
  require('photoshop').core.executeAsModal(doEverything, {
    commandName: 'Generic name of the command',
  });
});

// let result = require("photoshop").core.executeAsModal(hideActiveLayer, {"commandName": "Hide Layer"});
