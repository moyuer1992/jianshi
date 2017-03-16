var selectModal = {
  config: {
    $dom: $('.export-select-modal'),
    selection: 'jpeg'
  },

  init: function () {
    this.bindEvents();
  },

  bindEvents: function () {
    var that = this;

    that.config.$dom.find('.item').on('click touchend', function (e) {
      that.config.selection = $(this).text().toLowerCase();
      that.config.$dom.find('.item').removeClass('active');
      $(this).addClass('active');
    });

    that.config.$dom.find('.confirm').on('click touchend', function (e) {
      that.hide();
      that.export(that.config.selection);
    });

    that.config.$dom.find('.cancel').on('click touchend', function (e) {
      that.hide();
    });
  },

  show: function () {
    this.config.$dom.addClass('show');
  },

  hide: function () {
    this.config.$dom.removeClass('show');
  },

  export: function (option) {
    var imgData;
    switch (option) {
      case 'jpeg':
        imgData = editor.generateJpeg();
        resultModal.show(imgData);
        break;
      case 'png':
        imgData = editor.generatePng();
        resultModal.show(imgData);
        break;
      case 'gif':
        editor.generateGif().then(function (imgData) {
          resultModal.show(imgData);
        });
        break;
    }
  }
}