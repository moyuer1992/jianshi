class PureBgSprite extends BgSprite {
  constructor (editor) {
    super(editor);
  }

  drawStatic () {
    this.clear();
    var ctx = this.ctx;
    var color = config.backgroundMap[config.state.backgroundIndex].colors[config.state.bgColorIndex];
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  drawFrame () {
    this.drawStatic();
  }

  advance (t) {
    var stop = true;
    return stop;
  }

  clear () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
