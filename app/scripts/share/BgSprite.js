class BgSprite {
  constructor (editor) {
    this.map = editor.map;
    this.style = editor.style;
    this.editor = editor;
    this.animating = false;
    this.options = {
      timeGap: 100,
      duration: 1000,
      entryLength: 100
    };
    this.width = this.editor.canvasNode.width;
    this.height = this.editor.canvasNode.height;
    this.ctx = this.editor.bgCtx;
    this.gl = this.editor.bgGl;
    this._t = 0.0;
    this.init();
  }

  init () {
  
  }

  update () {
    this.map = this.editor.map;
    this.style = this.editor.style;
    this.width = this.editor.canvasNode.width;
    this.height = this.editor.canvasNode.height;
    this.ctx = this.editor.bgCtx;
    this.gl = this.editor.bgGl;
  }

  drawStatic () {
  }

  drawFrame () {
  }

  advance (t) {
    var stop = true;
    return stop;
  }

  clear () {
  }
}
