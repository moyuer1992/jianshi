class TextSprite {
  constructor (editor, options) {
    this.map = editor.map;
    this.style = editor.style;
    this.editor = editor;
    this.animating = false;
    this.textStyle = 1;
    this.options = options || {
      timeGap: 100,
      duration: 2000,
      entryLength: 100
    };
    this.ctx = this.editor.ctx;
    this.gl = this.editor.gl;
    this.animationStyle = 0;
    this._t = 0.0;
    this.init();
  }

  init () {
    this.clearArea = [0, 0, this.editor.ctx.canvas.width, this.editor.ctx.canvas.height];
  }

  changeOptions (options) {
    Object.keys(options).forEach(function (key) {
      this.options[key] = options[key];
    });
  }

  changeTextStyle (style) {
    this.textStyle = style;
  }

  update () {
    this.map = this.editor.map;
    this.style = this.editor.style;
    this.startTime = Date.now();
  }

  drawStatic () {

  }

  drawFrame () {

  }

  advance (t) {
    var stop = true;
    if (stop) {
      this.stop();
    }
    return stop;
  }

  stop () {
    this._t = 0;
    this.animating = false;
  }

  getAnimationMap () {
    if (!this.animationMap) {
      this.animationMap = [
        {
          label: '无',
          value: 0
        }
      ];
    }
    return this.animationMap;
  }

  clear (useScissor) {
    if (useScissor) {
      if (!this.clearArea.length) {
        return;
      }
      this.editor.ctx.clearRect(this.clearArea[0], this.clearArea[1], this.clearArea[2], this.clearArea[3]);
    }
    this.editor.ctx.clearRect(0, 0, this.editor.ctx.canvas.width, this.editor.ctx.canvas.height);
  }
}
