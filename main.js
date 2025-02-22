const { entrypoints } = require('uxp');

showAlert = () => {
  alert('This is an alert message');
};

entrypoints.setup({
  commands: {
    showAlert,
  },
  panels: {
    vanilla: {
      show(node) {},
    },
  },
});

// The bounds of the area to be copied are indicated
// by 6 guides that you place in the Photoshop document
// There should be 3 vertical guides and 3 horizontal
// guides
function findBounds(activeDocument) {
  var numVertGuides = 3;
  var numHorzGuides = 3;
  var hGuides = [];
  var vGuides = [];

  var guides = activeDocument.guides;

  for (let i = 0; i < guides.length; i++) {
    if (guides[i].direction === 'horizontal') {
      hGuides.push(guides[i].coordinate);
    }
    if (guides[i].direction === 'vertical') {
      vGuides.push(guides[i].coordinate);
    }
    if (hGuides.length === numHorzGuides && vGuides.length === numVertGuides) {
      break;
    }
  }

  if (hGuides.length < numHorzGuides || vGuides.length < numVertGuides) {
    return { error: true };
  } else {
    var h = hGuides.sort(function (a, b) {
      return a > b ? 1 : -1;
    });
    var v = vGuides.sort(function (a, b) {
      return a > b ? 1 : -1;
    });

    var data = {
      x0: v[0],
      y0: h[0],
      hStep: v[1] - v[0],
      vStep: h[1] - h[0],
      wd: v[2] - v[0],
      ht: h[2] - h[0],
    };

    return data;
  }
}

function toggleLayers(activeDocument, index, showAll) {
  // const layersRef = activeDocument.artLayers;
  const layersRef = activeDocument.layers;
  console.log('index', index);

  if (showAll) {
    // for (let i = 0; i < layersRef.length; i++) {
    //   layersRef[i].visible = true;
    // }
    activeDocument.layers.forEach((layer) => {
      layer.visible = true;
    });
    return;
  }

  // Hide all layers
  // for (let i = 0; i < layersRef.length; i++) {
  //   layersRef[i].visible = false;
  // }
  activeDocument.layers.forEach((layer) => {
    layer.visible = false;
  });

  // // And then show specifed layers
  // // var layersRef = activeDocument.artLayers;
  // const currentLayerRef = layersRef[index];

  // const prefix = currentLayerRef.name.substring(0, 5);
  // const isPage = prefix === 'page-';
  // if (!isPage) {
  //   return false;
  // }

  // if (currentLayerRef !== null) {
  //   currentLayerRef.visible = true;
  // }

  // const bgLayerRef = layersRef.getByName('background');
  // if (bgLayerRef !== null) {
  //   bgLayerRef.visible = true;
  // }

  return true;
}

function exportFile(docRef, docPath, num) {
  var filename = docPath + '/frames/' + 'frame' + '-' + num + '.jpg';
  console.log('filename', filename);
  var saveFileJPEG = File(filename);

  var options = new ExportOptionsSaveForWeb();
  options.format = SaveDocumentType.JPEG;
  options.optimized = false;
  options.quality = 100;
  // alert(Object.keys(ExportType));
  // docRef.exportDocument(saveFileJPEG, ExportType.SAVEFORWEB, options);

  // var fileExtension = 'jpg';
  alert('docRef', typeof docRef);

  docRef.bitsPerChannel = BitsPerChannelType.EIGHT;

  // var saveFile = new File(exportInfo.destination + '/' + fileNameBody + fileExtension);

  jpgSaveOptions = new JPEGSaveOptions();

  // jpgSaveOptions.embedColorProfile = exportInfo.icc;
  jpgSaveOptions.embedColorProfile = false;

  // jpgSaveOptions.quality = exportInfo.jpegQuality;
  jpgSaveOptions.quality = 12;

  docRef.saveAs(saveFileJPEG, jpgSaveOptions, true, Extension.LOWERCASE);
}

