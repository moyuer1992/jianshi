var initGlProgram = function ( gl, shaders ) {
  var program = gl.createProgram();
  for (var i = 0; i < shaders.length; i += 1) {
    gl.attachShader( program, shaders[ i ] );
  }
  gl.linkProgram( program );

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    window.console.error("failed to link: " + gl.getProgramInfoLog(program));
    return null;
  }
  return program;
};

var initGlShader = function ( gl, shaderScript, shaderType ) {
  var shader = gl.createShader( shaderType );
  gl.shaderSource( shader, shaderScript );
  gl.compileShader( shader );
  return shader;
};