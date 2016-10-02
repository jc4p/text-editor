import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';
import styles from './styles.less'

const noteRegex = /\[\[(.+?)\]\]/g;
const italicRegex = /_.+?_/g;
const boldRegex = /\*.+?\*/g;

function searchStrategy(regex, content, callback) {
  let text = content;
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, matchArr[0].length, matchArr[0]);
  }
}

function noteSearchStrategy(content, callback) {
  searchStrategy(noteRegex, content, callback);
}

function italicSearchStrategy(content, callback) {
  searchStrategy(italicRegex, content, callback);
}

function boldSearchStrategy(content, callback) {
  searchStrategy(boldRegex, content, callback);
}

// #TODO: Make this render a group of CommentsSideBarItem (or a better name!!!!)
// which then have on click listeners that change the main editor's focus (how??) to
// where the <sup>#</sup> is, then kill the entity and replace it with the raw [[text]]
// for editing. Save it all back up when cursor goes out of the [[..]] bounds? Sure.
var CommentsSidebar = React.createClass({
  render: function() {
    return (
      <div className={styles.sidebar}>
      <ol>
      {this.props.items.map(function(item, i) {
        return (
          <li key={i}>{item.comment}</li>
        )
      })}
      </ol>
      </div>
    );
  }
});

// #TODO: better names for the components!
class DETextArea extends Component {
  state = {
    metadata: []
  }

  constructor(props) {
    super(props);

    this.componentDidMount = () => { this.initQuill(); }
    this.handleBeforeInput = (chars) => { this.updateSidebar(); return false; }
  }
  
  initQuill() {
    var editor = new Quill('#editor', {
      theme: 'snow'
    });

    let reactThis = this;
    editor.on('text-change', function(delta, oldDelta, source) {
      var insertEvents = delta.ops.filter(op => op.hasOwnProperty('insert'));
      if (insertEvents.length === 0)
        return;

      var lastChar = insertEvents[insertEvents.length - 1].insert;
      var cursorIndex = editor.getSelection().index;
      var editorContents = editor.getContents(0, cursorIndex);
      var fullContents = editorContents.ops.map(op => op.insert).join("");

      italicSearchStrategy(fullContents, (start, length, item) => {
        var currentFormat = editor.getFormat(start, length);
        if (currentFormat !== null && currentFormat.italic) {
          return;
        }
        editor.formatText(start, length, 'italic', true);
        editor.format('italic', false);
      });

      boldSearchStrategy(fullContents, (start, length, item) => {
        var currentFormat = editor.getFormat(start, length);
        if (currentFormat !== null && currentFormat.bold) {
          return;
        }
        editor.formatText(start, length, 'bold', true);
        editor.format('bold', false);
      });

      var sidebarMetadata = reactThis.state.metadata;
      noteSearchStrategy(fullContents, (start, length, item) => {
        var noteObj = {comment: item, position: start, length: length};
        sidebarMetadata.forEach(n => {
          if (n.comment == noteObj.comment && n.position == noteObj.position)
            return;
        });
        sidebarMetadata.push(noteObj);
      });

      reactThis.setState({metadata: sidebarMetadata});
    });
  }

  render() {
    return (
      <div className={styles.editorRoot}>
        <div className={styles.editorContainer}>
          <div id="editor" className={styles.editorQuillContainer} />
        </div>
        <CommentsSidebar
           items={this.state.metadata}
           />
      </div>
    );
  }
}

export default class App extends Component {
  render() {
    return (
      <form className={styles.mainForm}>
        <DETextArea />
      </form>
    );
  }
}