var toolBar = {
  config: {
    isShown: false
  },

  init: function () {
    this.onChange = false;
    this.config.$dom.find('.tool-bar-item').each(function () {
      var classes = $(this).classes();
      var re = /i-(.*)/i;
      $(this).find('.value').append('<span class="spinner-icon"></span>');
      $(this).find('.spinner-icon').hide();

      classes.forEach(function (className) {
        if (re.test(className)) {
          var name = RegExp.$1;
          toolBar.update(name);
        }
      })
    });
    this.updateBgColor();
    this.bindEvents();
  },

  bindEvents: function () {
    var that = this;

    that.config.$dom.find('.tool-bar-item .value').on('click touchend', function (e) {
      var classes = $(this).parent().classes();
      var $el = $(this);
      var re = /i-(.*)/i;

      classes.forEach(function (className) {
        if (re.test(className)) {
          var name = RegExp.$1;
          if (!that[name + 'OnChange']) {
            $el.find('.spinner-icon').show();
            toolBar.changeStyle(name);
          }
        }
      })
    });

    that.config.$dom.find('.close-icon').on('touchend click', function (e) {
      that.hide(editor);
      bottomBar.config.$dom.find('.label').text('工具栏');
    });

    that.config.$dom.find('.color-switch').on('touchend click', function (e) {
      that.changeBgColor();
    });
  },

  hide: function (editor) {
    $('.wrapper').removeClass('show-tool-bar');
    $('.wrapper').addClass('hide-tool-bar');
    editor.hideToolBar();
    this.config.isShown = false;
  },

  show: function (editor) {
    if ($('.wrapper').hasClass('default')) {
      $('.wrapper').removeClass('default')
    } else {
      $('.wrapper').removeClass('hide-tool-bar');
    }
    $('.wrapper').addClass('show-tool-bar');
    editor.showToolBar();
    this.config.isShown = true;
  },

  nextIndex: function (name) {
    var index = config.state[name + 'Index'];
    var map = config[name + 'Map'];
    if (index < map.length - 1) {
      config.state[name + 'Index'] += 1;
    } else {
      config.state[name + 'Index'] = 0;
    }
    return config.state[name + 'Index'];
  },

  changeStyle: function (name) {
    var index = this.nextIndex(name);
    this.update(name);
  },

  update: function (name) {
    this[name + 'OnChange'] = true;
    var index = config.state[name + 'Index'];
    var style = config[name + 'Map'][index];
    var value = style.value;
    var label = style.label;
    var options = {};
    options[name] = value;
    $('.i-' + name + ' .value .text').text(label);

    var that = this;
    editor.style.changeStyle(options);

    if (this[name + 'Change'] && typeof(this[name + 'Change']) === 'function') {
      this[name + 'Change'].call(this, style);
    }

    editor.clearCanvas();
    editor.renderText();

    setTimeout(function (name, label) {
      that[name + 'OnChange'] = false;
      $('.i-' + name + ' .value .text').text(label);
      $('.i-' + name + ' .value .spinner-icon').hide();
    }, 500, name, label);
  },

  textStyleChange: function (style) {
    config.state['animationIndex'] = 0;
    this.update('animation');
  },

  backgroundChange: function (style) {
    var colors = style.colors;
    if (colors.length === 0) {
      $('.color-switch').hide();
      config.state.bgColorIndex = null;
    } else {
      $('.color-switch').css('background-color', colors[0]).show();
      config.state.bgColorIndex = 0;
    }
  },

  changeBgColor: function () {
    var colors = config.backgroundMap[config.state.backgroundIndex].colors;
    var index = config.state.bgColorIndex;
    index = index + 1 >= colors.length ? 0 : ++index;
    config.state.bgColorIndex = index;
    this.updateBgColor();
  },

  updateBgColor: function () {
    editor.renderText();
    var colors = config.backgroundMap[config.state.backgroundIndex].colors;
    var index = config.state.bgColorIndex;
    $('.color-switch').css('background-color', colors[index]);
  }
}

toolBar.config.$dom = $('.tool-bar-wrap');
