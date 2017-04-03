var videoRecordingModal = {
  config: {},
  
  show: function () {
    this.config.$dom.addClass('show');
  },

  hide: function () {
    this.config.$dom.removeClass('show');
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

  setDownloadLink: function (url, filename) {
    this.config.$dom.find('.video-download').attr('href', url);
    this.config.$dom.find('.video-download').attr('download', filename);
  },

  changeStatus: function (status) {
    switch (status) {
      case 'recording':
        this.config.$dom.find('.video-download').hide();
        this.config.$dom.find('.recording-tip').show();
        break;
      case 'recorded':
        this.config.$dom.find('.video-download').show();
        this.config.$dom.find('.recording-tip').hide();
        break;
    }
  }
}

videoRecordingModal.config.$dom = $('.video-recording-modal');