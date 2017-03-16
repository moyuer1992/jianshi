;!(function ($) {
  $.fn.classes = function (callback) {
    var classes = [];
    $.each(this, function (i, v) {
      var splitClassName = v.className.split(/\s+/);
      for (var j = 0; j < splitClassName.length; j++) {
        var className = splitClassName[j];
        if (-1 === classes.indexOf(className)) {
            classes.push(className);
        }
      }
    });
    if ('function' === typeof callback) {
      for (var i in classes) {
        callback(classes[i]);
      }
    }
    return classes;
  };
})(jQuery);
