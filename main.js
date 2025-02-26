const padX = 120;
const padY = 120;

const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

prevBtn.addEventListener('click', () => {
  const field = document.getElementById('currentPage');
  const page = parseInt(field.value);  
  const updated = Math.max(1, page - 1);
  field.value = `${updated}`;
});

nextBtn.addEventListener('click', () => {
  const field = document.getElementById('currentPage');
  const page = parseInt(field.value);  
  const updated = page + 1;
  field.value = `${updated}`;
});

// Paste copied pixels into document
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
  } catch (err) {
    console.error('Paste operation error:', err);
  }
}

// Create a selection in the active document
async function createSelection({ top, left, bottom, right }) {
  const { app, constants } = require('photoshop');

  // Create a selection object
  try {
    await app.activeDocument.selection.selectRectangle(
      { top, left, bottom, right },
      constants.SelectionType.REPLACE
    );
  } catch (err) {
    console.error('Select operation error:', err);
  }
}

// Copy pixels of the current selection
async function copySelection() {
  const { batchPlay } = require('photoshop').action;

  try {
    await batchPlay(
      [
        {
          _obj: 'copyMerged',
        },
      ],
      {
        modalBehavior: 'execute',
      }
    );
  } catch (err) {
    console.error('Copy operation error:', err);
  }
}

