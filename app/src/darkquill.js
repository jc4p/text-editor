import Quill from 'quill';
var Inline = Quill.import('blots/inline');

class InlineComment extends Inline {
  static create(value) {
    let node = super.create(value);
    node.dataset.comment = value;
    return node;
  }

  static formats(domNode) {
    return domNode.dataset.comment;
  }

  format(name, value) {
    if (name !== this.statics.blotName || !value) return super.format(name, value);
    this.domNode.dataset.comment = value;
  }
}
InlineComment.blotName = 'InlineComment';
InlineComment.tagName = 'sup';

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

function DarkQuill(quill, options) {
  Quill.register(InlineComment);

  var editor = quill;
  editor.on('text-change', (delta, oldDelta, source) => {
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
      });

      boldSearchStrategy(fullContents, (start, length, item) => {
        var currentFormat = editor.getFormat(start, length);
        if (currentFormat !== null && currentFormat.bold) {
          return;
        }
        editor.formatText(start, length, 'bold', true);
        editor.format('bold', false);
      });

      noteSearchStrategy(fullContents, (start, length, item) => {
        var currentFormat = editor.getFormat(start, length);
        if (currentFormat !== null && currentFormat.hasOwnProperty(InlineComment.blotName)) {
          return;
        }
        editor.formatText(start, length, InlineComment.blotName, item);
        editor.format(InlineComment.blotName, null);
      });
    });
}

export { InlineComment, DarkQuill as default };