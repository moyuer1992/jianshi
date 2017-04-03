class Editor {
  constructor (options) {
    this.options = {
      paddingLeft: 120,
      paddingRight: 120,
      paddingTop: 65,
      paddingBottom: 65,
      bottomBarHeight: 68
    }
    this.onFocus = false;
    this.isToolBarShown = false;
    this.toolBarWidth = 200;
    this.operations = [];
    this.init();
  }

  init () {
    this.createStyle();
    this.initData();
    this.selection = new Selection(this);
    this.createElements();
    this.bindEvents();
    this.createMap();
    this.style.initSprites();
  }

  resize () {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var $editor = $(this.editorNode);

    var width = windowWidth > 800 ? windowWidth - this.options.paddingLeft - this.options.paddingRight : windowWidth - 50;
    var height = windowWidth > 800 ? windowHeight - this.options.bottomBarHeight - this.options.paddingTop - this.options.paddingBottom : windowHeight - 135;
    $editor.css('width', width + 'px');
    $editor.css('height', height + 'px');
    $editor.css('top', (windowHeight - height - this.options.bottomBarHeight) / 2 + 'px');
    this.canvasNode.width = width;
    this.canvasNode.height = height;
    if (this.isToolBarShown && windowWidth > 800) {
      this.updateRelativeLocation((windowHeight - height - this.options.bottomBarHeight) / 2, this.toolBarWidth + (windowWidth - this.toolBarWidth - width) / 2);
    } else {
      this.updateRelativeLocation((windowHeight - height - 75) / 2, (windowWidth - width) / 2);
    }
    this.renderText()
  }

  showToolBar () {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var width = windowWidth > 800 ? windowWidth - this.options.paddingLeft - this.options.paddingRight : windowWidth - 50;
    var height = windowWidth > 800 ? windowHeight - this.options.bottomBarHeight - this.options.paddingTop - this.options.paddingBottom : windowHeight - 135;
    this.isToolBarShown = true;
    this.updateRelativeLocation((windowHeight - height - this.options.bottomBarHeight) / 2, this.toolBarWidth + (windowWidth - this.toolBarWidth - width) / 2);
  }

  hideToolBar () {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var width = windowWidth > 800 ? windowWidth - this.options.paddingLeft - this.options.paddingRight : windowWidth - 50;
    var height = windowWidth > 800 ? windowHeight - this.options.bottomBarHeight - this.options.paddingTop - this.options.paddingBottom : windowHeight - 135;
    this.isToolBarShown = false;
    this.updateRelativeLocation((windowHeight - height - this.options.bottomBarHeight) / 2, (windowWidth - width) / 2);
  }

  updateRelativeLocation (top, left) {
    this.top = top;
    this.left = left;
  }

  createStyle () {
    this.style = new Style(this);
  }

  createElements () {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var width = windowWidth > 800 ? windowWidth - this.options.paddingLeft - this.options.paddingRight : windowWidth - 50;
    var height = windowWidth > 800 ? windowHeight - this.options.bottomBarHeight - this.options.paddingTop - this.options.paddingBottom : windowHeight - 135;
    
    this.$editor = $('#editor');
    this.editorNode = this.$editor.get(0);

    this.$editor.css('overflow', 'hidden');
    this.$editor.css('position', 'relative');
    this.$editor.css('box-shadow', '1px 1px 3px 1px #bbb');
    this.$editor.css('margin', 'auto');
    this.$editor.css('width', width + 'px');
    this.$editor.css('height', height + 'px');
    this.$editor.css('top', (windowHeight - height - this.options.bottomBarHeight) / 2 + 'px');
    //this.$editor.css('background-color', 'rgba(217, 218, 214)');
    this.$editor.css('background-color', 'rgb(241, 240, 236)');

    this.hiddenCanvas = document.createElement('canvas');
    this.hiddenCtx = this.hiddenCanvas.getContext('2d');
    this.hiddenCanvas.width = this.style.lineHeight();
    this.hiddenCanvas.height = this.style.lineHeight();
    
    //for background canvas
    this.$bgCanvas = $('#bg-canvas');
    this.$bgGlcanvas = $('#bg-glcanvas');
    this.bgGlcanvasNode = this.$bgGlcanvas.get(0);
    this.bgCanvasNode = this.$bgCanvas.get(0);
    this.bgCtx = this.bgCanvasNode.getContext('2d');
    this.bgCanvasNode.width = width;
    this.bgCanvasNode.height = height;
    this.bgGlcanvasNode.width = width;
    this.bgGlcanvasNode.height = height;
    this.bgGl = this.bgGlcanvasNode.getContext('webgl', { preserveDrawingBuffer: true });

    //for text canvas
    this.$canvas = $('#text-canvas');
    this.$glcanvas = $('#text-glcanvas');
    this.glcanvasNode = this.$glcanvas.get(0);
    this.canvasNode = this.$canvas.get(0);
    this.ctx = this.canvasNode.getContext('2d');
    this.canvasNode.width = width;
    this.canvasNode.height = height;
    this.glcanvasNode.width = width;
    this.glcanvasNode.height = height;
    this.gl = this.glcanvasNode.getContext('webgl', { preserveDrawingBuffer: true });

    this.$input = $('<textarea>');
    this.inputNode = this.$input.get(0);

    this.$input.css('position', 'absolute');
    this.$input.css('top', (height / 5) + 'px');
    this.$input.css('left', (width / 2 - 100) + 'px');
    this.$input.css('width', width + 'px');
    this.$input.css('height', '1px');
    this.$input.css('z-index', '-1000');

    this.$editor.append(this.$input);

    this.$cursor = $('<div class="cursor"></div>');
    this.cursorNode = this.$cursor.get(0);
    this.$cursor.css('width', '1px');
    this.$cursor.css('height', this.style.lineHeight() + 'px');
    this.$cursor.css('position', 'absolute');
    this.$cursor.css('top', this.selection.rowIndex * this.style.lineHeight());
    this.$cursor.css('left', this.selection.colIndex * this.fontSize);
    this.$cursor.css('background-color', 'black');
    this.$editor.append(this.$cursor);
    this.hideCursor();
    
    this.updateRelativeLocation((windowHeight - height - this.options.bottomBarHeight) / 2, (windowWidth - width) / 2);
  }

  updateCursor () {
    var pos = this.selection.getSelEndPosition();
    this.$cursor.css('height', this.style.lineHeight() + 'px');
    this.$cursor.css('left', this.map[pos.rowIndex][pos.colIndex].cursorX + 'px');
    this.$cursor.css('top', this.map[pos.rowIndex][pos.colIndex].cursorY + 'px');
  }

  initData () {
    this.data = new Data(this);
  }

  bindEvents () {
    this.$input.on('change', this.onInputChange.bind(this));
    this.$input.on('focus', this.onInputFocus.bind(this));
    this.$input.on('blur', this.onInputBlur.bind(this));
    this.$input.on('keydown', this.onKeyDown.bind(this));
    this.$input.on('compositionstart', this.onCompStart.bind(this));
    this.$input.on('compositionend', this.onCompEnd.bind(this));
    this.$input.on('input', this.onInputChar.bind(this));
    this.$editor.on('touchstart', this.onTouchStart.bind(this));
    this.$editor.on('touchend', this.onTouchEnd.bind(this));
    this.$editor.on('mousedown', this.onMouseDown.bind(this));
    this.$editor.on('mouseup', this.onMouseUp.bind(this));
    $('body').on('click touchend', this.onGlobalClick.bind(this));
    $(window).on('resize', this.resize.bind(this));
    $(window).on('scroll', this.onScroll.bind(this));
  }

  findPosfromMap (x, y) {
    if (this.map.length === 0) {
      return {col: 0, row: 0};
    }

    var map = this.map;
    var startRow = 0;
    var endRow = this.map.length - 1;
    var row, col;
    var charLength = this.style.fontSize;
    var lineHeight = this.style.lineHeight();
    var pos = {row: 0, col: 0};

    for (row = 0; row < map.length; row++) {
      for (col = 0; col < map[row].length; col++) {
        if ( Math.abs(x - map[row][col].cursorX) < charLength / 2 && ( y > map[row][col].cursorY && y < map[row][col].cursorY + lineHeight ) ) {
          pos = {row: row, col: col};
          return pos;
        }
      }
    }

    return pos;
  }

  clearInputNodeValue () {
    this.inputNode.value = '';
  }

  onKeyDown (e) {
    switch (e.keyCode) {
      case 8:
        if (this.map[0].length <= 1 && this.map.length <= 1) {
          return;
        }
        this.deleteText(this.selection.getSelEndPosition().index, this.selection.getSelLength() || 1);
        this.clearInputNodeValue();
        this.selection.update(this.selection.getSelEndPosition().index - 1);
        this.renderText();
        break;
      case 37:
        this.selection.update(this.selection.getSelEndPosition().index - 1);
        this.updateCursor();
        break;
      case 38:
        
        break;
      case 39:
        this.selection.update(this.selection.getSelEndPosition().index + 1);
        this.updateCursor();
        break;
      case 40:

        break;
    }
  }

  insertText (index, text) {
    this.data.addContent(index, text);
    this.selection.update(index + text.length);
    this.operations.push({
      action: index >= this.data.getLength() ? 'add' : 'insert',
      index: index,
      text: text
    });
  }

  deleteText (index, length) {
    var text = this.data.deleteContent(index, length);
    this.operations.push({
      action: 'delete',
      index: index,
      text: text
    });
  }

  clearText () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  clearCanvas () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.bgCtx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.bgGl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  createMap () {
    this.map = [[{
      char: '',
      x: this.style.padding[3],
      y: this.style.padding[0],
      cursorX: this.style.textAlign === 'center' ? this.canvasNode.width / 2 : this.style.padding[3],
      cursorY: this.style.padding[0]
    }]]
  }

  _convertWindowPosToCanvas (x, y) {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var x2 = x - this.left;
    var y2 = y - this.top;

    if (x2 < 0 || x2 > this.canvasNode.width || y2 < 0 || y2 > this.canvasNode.height) {
      x2 = -1;
      y2 = -1;
    }

    return {
      x: x2,
      y: y2
    }
  }

  _convertCanvasPosToWindow (x, y) {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var x2 = x + this.left;
    var y2 = y + this.top;

    return {
      x: x2,
      y: y2
    }
  }

  onGlobalClick (e) {
    var pos = this._convertWindowPosToCanvas(e.clientX, e.clientY);

    if (pos.x === -1 && pos.y === -1) {
      this.blur();
    }
  }

  onInputChange (e) {
  }

  onInputBlur (e) {
    this.inputStatus = 'NULL';
  }

  onInputFocus (e) {
  }

  onCompStart (e) {
    this.inputStatus = 'CHINESE_TYPING';
  }

  onCompEnd (e) {
    var that = this;
    setTimeout(function () {
      that.input();
      that.inputStatus = 'CHINESE_TYPE_END';
    }, 100)
  }

  onInputChar (e) {
    if (this.inputStatus === 'CHINESE_TYPING') {
      return;
    }
    
    this.inputStatus = 'CHAR_TYPING';
    this.input();
  }

  onScroll (e) {
    this.touch = {};
    this.click = {};
  }

  input (e) {
    this.insertText(this.selection.getSelEndPosition().index, this.inputNode.value);
    this.clearInputNodeValue();
    this.renderText();
  }

  onMouseUp (e) {
    e.preventDefault();

    var that = this;

    if (this.click) {
      var pos = this._convertWindowPosToCanvas(e.clientX, e.clientY);
      if (pos.x !== -1 && pos.y !== -1) {
        this.focus(pos.x, pos.y);
      } else {
        this.blur();
      }
    }
    this.click = {}
  }

  onMouseDown (e) {
    this.click = {
      x: e.clientX, 
      y: e.clientY
    }
  }

  onTouchStart (e) {
    this.touch = e.touches[0]
  }

  onTouchEnd (e) {
    e.preventDefault();

    var that = this;

    if (this.touch) {
      var pos = this._convertWindowPosToCanvas(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      if (pos.x !== -1 && pos.y !== -1) {
        this.focus(pos.x, pos.y);
      } else {
        this.blur();
      }
    }
    this.touch = {}
  }

  hideCursor () {
    this.$cursor.css('visibility', 'hidden');
  }

  blur () {
    this.hideCursor();
    this.inputNode.blur();
    this.onFocus = false;
  }

  focus (x, y) {
    var pos = this.findPosfromMap(x, y);
    this.selection.update(pos.row, pos.col);
    this.updateCursor();
    this.$input.focus();
    this.$cursor.css('visibility', 'visible');
    this.onFocus = true;
  }

  updateMap (map) {
    this.map = map;
  }

  measureStrLength (str) {
    var length = 0;
    var chars = str.split('');
    chars.forEach(function (char) {
      if (char) {
        var code = char.charCodeAt(0);
        if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
          length += 0.5;
        } else {
          length += 1;
        }
      }
    });

    return length;
  }

  renderText () {
    this.bgSprite.drawStatic();

    var xCursor = this.style.padding[3];
    var yCursor = this.style.padding[0];
    var map = [];
    var lines = this.data.getLines();

    if (lines.length === 0) {
      lines.push('');
    }
    
    this.ctx.font = this.style.fontSize + "px serif";
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    switch (this.style.textAlign) {
      case 'left':
        for (var i = 0; i < lines.length; i++) {
          var lineMap = [];
          var charLength = this.style.fontSize;
          xCursor = this.style.padding[3];

          var chars = lines[i].split('');
          lineMap.push({
            char: '',
            x: xCursor,
            y: yCursor,
            cursorX: xCursor,
            cursorY: yCursor
          })
          for (var j = 0; j < chars.length; j++) {
            var charGap = charLength;
            xCursor += charLength;
            lineMap.push({
              char: chars[j],
              x: xCursor - charGap,
              y: yCursor,
              cursorX: xCursor,
              cursorY: yCursor
            })
            if ((j + 1 < chars.length) && (xCursor + charGap > this.canvasNode.width - this.style.padding[1] - this.style.padding[3])) {
              yCursor += this.style.lineHeight();
              xCursor = this.style.padding[3];
            }
          }
          map.push(lineMap);
          yCursor += this.style.lineHeight();
          yCursor += this.style.space;
        }
        break;
      case 'center':
        for (var i = 0; i < lines.length; i++) {
          var lineMap = [];
          var chars = lines[i].split('');
          var charLength = this.style.fontSize; //this.ctx.measureText(chars[j]).width;
          var length = charLength * chars.length;//this.measureStrLength(lines[i]);//this.ctx.measureText(lines[i]).width;
          
          if (length > (this.canvasNode.width - this.style.padding[0] - this.style.padding[3])) {
            xCursor = this.style.padding[3];
          } else {
            xCursor = ((this.canvasNode.width - this.style.padding[0] - this.style.padding[3]) - length) / 2 + this.style.padding[3]; 
          }
          lineMap.push({
            char: '',
            x: xCursor,
            y: yCursor,
            cursorX: xCursor,
            cursorY: yCursor
          })

          while (length > (this.canvasNode.width - this.style.padding[0] - this.style.padding[3])) {
            xCursor = this.style.padding[3];
            for (var j = 0; j < chars.length; j++) {
              var charGap = charLength;// * this.measureStrLength(chars[j]);
              xCursor += charGap;
              lineMap.push({
                char: chars[j],
                x: xCursor - charGap,
                y: yCursor,
                cursorX: xCursor,
                cursorY: yCursor
              })
              if ((j + 1 < chars.length) && (xCursor + charGap > this.canvasNode.width - this.style.padding[1])) {
                yCursor += this.style.lineHeight();
                chars.splice(0, j + 1);
                length = charLength * chars.length;//maersureStrLength(chars.join(''));
                break;
              }
            }
          }
          
          if (length) {
            xCursor = ((this.canvasNode.width - this.style.padding[0] - this.style.padding[3]) - length) / 2 + this.style.padding[3];
            for (j = 0; j < chars.length; j++) {
              var charGap = charLength;// * this.measureStrLength(chars[j]);
              xCursor += charGap;
              lineMap.push({
                char: chars[j],
                x: xCursor - charGap,
                y: yCursor,
                cursorX: xCursor,
                cursorY: yCursor
              })
            }
          }

          map.push(lineMap);
          yCursor += this.style.lineHeight();
          yCursor += this.style.space;
        }
        break;
    }
    this.updateMap(map);
    this.textSprite.update();
    this._fillText();
    this.updateCursor();
  }

  _fillText () {
    if (this.map.length === 1 && this.map[0].length === 1) {
      this.textSprite.clear();
    } else {
      setTimeout(this.textSprite.drawStatic.bind(this.textSprite), 10);
    }
  }

  play () {
    this.animating = true;
    this.animationInfo = {
      textStop: false,
      bgStop: false
    };
    this.startTime = Date.now();
    this.textSprite.update();
    this.bgSprite.update();

    window.requestAnimationFrame(this.tick.bind(this));
  }

  tick () {
    if (!this.animating) {
      return;
    }

    var t = Date.now() - this.startTime;
    !this.animationInfo.textStop && (this.animationInfo.textStop = this.textSprite.advance(t));
    !this.animationInfo.bgStop && (this.animationInfo.bgStop = this.bgSprite.advance(t));
    
    if (this.animationInfo.textStop && this.animationInfo.bgStop) {
      this.stopPlay();
    } else {
      this.animationInfo.bgStop ? this.bgSprite.drawStatic() : this.bgSprite.drawFrame();
      this.animationInfo.textStop ? this.textSprite.drawStatic() : this.textSprite.drawFrame();
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }

  recordTick (imgs, resolve, reject) {
    if (!this.animating) {
      return;
    }

    var t = Date.now() - this.startTime;
    !this.animationInfo.textStop && (this.animationInfo.textStop = this.textSprite.advance(t));
    !this.animationInfo.bgStop && (this.animationInfo.bgStop = this.bgSprite.advance(t));
    
    if (this.animationInfo.textStop && this.animationInfo.bgStop) {
      this.stopPlay();
      imgs.push(this.generatePng());
      $.ajax({
        url: '/video/record',
        data: imgs.join(' '),
        method: 'POST',
        contentType: 'text/plain',
        success: function (data, textStatus, jqXHR) {
          resolve(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          reject(errorThrown);
        }
      });

    } else {
      this.animationInfo.bgStop ? this.bgSprite.drawStatic() : this.bgSprite.drawFrame();
      this.animationInfo.textStop ? this.textSprite.drawStatic() : this.textSprite.drawFrame();
      imgs.push(this.generatePng());
      window.requestAnimationFrame(this.recordTick.bind(this, imgs, resolve, reject));
    }
  }

  stopPlay () {
    this.animating = false;
    this.renderText();
    bottomBar.config.$dom.find('.play').removeClass('stop');
  }

  generateGif () {
    
  }

  generateVideo () {
    var that = this;
    return new Promise (
      function (resolve, reject) {
        var imgs = [];
        that.animating = true;
        that.animationInfo = {
          textStop: false,
          bgStop: false
        };
        that.startTime = Date.now();
        that.textSprite.update();
        that.bgSprite.update();

        window.requestAnimationFrame(that.recordTick.bind(that, imgs, resolve, reject));
      }
    )
  }

  generateJpeg () {
    var canvas = document.createElement('canvas');
    canvas.width = this.canvasNode.width;
    canvas.height = this.canvasNode.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(this.bgCanvasNode, 0, 0);
    ctx.drawImage(this.bgGlcanvasNode, 0, 0);
    ctx.drawImage(this.canvasNode, 0, 0);
    ctx.drawImage(this.glcanvasNode, 0, 0);

    var imgData = canvas.toDataURL("image/jpeg", 1.0);
    return imgData;
  }

  generatePng () {
    var canvas = document.createElement('canvas');
    canvas.width = this.canvasNode.width;
    canvas.height = this.canvasNode.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(this.bgCanvasNode, 0, 0);
    ctx.drawImage(this.bgGlcanvasNode, 0, 0);
    ctx.drawImage(this.canvasNode, 0, 0);
    ctx.drawImage(this.glcanvasNode, 0, 0);

    var imgData = canvas.toDataURL("image/png");
    return imgData;
  }
}
