var bottomBar = {
  config: {
    $dom: $('.bottom-bar')
  },

  init: function () {
    this.bindEvents();
  },

  bindEvents: function () {
    var that = this;

    that.config.$dom.find('.export').on('click touchend', function (e) {
      selectModal.show();
    });

    that.config.$dom.find('.play').on('touchend click', function (e) {
      if ($(this).hasClass('stop')) {
        editor.stopPlay();
        $(this).removeClass('stop');
      } else {
        editor.play();
        $(this).addClass('stop');
      }
    });

    that.config.$dom.find('.tool').on('touchend click', function (e) {
      if (toolBar.config.isShown) {
        toolBar.hide(editor);
        $(this).find('.label').text('工具栏');
      } else {
        toolBar.show(editor);
        $(this).find('.label').text('隐藏');
      }
    });
  }
}