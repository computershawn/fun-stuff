async function createSelection({ top, left, bottom, right }) {
  const { app, constants } = window.require('photoshop');

  // Create a selection object
  try {
    await app.activeDocument.selection.selectRectangle(
      { top, left, bottom, right },
      constants.SelectionType.REPLACE
    );
    console.log('Area selected');
  } catch (err) {
    console.error('Select operation error:', err);
  }
}

async function copySelection() {
  const batchPlay = require('photoshop').action.batchPlay;

  try {
    await require('photoshop').action.batchPlay(
      [
        {
          _obj: 'paste',
          _isCommand: true,
          as: { _class: 'document' },
        },
      ],
      {
        modalBehavior: 'execute',
      }
    );
    console.log('Area pasted to new document');
  } catch (err) {
    console.error('Paste operation error:', err);
  }
}

async function pasteSelection() {
  const batchPlay = require('photoshop').action.batchPlay;

  try {
    await batchPlay(
      [
        {
          _obj: 'paste',
          _isCommand: true,
          as: { _class: 'document' },
        },
      ],
      {
        modalBehavior: 'execute',
      }
    );
    console.log('Area pasted to new document');
  } catch (err) {
    console.error('Paste operation error:', err);
  }
}

async function newDoc({ width, height }) {
  const { app } = window.require('photoshop');
  try {
    const newDoc = await app.documents.add({
      width,
      height,
      resolution: app.activeDocument.resolution,
      mode: 'RGBColorMode',
      fill: 'transparent',
    });
  } catch (err) {
    console.error('Select operation error:', err);
  }
}

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
