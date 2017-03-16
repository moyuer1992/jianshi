class Style {
  constructor (editor) {
    this.editor = editor;
    this.initDefaultStyle();
  }

  changeStyle (options) {
    var keys = Object.keys(options);
    for (var i = 0; i < keys.length; i++) {
      this[keys[i]] = options[keys[i]];

      if (keys[i] === 'textStyle') {
        this.changeTextStyle(options[keys[i]]);
      }

      if (keys[i] === 'background') {
        this.changeBgStyle(options[keys[i]]);
      }
    }

    if (this.editor.hiddenCanvas) {
      this.editor.hiddenCanvas.width = this.lineHeight();
      this.editor.hiddenCanvas.height = this.lineHeight();
    }
  }

  changeTextStyle (index) {
    this.editor.textSprite = util.getSpriteEntity(config.textStyleMap[index].Klass, this.editor);
    this.editor.textSprite.changeTextStyle(config.textStyleMap[index].style);
    config.animationMap = this.editor.textSprite.getAnimationMap();
    this.editor.textSprite.update();
  }

  changeBgStyle (index) {
    this.editor.bgSprite = util.getSpriteEntity(config.backgroundMap[index].Klass, this.editor);
    this.editor.bgSprite.update();
  }

  lineHeight () {
    return this.lineHeightRatio * this.fontSize;
  }

  initDefaultStyle () {
    this.changeStyle({
      textAlign: util.getInitialState('textAlign'),
      fontSize: util.getInitialState('fontSize'),
      lineHeightRatio: 1.2,
      textWeight: 800,
      padding: [80, 50, 50, 80],
      space: 20,
      animation: util.getInitialState('animation'),
      fontColor: util.getInitialState('fontColor')
    });
  }

  initSprites () {
    this.changeStyle({
      textStyle: util.getInitialState('textStyle'),
      background: util.getInitialState('background')
    })
  }
}
