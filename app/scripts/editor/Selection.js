class Selection {
  constructor (editor) {
    this.editor = editor;
    this.startColIndex = this.endColIndex = 0;
    this.startRowIndex = this.endRowIndex = 0;
  }

  getSelEndPosition () {
    return {
      colIndex: this.endColIndex,
      rowIndex: this.endRowIndex,
      index: this._convertIndexByMap(this.endRowIndex, this.endColIndex)
    }
  }

  getSelLength () {
    return 0;
  }

  update (startRowIndex, startColIndex, endRowIndex, endColIndex) {
    if (arguments.length === 1) {
      var index = arguments[0];
      if (index > this.editor.data.getLength() || index < 0) {
        return;
      }
      this.index = index;
      var pos = this._convertMapByIndex(index);
      this.startColIndex = this.endColIndex = pos.col;
      this.startRowIndex = this.endRowIndex = pos.row;
    } else if (arguments.length === 2) {
      this.startColIndex = this.endColIndex = startColIndex;
      this.startRowIndex = this.endRowIndex = startRowIndex;
    }
  }

  _convertIndexByMap (row, col) {
    var lines = this.editor.data.getLines();
    var index = 0;
    for (var i = 0; i < lines.length; i++) {
      if (i < row) {
        index += lines[i].length + 1;
      } else if (i === row) {
        index += col;
      }
    }
    return index;
  }

  _convertMapByIndex (index) {
    var lines = this.editor.data.getLines();
    var row = 0;
    var col = 0;

    for (var i = 0; i < lines.length; i++) {
      if (index > lines[i].length) {
        index -= (lines[i].length + 1);
        row++;
      } else {
        col = index;
        break;
      }
    }
    return {
      row: row,
      col: col
    };
  }
}
