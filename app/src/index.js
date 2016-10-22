import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';

import Parchment from 'parchment';
import Quill from 'quill';
import DarkQuill, { InlineComment } from './darkquill';

import styles from './styles.scss'

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

  onCommentsUpdated() {
    var comments = this.editor.getModule("darkQuill").comments.get();
    this.setState({metadata: comments});
  }
  
  initQuill() {
    Quill.register('modules/darkQuill', DarkQuill);

    this.editor = new Quill('#editor', {
      theme: 'snow',
      modules: {
        darkQuill: {
          onCommentsUpdated: () => { this.onCommentsUpdated(); }
        }
      }
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