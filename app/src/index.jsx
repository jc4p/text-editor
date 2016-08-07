import React, { Component } from 'react';
import electron, { ipcRenderer } from 'electron';
import moment from 'moment';

import styles from './styles.less'

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

// #TODO: should it really be a <textarea> or just content-editable?
// #TODO: better names for the components!
var DETextArea = React.createClass({
  getInitialState: function() {
    return {
      text: "When in the Course of human events[[i stole this tbh]], it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth [[lol can you imagine]], the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.",
      metadata: [],
    };
  },
  componentDidMount: function() {
    this.updateMetadata()
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value })
    this.updateMetadata()
  },
  updateMetadata: function() {
    // #TODO: uhh is this rebuilding the regex each time? who knows!
    var sidebarSearch = /\[\[(.+?)\]\]/g;
    // no reason to be rebuilding with each key input but ok for now i guess
    var metadata = [];
    var match = sidebarSearch.exec(this.state.text);

    while (match != null) {
      metadata.push({
        comment: match[1]
      })

      match = sidebarSearch.exec(this.state.text);
    }

    this.setState({metadata: metadata});
  },
  render: function() {
    return (
      <div className={styles.editorContainer}>
        <textarea
          name="mainArea"
          className={styles.mdTextArea}
          onChange={this.handleTextChange}
          value={this.state.text}
          />
        <CommentsSidebar
          items={this.state.metadata}
          />
      </div>
    );
  }
})

export default class App extends Component {
  render() {
    return (
      <form className={styles.mainForm}>
        <DETextArea />
      </form>
    );
  }
}