function eyBroDoTheThing() {
  return window.require('photoshop').core.executeAsModal(() => {
    const app = require('photoshop').app;
    var sourceDocRef = app.activeDocument;
    var rows = 6;
    var cols = 6;
    var bounds = findBounds(app.activeDocument);

    if (bounds.error) {
      alert('Oh noes! Something went wrong…');
      return;
    }

    var x0 = bounds.x0;
    var y0 = bounds.y0;
    var hStep = bounds.hStep;
    var vStep = bounds.vStep;
    var wd = bounds.wd;
    var ht = bounds.ht;

    var resolution = sourceDocRef.resolution;
    var sec = Math.floor(Date.now() / 1000).toString();
    var docName = 'tempFile-' + sec;
    // var newDocRef = createDocument(app, wd, ht, resolution, docName);
    const newDocRef = app.documents.add(wd, ht, resolution, docName);
    // console.log(wd, ht, resolution, docName);
    // console.log('newDocRef', newDocRef);

    app.activeDocument = sourceDocRef;

    const sourceDocPath = sourceDocRef.path;
    // var j = 0;
    let currentPage = 0;
    const numLayers = sourceDocRef.layers.length;
    // console.log('numLayers', numLayers);

    //     for (let k = 0; k < numLayers; k++) {
    //       console.log('k', k);
    //       // Copy layer contents if the layer's name starts with 'page-'
    //       const shouldCopyLayer = toggleLayers(k);
    //       console.log('shouldCopyLayer', shouldCopyLayer);
    //       if (shouldCopyLayer) {
    //         let x, y;
    //         for (let i = 0; i < rows; i++) {
    //           y = y0 + i * vStep;
    //           for (let j = 0; j < cols; j++) {
    //             const frameNumber = currentPage * rows * cols + i * cols + j + 1;
    //             x = x0 + j * hStep;
    //             const selRegion = [
    //               [x, y],
    //               [x + wd, y],
    //               [x + wd, y + ht],
    //               [x, y + ht],
    //               [x, y],
    //             ];

    //             sourceDocRef.selection.select(selRegion);
    //             sourceDocRef.selection.copy(true);
    //             app.activeDocument = newDocRef;
    //             newDocRef.paste();

    //             exportFile(newDocRef, sourceDocPath, frameNumber);

    //             // Delete newly added layer since it's no longer needed
    //             var newDocLayersRef = newDocRef.layers;
    //             newDocLayersRef[0].remove();

    //             app.activeDocument = sourceDocRef;
    //           }
    //         }
    //         currentPage += 1;
    //       }
    //     }

    //     // Turn on display of all layers
    //     toggleLayers(app.activeDocument, 0, true);

    //     // Close the temporary document
    //     app.activeDocument = newDocRef;
    //     newDocRef.close(SaveOptions.DONOTSAVECHANGES);
    //   });
    // }

    // let shouldCopy = toggleLayers(0);
    // console.log('shouldCopy', shouldCopy);
    // shouldCopy = toggleLayers(1);
    // console.log('shouldCopy', shouldCopy);
    // shouldCopy = toggleLayers(2);
    // console.log('shouldCopy', shouldCopy);

    app.activeDocument.layers.forEach(async (layer, k) => {
      // console.log('k', k);
      // Copy layer contents if the layer's name starts with 'page-'
      const shouldCopyLayer = toggleLayers(app.activeDocument, k);
      // console.log('shouldCopyLayer', shouldCopyLayer);
      if (shouldCopyLayer) {
        // console.log('shouldCopyLayer', shouldCopyLayer);
        let x, y;
        for (let i = 0; i < rows; i++) {
          y = y0 + i * vStep;
          for (let j = 0; j < cols; j++) {
            const frameNumber = currentPage * rows * cols + i * cols + j + 1;
            x = x0 + j * hStep;
            // const selRegion = [
            //   [x, y],
            //   [x + wd, y],
            //   [x + wd, y + ht],
            //   [x, y + ht],
            //   [x, y],
            // ];
            console.log('x', x);

            // sourceDocRef.selection.select(selRegion);
            await sourceDocRef.selection.selectRectangle(
              {top: x, left: y, bottom: y + ht, right: x + wd},
              constants.SelectionType.REPLACE
            );
          

            sourceDocRef.selection.copy(true);
            // app.activeDocument = newDocRef;
            newDocRef.paste();

            // exportFile(newDocRef, sourceDocPath, frameNumber);

            // // Delete newly added layer since it's no longer needed
            // var newDocLayersRef = newDocRef.layers;
            // newDocLayersRef[0].remove();

            // app.activeDocument = sourceDocRef;
          }
        }
        currentPage += 1;
      }
    });

    // Turn on display of all layers
    toggleLayers(app.activeDocument, 0, true);
    console.log('--------');

    // Close the temporary document
    app.activeDocument = newDocRef;
    newDocRef.close(SaveOptions.DONOTSAVECHANGES);
  });
}

// function showLayerNames() {
//   const app = require('photoshop').app;
//   const allLayers = app.activeDocument.layers;
//   const allLayerNames = allLayers.map(
//     (layer) => `${layer.name} (${layer.opacity} %)`
//   );
//   const sortedNames = allLayerNames.sort((a, b) =>
//     a < b ? -1 : a > b ? 1 : 0
//   );
//   document.getElementById('layers').innerHTML = `
//       <ul>${sortedNames.map((name) => `<li>${name}</li>`).join('')}</ul>`;
// }

// document
//   .getElementById('btnPopulate')
//   .addEventListener('click', showLayerNames);

document.getElementById('btnRename').addEventListener('click', eyBroDoTheThing);
