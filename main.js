// [...]

// async function doTheDamnThing() {
//   // create the TSV string
//   let tsvString = 'Base name\tOpacity\tIs visible';

//   const { app, constants } = window.require('photoshop');
//   const doc = app.activeDocument;

//   doc.layers.forEach((layer) => {
//     tsvString +=
//       '\n' +
//       layer.name +
//       '\t' +
//       layer.opacity +
//       '\t' +
//       (layer.visible ? 'yes' : 'no');
//   });

//   console.log('tsvString', tsvString);
//   // console.log(
//   //   'constants.SelectionType.REPLACE',
//   //   constants.SelectionType.REPLACE
//   // );

//   // save the string to the filesystem
//   const storage = window.require('uxp').storage;
//   // console.log('storage', storage);
//   // const file = await storage.localFileSystem.getFileForSaving('layers.tsv');
//   // console.log('file', file);
//   // await file.write(tsvString);

//   // try {
//   //   if (!app.activeDocument) {
//   //     throw new Error('No active document');
//   //   }

//   //   // First create a selection object
//   //   const doc = app.activeDocument;
//   //   const selection = await doc.selection.selectAll();
//   //   // Now you should be able to access the selection
//   //   console.log('Selection created:', selection);
//   //   console.log('Selection bounds:', app.activeDocument.selection?.bounds);
//   // } catch (err) {
//   //   console.error('Selection error:', err);
//   // }

//   try {
//     if (!app.activeDocument) {
//       throw new Error('No active document');
//     }

//     // First create a selection object
//     const selection = await app.activeDocument.selection.selectRectangle(
//       {top: 50, left: 50, bottom: 400, right: 600},
//       constants.SelectionType.REPLACE
//   );
//   ;

//     // Now you should be able to access the selection
//     console.log('Selection created:', selection);
//     console.log('Selection bounds:', app.activeDocument.selection?.bounds);
//   } catch (err) {
//     console.error('Selection error:', err);
//   }

//   // console.log(doc.selection.bounds); // {{top: 50, left: 50, bottom: 100, right: 100}
//   // console.log(doc.selection.solid); // true
// }

async function selectArea({ top, left, bottom, right }) {
  const { app, constants } = window.require('photoshop');

  try {
    if (!app.activeDocument) {
      throw new Error('No active document');
    }
    // Create a selection object
    const selection = await app.activeDocument.selection.selectRectangle(
      { top, left, bottom, right },
      constants.SelectionType.REPLACE
    );

    // Now you should be able to access the selection
    console.log(
      'Created selection; Bounds are:',
      app.activeDocument.selection?.bounds
    );

    return selection;
  } catch (err) {
    console.error('Selection error:', err);
  }
}

// async function copySelection1() {
//   const { app, constants, action } = window.require('photoshop');

//   try {
//     if (!app.activeDocument) {
//       throw new Error('No active document');
//     }

//     // Copy the selection
//     await action.batchPlay(
//       [
//         {
//           _obj: 'copy',
//           _isCommand: true,
//           _options: {
//             dialogOptions: 'dontDisplay',
//           },
//         },
//       ],
//       {
//         modalBehavior: 'execute',
//       }
//     );

//     console.log('Area copied to clipboard');
//   } catch (err) {
//     console.error('Copy operation error:', err);
//   }
// }

async function copySelection({ top, left, bottom, right }) {
  const { app, constants } = window.require('photoshop');

  if (!app.activeDocument) {
    throw new Error('OH NO!. No active document');
  }

  let selection;
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

  try {
    await require('photoshop').action.batchPlay(
      [
        {
          // _obj: 'copyToLayer',
          _obj: 'copy',
          _isCommand: true,
        },
      ],
      {
        modalBehavior: 'execute',
      }
    );
    console.log('Area copied to clipboard');
  } catch (err) {
    console.error('Copy operation error:', err);
  }

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

  try {
    // "Default Photoshop Size" 7x5 inches at 300ppi
    // console.log('selection', app.activeDocument.selection.width);
    let newDoc2 = await app.documents.add({
      width: right - left,
      height: bottom - top,
      resolution: app.activeDocument.resolution,
      mode: 'RGBColorMode',
      fill: 'transparent',
      name: 'wassup',
    });
  } catch (err) {
    console.error('Select operation error:', err);
  }

  // --------
  // console.log('action.batchPlay', action.batchPlay);

  // layerProperties = {
  //   _obj: 'multiGet',
  //   _target: {
  //     _ref: [
  //       { _ref: 'layer', _enum: 'ordinal' },
  //       { _ref: 'document', _enum: 'ordinal' },
  //     ],
  //   },
  //   extendedReference: [['name', 'layerID', 'opacity']],
  //   options: { failOnMissingProperty: false, failOnMissingElement: false },
  // };
  // result = await require('photoshop').action.batchPlay([layerProperties], {});
  // console.log('result', result);

  // if (!selection) {
  //   throw new Error('OH NO! No selection');
  // }
  // // Copy the current selection
  // try {
  //   console.log('doin it');
  //   await action.batchPlay(
  //     [
  //       {
  //         _obj: 'copy',
  //         _target: selection,
  //         // _isCommand: true,
  //         _options: {
  //           dialogOptions: 'dontDisplay',
  //         },
  //       },
  //     ],
  //     {
  //       modalBehavior: 'fail',
  //     }
  //   );
  //   console.log('just did it');

  //   console.log('Selection copied to clipboard');
  // } catch (err) {
  //   console.error('Copy failed:', err);
  // }
  // try {
  //   await batchPlay(
  //     [
  //       {
  //         _obj: 'copyEvent',
  //         // _target: selection,
  //         _options: {
  //           dialogOptions: 'dontDisplay',
  //         },
  //       },
  //     ],
  //     {
  //       synchronousExecution: false,
  //       modalBehavior: 'execute',
  //     }
  //   );

  //   console.log('Area copied to clipboard');
  // } catch (err) {
  //   console.error('Copy operation error:', err);
  // }
}

const doEverything = async () => {
  // await selectArea({ top: 100, left: 200, bottom: 800, right: 1000 });
  await copySelection({ top: 100, left: 200, bottom: 800, right: 400 });
};

document.getElementById('btnExport').addEventListener('click', () => {
  require('photoshop').core.executeAsModal(doEverything, {
    commandName: 'Generic name of the command',
  });
});

// let result = require("photoshop").core.executeAsModal(hideActiveLayer, {"commandName": "Hide Layer"});
