const doEverything = async () => {
  if (!window.require('photoshop').app.activeDocument) {
    throw new Error('No active document!');
  }

  const { localFileSystem: fileSys } = require('uxp').storage;
  const folderRef = await fileSys.getFolder();

  // Save first frame
  let top = 100;
  let left = 200;
  let bottom = 800;
  let right = 400;

  await createSelection({ top, left, bottom, right });
  await copySelection();
  await newDoc({ width: right - left, height: bottom - top });
  await pasteSelection();

  // ----------------

  let newFile = await folderRef.createFile('testing-tuv.jpg');
  let saveFile = await fileSys.createSessionToken(newFile);
  await saveThing(saveFile);

  // Save second frame
  left = 500;
  right = 700;

  await createSelection({ top, left, bottom, right });
  await copySelection();
  await newDoc({ width: right - left, height: bottom - top });
  await pasteSelection();

  newFile = await folderRef.createFile('testing-wxy.jpg');
  saveFile = await fileSys.createSessionToken(newFile);
  await saveThing(saveFile);
};

const saveThing = async (saveFileRef) => {
  const { app, action } = require('photoshop');
  const documentID = app.activeDocument.id;
  const params = getParams(saveFileRef, documentID);

  try {
    await action.batchPlay(params.commands, params.options);
    app.activeDocument.closeWithoutSaving();

    console.log('Saved JPEG successfully');
  } catch (err) {
    console.error('Save failed:', err);
  }
};

document.getElementById('btnExport').addEventListener('click', () => {
  require('photoshop').core.executeAsModal(doEverything, {
    commandName: 'Generic name of the command',
  });
});
