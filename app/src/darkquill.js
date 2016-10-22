import styles from './styles.less'
import Quill from 'quill';

const Parchment = Quill.import('parchment');
const Inline = Quill.import('blots/inline');
const Code = Quill.import('formats/code');
const randomstring = require('randomstring');

class InlineComment extends Inline {
  static create(value) {
    let node = super.create(value);
    node.dataset.comment = value.comment;
    node.dataset.commentId = value.id;
    node.classList.add(styles.inlineNote);
    return node;
  }

  static formats(domNode) {
    return domNode.dataset.commentId;
  }

  format(name, value) {
    if (name !== this.statics.blotName || !value) return super.format(name, value);
    this.domNode.dataset.comment = value.comment;
    this.domNode.dataset.commentId = value.id;
  }
}
InlineComment.blotName = 'InlineComment';
InlineComment.tagName = 'sup';

class CommentContainer {
  constructor(comment) {
    this.comment = comment;
    this.id = randomstring.generate(8);
    this.index = -1;
  }
}

class CommentStore {
  constructor() {
    this.comments = [];
  }

  add(comment) {
    this.comments.push(comment);
    this.sort();
  }

  // Sorts the comments in the array based on their position
  // in the text editor
  sort() {
    // use the cursor to find the Parchment instance
    const blot = Parchment.find(document.getSelection().getRangeAt(0).startContainer.parentNode);
    let block = blot;
    // find the top level block
    while (block.statics.blotName !== 'block' && block.parent) { block = block.parent }
    const rootBlot = block.parent;
    const commentBlots = rootBlot.descendants(Parchment.query("InlineComment"));

    // Go through the blots to set the indexes on our side and
    // the inline # indicators on the Quill side
    commentBlots.forEach((commentBlot, blotIndex) => {
      this.getById(commentBlot.domNode.dataset.commentId).index = blotIndex;
      commentBlot.domNode.textContent = `${blotIndex + 1}`;
    });
    // then sort our comments list
    this.comments.sort((a, b) => {
      if (a.index < b.index)
        return -1;
      if (a.index > b.index)
        return 1;
      if (a.index == b.index)
        return 0;
    });
  }

  get() {
    return this.comments;
  }

  getById(commentId) {
    return this.comments.find((comment) => comment.id == commentId);
  }
}

const noteRegex = /\[\[(.+?)\]\]/g;
const italicRegex = /_.+?_/g;
const boldRegex = /\*\*.+?\*\*/g;
const codeRegex = /`.+?`/g;
const headerRegex = /^#{1,6}/gm;

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

function codeSearchStrategy(content, callback) {
  searchStrategy(codeRegex, content, callback);
}

function headerSearchStrategy(content, callback) {
  searchStrategy(headerRegex, content, callback);
}

class DarkQuill {
  constructor(quill, options) {
    Quill.register(InlineComment);

    this.comments = new CommentStore();
    this.quill = quill;
    let editor = this.quill;
    var commentsUpdatedCallback = options.onCommentsUpdated;
    editor.on('text-change', (delta, oldDelta, source) => {
      // debounce all event listener callbacks to deal with timing issues (this
      // event listener is called mid-event listener consumptions, not after)
      window.setTimeout(() => {
        var insertEvents = delta.ops.filter(op => op.hasOwnProperty('insert'));
        if (insertEvents.length === 0 || editor.getSelection() === null)
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
          editor.deleteText(start, 1);
          editor.deleteText(start + length - 2, 1);
        });

        boldSearchStrategy(fullContents, (start, length, item) => {
          var currentFormat = editor.getFormat(start, length);
          if (currentFormat !== null && currentFormat.bold) {
            return;
          }
          editor.formatText(start, length, 'bold', true);
          editor.format('bold', false);
          editor.deleteText(start, 2);
          editor.deleteText(start + length - 4, 2);
        });

        codeSearchStrategy(fullContents, (start, length, item) => {
          var currentFormat = editor.getFormat(start, length);
          if (currentFormat !== null && currentFormat.bold) return;
          editor.formatText(start, length, Code.blotName, true);
          editor.format(Code.blotName, false);
          editor.deleteText(start, 1);
          editor.deleteText(start + length - 2, 1);
        });

        headerSearchStrategy(fullContents, (start, length, item) => {
          var currentFormat = editor.getFormat(start, length);
          if (currentFormat !== null && currentFormat.header) {
            return;
          }
          var levelCount = 0;
          item.forEach((chr, indx) => {
            if (indx != 0 && item[indx - 1] === '#') return;
            if (chr === '#')
              levelCount += 1;
          });
          editor.deleteText(start, length);
          // #TODO: How to do H1 vs H6?
          editor.format('header', true);
        });

        noteSearchStrategy(fullContents, (start, length, item) => {
          var currentFormat = editor.getFormat(start, length);
          if (currentFormat !== null && currentFormat.hasOwnProperty(InlineComment.blotName)) {
            return;
          }
          var comment = new CommentContainer(item.substring(2, length - 2));
          editor.deleteText(start, length);
          editor.insertText(start, '1');
          editor.setSelection(start + 2, 0);
          editor.formatText(start, 1, InlineComment.blotName, comment);
          editor.format(InlineComment.blotName, null);
          editor.insertText(start + 1, ' ');
          this.comments.add(comment);
          if (commentsUpdatedCallback) {
            commentsUpdatedCallback();
          }
        });
      }, 1);
      });
  }
}

export { InlineComment, DarkQuill as default };