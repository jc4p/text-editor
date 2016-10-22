const electron = require('electron')
const remote = electron.remote
require("./open.scss");

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.keyCode === 27) {
        var window = remote.getCurrentWindow();
        window.close();
    }
});