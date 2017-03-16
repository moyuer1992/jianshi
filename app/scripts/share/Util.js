var util = {
  hexToRgb: function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex: function (r, g, b) {
    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  },

  getSpriteEntity: function () {
    var entities = [];
    return function (className, editor) {
      var Klass = eval(className);
      return entities[className] ? entities[className] : entities[className] = new Klass(editor);
    };
  }(),

  getInitialState: function (name) {
    return config[name + 'Map'][config.state[name + 'Index']].value;
  }
}