// Create a new document with the specified width and height
async function newDoc({ width, height }) {
  const { app } = require('photoshop');
  try {
    await app.documents.add({
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

// Generate indices for each frame in the page. This version of the function
// allows columns to span multiple pages. Variable 'cols' should always be
// a multiple of pageCols. For example, if cols is 12, pageCols should be 3.
function generateFrameNums({
  pages = 1,
  pageCols = 1,
  pageRows = 1,
  cols = 1,
}) {
  const perPage = pageCols * pageRows;
  const temp = [];
  let r = 0;

  for (let i = 0; i < pages; i++) {
    const nums = [];
    for (let j = 0; j < pageRows; j++) {
      for (let k = 0; k < pageCols; k++) {
        const n = i % 2 === 1 ? pageCols : 0;
        const u = Math.floor(r / (2 * perPage)) * (2 * perPage);
        nums.push(cols * j + k + n + 1 + u);
        r += 1;
      }
    }
    temp.push(nums);
  }

  return temp;
}

// Calculate top/bottom/left/right bounds for each frame
function getBounds({ xOff, yOff, xGap, yGap, wd, ht, pageRows, pageCols }) {
  const temp = [];
  for (let i = 0; i < pageRows; i++) {
    for (let j = 0; j < pageCols; j++) {
      const top = yOff + i * (ht + yGap) - padY;
      const bottom = top + ht + 2 * padY;
      const left = xOff + j * (wd + xGap) - padX;
      const right = left + wd + 2 * padX;

      temp.push({ top, bottom, left, right });
    }
  }

  return temp;
}

// Create a save params object for exporting multiple files using batchPlay
const getParams = (saveFile, documentID) => ({
  commands: [
    {
      _obj: 'save',
      _isCommand: true,
      as: {
        _obj: 'JPEGFormat',
        quality: 12, // Max quality
        formatOptions: {
          _obj: 'JPEGFormatOptions',
          quality: 12,
        },
      },
      in: { _path: saveFile },
      saveStage: { _enum: 'saveStageType', _value: 'saveBegin' },
      documentID,
      lowerCase: true,
      saveAs: true,
    },
  ],
  options: {
    modalBehavior: 'execute',
    continueSaveDialog: false, // Prevents dialog from showing
  },
});

const doEverything = async () => {
  if (!window.require('photoshop').app.activeDocument) {
    throw new Error('No active document!');
  }

  const { localFileSystem: fileSys } = require('uxp').storage;
  const folderRef = await fileSys.getFolder();

  if (!folderRef) {
    throw new Error('No folder reference!');
  }

  const {
    pageRows,
    pageCols,
    expanded: cols,
    xOffset: xOff,
    width: wd,
    xGap,
    yOffset: yOff,
    height: ht,
    yGap,
    pages,
  } = getValues();

  const bounds = getBounds({
    xOff,
    yOff,
    xGap,
    yGap,
    wd,
    ht,
    pageRows,
    pageCols,
  });

  const frameNums = generateFrameNums({ pages, pageCols, pageRows, cols });

  const pageLayerNames = getPageLayerNames();

  // THIS IS GETTING TOO COMPLICATED
  // TRY REVERTING TO MANUAL PAGE SELECTION INSTEAD
  // OF HAVING THE PROGRAM AUTOMATICALLY TRAVERSE PAGES
  // pageLayerNames.forEach(async (layerName) => {
  //   toggleLayers(layerName);

  //   const pageNum = parseInt(layerName.split('-')[1]);
  //   // console.log('frameNums', frameNums);
  //   const indices = frameNums[pageNum - 1];
  //   console.log('indices', indices);

  //   // console.log('indices', indices);
  //   console.log('show layer', layerName);

  //   try {
  //     for (let i = 0; i < indices.length; i++) {
  //       const { top, left, bottom, right } = bounds[i];

  //       // await require('photoshop').core.executeAsModal(() =>
  //       //   createSelection({ top, left, bottom, right })
  //       // );
  //       // await require('photoshop').core.executeAsModal(copySelection);
  //       // await require('photoshop').core.executeAsModal(() =>
  //       //   newDoc({ width: right - left, height: bottom - top })
  //       // );
  //       // await require('photoshop').core.executeAsModal(pasteSelection);

  //       console.log('export file', `frames-${indices[i]}.jpg`);

  //       // const fileRef = await folderRef.createFile(`frames-${indices[i]}.jpg`);
  //       // const saveFile = await fileSys.createSessionToken(fileRef);
  //       // await require('photoshop').core.executeAsModal(() =>
  //       //   exportFile(saveFile)
  //       // );
  //     }
  //   } catch (err) {
  //     console.error('Error:', err);
  //   }
  // });

  // toggleLayers('', true);

  // toggleLayers('page-3');
  // console.log('name', pageLayerNames);

  // const pageNum = 1;
  // const indices = frameNums[pageNum - 1];

  // try {
  //   for (let i = 0; i < indices.length; i++) {
  //     const { top, left, bottom, right } = bounds[i];

  //     await createSelection({ top, left, bottom, right });
  //     await copySelection();
  //     await newDoc({ width: right - left, height: bottom - top });
  //     await pasteSelection();

  //     const newFile = await folderRef.createFile(`frames-${indices[i]}.jpg`);
  //     const saveFile = await fileSys.createSessionToken(newFile);
  //     await exportFile(saveFile);
  //   }
  // } catch (err) {
  //   console.error('Error:', err);
  // }
};

const exportFile = async (saveFileRef) => {
  const { app, action } = require('photoshop');
  const documentID = app.activeDocument.id;
  const params = getParams(saveFileRef, documentID);

  try {
    await action.batchPlay(params.commands, params.options);
    app.activeDocument.closeWithoutSaving();
  } catch (err) {
    console.error('Save failed:', err);
  }
};

function getValues() {
  const varbs = [
    'pageRows',
    'pageCols',
    'expanded',
    'xOffset',
    'width',
    'xGap',
    'yOffset',
    'height',
    'yGap',
    'pages',
  ];
  const temp = varbs.reduce((prev, curr) => {
    const val = document.getElementById(curr).value;
    return {
      ...prev,
      [curr]: parseInt(val),
    };
  }, {});

  return temp;
}

function getPageLayerNames() {
  const { app } = require('photoshop');
  var { layers } = app.activeDocument;

  const temp = layers.reduce((acc, curr) => {
    if (/^page-\d+$/.test(curr.name)) {
      acc.push(curr.name);
    }

    return acc;
  }, []);

  return temp.sort();
}

function toggleLayers(layerName, showAll) {
  const { app } = require('photoshop');
  var { layers } = app.activeDocument;

  if (showAll) {
    for (let i = 0; i < layers.length; i++) {
      layers[i].visible = true;
    }
    return;
  }

  // Hide or show layers
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].name === layerName) {
      layers[i].visible = true;
      // console.log(layerName, 'show');
    } else if (layers[i].name === 'base') {
      layers[i].visible = true;
      // console.log('base', 'show');
    } else {
      layers[i].visible = false;
      // console.log(layers[i].name, 'hide');
    }
  }
}

// document.getElementById('btnExport').addEventListener('click', () => {
//   require('photoshop').core.executeAsModal(
//     () => {
//       const pageLayerNames = getPageLayerNames();
//       pageLayerNames.forEach((layerName) => {
//         toggleLayers(layerName);
//       });
//       toggleLayers('', true);
//     },
//     {
//       commandName: 'Generic name of the command',
//     }
//   );
// });

// Batch export individual frames to JPEGs
document.getElementById('btnExport').addEventListener('click', () => {
  require('photoshop').core.executeAsModal(doEverything, {
    commandName: 'Generic name of the command',
  });
});
