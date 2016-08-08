import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';
import { Editor, EditorState, ContentState, CompositeDecorator, Entity,
        convertFromRaw, convertToRaw } from 'draft-js';

import styles from './styles.less'

const defaultText = "When in the Course of human events[[i stole this tbh]], it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth [[lol can you imagine]], the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.[[also checkout http://butts.com]]";

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

class InlineNoteComponent extends Component {
  render() {
    return (
      <span className={styles.inlineNote}>{this.props.children}</span>
    );
  }
}

// #TODO: should it really be a <textarea> or just content-editable?
// #TODO: better names for the components!
class DETextArea extends Component {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      { strategy: noteStrategy, component: InlineNoteComponent }
    ]);

    this.state = {
      editorState: EditorState.createWithContent(ContentState.createFromText(defaultText), decorator),
      metadata: []
    }

    this.focusEditor = () => this.refs.mainEditor.focus();
    this.handleEditorChange = (editorState) => { this.setState({editorState}); this.updateSidebar(); };
    this.componentDidMount = () => this.updateSidebar();
  }

  updateSidebar() {
    // Go through any entities, if their data isn't extracted, extract it
    const blocks = this.state.editorState.getCurrentContent().getBlocksAsArray();
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return true
        },
        (start, end) => {
          console.log(start + ", " + end);
        }
      )
    }
  }

  render() {
    return (
      <div className={styles.editorRoot} onClick={this.focusEditor}>
        <div className={styles.editorContainer}>
          <Editor
            name="mainArea"
            ref="mainEditor"
            onChange={this.handleEditorChange}
            editorState={this.state.editorState}
            placeholder="Write something..."
            />
        </div>
        <CommentsSidebar
           items={this.state.metadata}
           />
      </div>
    );
  }
}

const noteRegex = /\[\[(.+?)\]\]/g;

function noteStrategy(contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = noteRegex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
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