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
    console.log('Area pasted to new document');
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
    console.log('Area selected');
  } catch (err) {
    console.error('Select operation error:', err);
  }
}

// Copy pixels of the current selection
async function copySelection() {
  const batchPlay = require('photoshop').action.batchPlay;

  try {
    await require('photoshop').action.batchPlay(
      [
        {
          _obj: 'copyEvent',
          // _isCommand: true,
          // as: { _class: 'document' },
        },
      ],
      {
        modalBehavior: 'execute',
      }
    );
    console.log('Area copied from active');
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
function generateFrameNums ({ pages = 1, pageCols = 1, pageRows = 1, cols = 1}) {
  const perPage = pageCols * pageRows;
  const temp = [];
  let r = 0;

  for(let i = 0; i < pages; i++) {
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
};

// Calculate top/bottom/left/right bounds for each frame
function getBounds({ xOff, yOff, xGap, yGap, wd, ht, pageRows, pageCols }) {
  const temp = [];
  for(let i = 0; i < pageRows; i++) {
    for (let j = 0; j < pageCols; j++) {
      const top = yOff + i * (ht + yGap);
      const bottom = top + ht;
      const left = xOff + j * (wd + xGap);
      const right = left + wd;

      temp.push({top, bottom, left, right});
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
        // embedColorProfile: true,
        formatOptions: {
          _obj: 'JPEGFormatOptions',
          quality: 12,
          // scans: 3,
          // matte: {_enum: "matteType", _value: "none"}
        },
      },
      in: { _path: saveFile },
      saveStage: { _enum: 'saveStageType', _value: 'saveBegin' },
      documentID,
      // copy: true, // Save a copy
      lowerCase: true,
      saveAs: true,
    },
  ],
  options: {
    modalBehavior: 'execute',
    continueSaveDialog: false, // Prevents dialog from showing
  },
});

// const pages = 1; // 3;
// const pageCols = 6; // 3;
// const pageRows = 6; // 3;
// const cols = 6; // 6;

// const xOff = 90;
// const yOff = 240;
// const xGap = 11;
// const yGap = 310;
// const wd = 515;
// const ht = 515;

// // xOff: 90, yOff: 240, xGap: 11, yGap: 310, wd: 515, ht: 515, rows: 2, cols: 6

// const bounds = getBounds({ xOff, yOff, xGap, yGap, wd, ht, pageRows, pageCols });
// console.log(bounds);
// const frameNums = generateFrameNums({ pages, pageCols, pageRows, cols });
// console.log(frameNums);



// const frameNums = generateFrameNums();
