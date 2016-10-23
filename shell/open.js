import electron, { remote, ipcRenderer } from 'electron'
import glob from 'glob'

var css = require("./open.scss");

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' || event.keyCode === 27) {
    var window = remote.getCurrentWindow();
    window.close();
  }
});

document.querySelector('#btn-open-folder').addEventListener('click', event => {
  event.preventDefault();
  remote.dialog.showOpenDialog(
    { properties: ['openDirectory'] }
  , folders => {
    if (!folders)
      return
    var folderPath = folders[0];
    glob(folderPath + "/**/*\.+(md|markdown|js)", (er, files) => {
      if (files)
        filesFound(files.filter(p => !p.includes("node_modules")));
      else
        console.log("No files found in selected path");
    });
    //ipcRenderer.send('open-file', folderPath);
  });
});

var filesFound = function(files) {
  console.log(files);
}