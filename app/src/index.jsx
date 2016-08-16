import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';
import { Editor, EditorState, ContentState, SelectionState, 
        CompositeDecorator, Entity, Modifier,
        convertFromRaw, convertToRaw } from 'draft-js';

import styles from './styles.less'

const defaultText = "When in the Course of human events[[i stole this tbh]], it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth [[lol can you imagine]], the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation[[also checkout http://butts.com]].";

const noteRegex = /\[\[(.+?)\]\]/g;

function noteSearchStrategy(contentBlock, callback) {
  let text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = noteRegex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length, matchArr[1]);
    text = contentBlock.getText();
  }
}

function findNoteEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        Entity.get(entityKey).getType() === 'NOTE'
      );
    },
    (start, end) => {
      callback(start, end)
    }
  );
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

class InlineNoteComponent extends Component {
  render() {
    return (
      <span className={styles.inlineNote}><sup>{this.props.children}</sup></span>
    );
  }
}

// #TODO: better names for the components!
class DETextArea extends Component {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      { strategy: findNoteEntities, component: InlineNoteComponent }
    ]);

    this.state = {
      editorState: EditorState.createWithContent(ContentState.createFromText(defaultText), decorator),
      metadata: []
    }

    this.focusEditor = () => this.refs.mainEditor.focus();
    this.handleEditorChange = (editorState) => this.setState({editorState});
    this.componentDidMount = () => this.updateSidebar();
    this.handleBeforeInput = (chars) => { this.updateSidebar(); return false; }
  }

  updateSidebar() {
    var blockMap = this.state.editorState.getCurrentContent().getBlockMap();
    var content = this.state.editorState.getCurrentContent();
    var sidebarMetadata = this.state.metadata;
    var ourTextDelta = 0;
    var noteNum = 1;

    // We want to go through all blocks of text and replace all occurences of 
    // [[this is a comment]] with just a single char ('1') and a NOTE entity
    // attached which then holds the actual comment. The entity handles rendering
    // the '1' as <sup>1</sup.
    // 
    // Because we're replacing in-line while iterating through the content of
    // the block, the ranges sent from our searcher algorithm aren't trustable.
    // If we have more than 1 result, the 2nd result's start and end position
    // will be offset by the difference between the original text and our replacements
    // which is doing "[[comment]]" --> " " so the diff is the "[[..]]" thing's length -1
    blockMap.forEach(function (item) {
      var block = item;
      noteSearchStrategy(block, (start, end, text) => {
        var startIndex = start - ourTextDelta;
        var endIndex = end - ourTextDelta;

        var noteNum = sidebarMetadata.length + 1;
        sidebarMetadata.push({comment: text, position: startIndex});

        const previousEntity = block.getEntityAt(startIndex);
        var entityKey = Entity.create('NOTE', 'IMMUTABLE', {note: text, number: noteNum});
        var selectionState = SelectionState.createEmpty(block.getKey());
        var actualSelection = selectionState.merge({
          focusKey: block.getKey(),
          focusOffset: endIndex,
          anchorOffset: startIndex
        });
        content = Modifier.replaceText(content, actualSelection, '' + noteNum, null, entityKey);

        // See note above. we wanna get 1 minus the length of text + "[[" and "]]" so...
        ourTextDelta += text.length + 3;
      });
    });
    let updatedState = EditorState.push(this.state.editorState, content, 'apply-entity');
    this.setState({editorState: updatedState, metadata: sidebarMetadata});
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
            handleBeforeInput={this.handleBeforeInput}
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

export default class App extends Component {
  render() {
    return (
      <form className={styles.mainForm}>
        <DETextArea />
      </form>
    );
  }
}