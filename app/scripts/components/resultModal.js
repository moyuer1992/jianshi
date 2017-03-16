var resultModal = {
  config: {
    $dom: $('.export-result-modal')
  },

  init: function () {
    this.bindEvents();
  },

  bindEvents: function () {
    var that = this;
    that.config.$dom.find('.dim-layer').on('click touchend', function (e) {
      that.hide();
    });
  },

  show: function (imgData) {
    this.config.$dom.find('img').attr('src', imgData);
    this.config.$dom.addClass('show');
  },

  hide: function () {
    this.config.$dom.removeClass('show');
  }
}