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

const pages = 1; // 3;
const pageCols = 6; // 3;
const pageRows = 6; // 3;
const cols = 6; // 6;

const xOff = 90;
const yOff = 240;
const xGap = 11;
const yGap = 310;
const wd = 515;
const ht = 515;

// xOff: 90, yOff: 240, xGap: 11, yGap: 310, wd: 515, ht: 515, rows: 2, cols: 6

const bounds = getBounds({ xOff, yOff, xGap, yGap, wd, ht, pageRows, pageCols });
console.log(bounds);
const frameNums = generateFrameNums({ pages, pageCols, pageRows, cols });
console.log(frameNums);



// const frameNums = generateFrameNums();