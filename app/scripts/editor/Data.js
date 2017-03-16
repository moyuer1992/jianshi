class Data {
  constructor (editor, text) {
    this._content = [];
    this.editor = editor;
    this._lines = [];
    text && this.addContent(0, text);
  }

  addContent (index, text) {
    window._text = text
    for (var i = 0; i < text.length; i++) {
      this._content.splice(index, 0, text.charAt(i));
      index++;
    }
    this._lines = this._content.join('').split('\n');
  }

  deleteContent (index, length) {
    var text = this._content.splice(index - length, length);
    this._lines = this._content.join('').split('\n');
    return text.join('');
  }

  getContent (index, length) {
    if (arguments.length === 0) {
      return this._content.join();
    } else {
      return this._content.slice(index, index + length);
    }
  }

  getLength () {
    return this._content.length;
  }

  getLines () {
    return this._lines;
  }

  getLine (index) {
    return this._lines[index];
  }
}
