import React, { Component } from 'react';
import electron, { remote, ipcRenderer } from 'electron'
import Spinner from 'react-spinkit'
import glob from 'glob'
import moment from 'moment'
import fs from 'fs';
import path from 'path';

import styles from './project.scss';

class ProjectService {
  constructor() {
    this.files = [];
    this.folderPath = null;
    this.isLoading = false;
    this.updateCallback = null;
  }

  getFiles() {
    return this.files;
  }

  hasFiles() {
    return this.files.length > 0;
  }

  setIsLoading() {
    this.files = [];
    this.folderPath = null;
    this.isLoading = true;
    if (this.updateCallback) { this.updateCallback(); }
  }

  parseLocalProject(folderPath, files) {
    if (!files) { console.log("no files passed to ProjectService"); return; }

    // this is mostly for testing, i'm opening this project's folder
    // in the editor and don't want anything in node_modules to show up
    var trimmedFiles = files.filter(p => !p.includes("node_modules") && !p.includes("dist/"));
    // At this point all the [files] start with "/path/to/folderPath" so
    // let's trim them (and the leading '/' left over)
    trimmedFiles = trimmedFiles.map(p => p.substring(folderPath.length + 1));

    this.isLoading = false;
    this.files = trimmedFiles.map(f => { return { 'path': f, 'mtime': 0, statted: false }});
    this.folderPath = folderPath;

    this.getModifiedTimes();

    if (this.updateCallback) { this.updateCallback(); }
  }

  getModifiedTimes() {
    this.files.forEach((item, index) => {
      fs.stat(path.resolve(this.folderPath, item.path), (err, stats) => {
        // is it safe to assume files haven't been re-arranged since this was called?
        this.files[index].statted = true;
        this.files[index].mtime = stats.mtime;

        if (this.files.every(f => f.statted)) { this.allMetadataParsed() }
      });
    });
  }

  allMetadataParsed() {
    var sortedFiles = this.files;
    sortedFiles.sort((a, b) => {
      if (a.mtime < b.mtime)
        return 1;
      if (a.mtime > b.mtime)
        return -1;
      return 0;
    });

    if (this.updateCallback) { this.updateCallback(); }
  }

  setOnDataChangedCallback(callback) {
    this.updateCallback = callback;
  }
}

class ProjectManager extends Component {
  state = {
    service: new ProjectService()
  }

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.componentDidMount = () => { this.init() }
  }

  filesFound(folderPath, files) {
    if (!files) {
      console.log("no files found");
      return;
    }

    this.state.service.parseLocalProject(folderPath, files);
  }

  onChange(state) {
    this.setState(state);
  }

  init() {
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
        glob(folderPath + "/**/*\.+(md|markdown|js)", (er, files) => { this.filesFound(folderPath, files) });
        this.state.service.setIsLoading();
        //ipcRenderer.send('open-file', folderPath);
      });
    });

    // When the ProjectService updates we want to tell the React component to update too
    this.state.service.setOnDataChangedCallback(() => { this.onChange(this.state) });
  }

  render() {
    return (
    <div className={'openContainer'}>
      <div className={'sourceContainer'}>
        <strong>Open project from:</strong>
        <div id="source-buttons">
          <button id="btn-open-folder" className={'button button-outline'}>Folder</button>
          <button id="btn-open-ghost" className={'button button-outline'}>Ghost blog</button>
          <button id="btn-open-wordpress" className={'button button-outline'}>Wordpress blog</button>
        </div>
      </div>
      {this.state.service.isLoading &&
        <Spinner spinnerName="cube-grid" noFadeIn={true} />
      }
      {this.state.service.hasFiles() &&
      <div className={'files-container'}>
        <input type="text" id="searchBox" placeholder="File name" />
        <table id="files-table">
          <tbody>
          <tr>
            <th>Path</th><th>Last edited</th>
          </tr>
          {this.state.service.getFiles().map(function(item, i) {
            return (
              <tr key={i}><td>{item.path}</td><td>{item.mtime > 0 && moment(item.mtime.getTime()).fromNow()}</td></tr>
            )
          })}
          </tbody>
        </table>
      </div>
      }
    </div>
    )
  }
}

export default class App extends Component {
  render() {
    return (
      <ProjectManager />
    );
  }
}