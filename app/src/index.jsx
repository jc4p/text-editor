import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';

import Parchment from 'parchment';
import Quill from 'quill';
import DarkQuill, { InlineComment } from './darkquill';

import styles from './styles.less'

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
  }
  
  initQuill() {
    Quill.register('modules/darkQuill', DarkQuill);

    var editor = new Quill('#editor', {
      theme: 'snow',
      modules: {
        darkQuill: true
      }
    });

    var reactThis = this;
    let sidebarItems;
    editor.focus();
    editor.on('text-change', (delta, oldDelta, source) => {
      sidebarItems = [];
      let commentOps = editor.getContents().ops.filter(op => op.hasOwnProperty('attributes') && op.attributes.hasOwnProperty(InlineComment.blotName));
      commentOps.forEach(op => {
        sidebarItems.push({comment: op.attributes[InlineComment.blotName]});
      });
      reactThis.setState({metadata: sidebarItems});
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