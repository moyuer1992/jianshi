class GlTextSprite extends TextSprite {
  constructor (editor, options) {
    super(editor, options);
  }

  init () {
    super.init();
    this.canvas = this.editor.glcanvasNode;
    this.dataMap = {};
    this.initGl();
  }

  update () {
    super.update();
    this._finish = false;
    this.clearArea = [0, 0, this.canvas.width, this.canvas.height];
  }

  parseData () {
    var map = this.map;
    for (var i = 0; i < map.length; i++) {
      for (var j = 0; j < map[i].length; j++) {
        if (map[i][j].char && map[i][j].char !== ' ') {
          var data = this.getTextData(map[i][j].char);
          map[i][j].data = data;
        }
      }
    }
    $('.render-tip').removeClass('show');
  }

  getTextData (char) {
    var font = this.style.font;
    var data;
    
    if (!this.dataMap[font]) {
      this.dataMap[font] = {};
    }

    if (Object.keys(this.dataMap[font]).indexOf(char) === -1) {
      var size = 200;
      data = makeTextData(char, size, {
        thick: 0.1,
        font: font
      });
      data = parseArr(data, size);
      this.dataMap[font][char] = data;
    } else {
      data = this.dataMap[font][char];
    }
    return data;
  }

  drawStatic () {
    var ctx = this.editor.ctx;
    var map = this.map;

    this.parseData();
    this.clear();

    for (var i = 0; i < map.length; i++) {
      for (var j = 0; j < map[i].length; j++) {
        if (map[i][j].char && map[i][j].char !== ' ') {
          var data = map[i][j].data;
          this.renderGlText(data, {
            pos: {
              x: map[i][j].x + this.editor.style.fontSize / 2, 
              y: map[i][j].y + this.style.lineHeight() / 2
            }, 
            fontSize: this.style.fontSize,
            fontColor: this.style.fontColor,
            textStyle: this.textStyle,
            t: 1.0
          });
        }
      }
    }
  }

  drawFrame () {
    switch (this.style.animation) {
      case 0:
        var map = this.map;
        var fontSize = this.editor.style.fontSize;
        var gl = this.gl;
        var finish = true;

        this.clear(true);

        for (var i = 0; i < map.length; i++) {
          for (var j = 0; j < map[i].length; j++) {
            if (map[i][j].char && map[i][j].char !== ' ') {
              var data = map[i][j].data;
              var period = this.t;
              var t = 0;

              if (Math.floor(period / 1000) < i) {
                map[i][j].finish = -1;
                finish = false;
              } else if (Math.floor(period / 1000) === i) {
                map[i][j].finish = 0;
                finish = false;
                t = (period % 1000) / 1000;
              } else if (Math.floor(period / 1000) > i) {
                t = 1.0;
                if (map[i][j].finish) {
                  map[i][j].finish += 1;
                  this.clearArea = [0, 0, this.canvas.width, this.canvas.height - (map[i][j].y + this.style.lineHeight())];
                } else {
                  finish = false;
                  map[i][j].finish = 1;
                }
              }

              if (map[i][j].finish >= 0 && map[i][j].finish <= 2) {
                var pos = {
                  x: map[i][j].x + this.editor.style.fontSize / 2, 
                  y: map[i][j].y + this.style.lineHeight() / 2
                };
                this.renderGlText(data, {
                  pos: pos, 
                  fontSize: fontSize,
                  fontColor: this.style.fontColor,
                  textStyle: this.textStyle,
                  t: t
                });
              }
            }
          }
        }

        this._finish = finish;
        break;
      case 1:
        this.drawStatic();
        break;
    }
  }

  advance (t) {
    var stop = false;
    this.t = t;

    switch (this.style.animation) {
      case 0:
        stop = this._finish;
        break
      case 1:
        stop = true;
        break;
    }

    if (stop) {
      this.stop();
    }

    return stop;
  }

  stop () {
    this._t = 0;
    this.animating = false;
    this.clearArea = [0, 0, this.canvas.width, this.canvas.height];
  }

  getAnimationMap () {
    if (!this.animationMap) {
      this.animationMap = [
        {
          label: '纵横捭阖',
          value: 0
        },
        {
          label: '无',
          value: 1
        }
      ];
    }
    return this.animationMap;
  }

  initGl () {
    var gl = this.gl;

    this.vertexShader = initGlShader( gl,
      `attribute vec3 vPosition;
      attribute vec4 vNormal;
      attribute float compIdx;

      varying vec4 fColor;

      uniform float t;
      uniform float compNum;
      uniform int style;
      uniform vec3 vColor;

      uniform vec4 ambientProduct, diffuseProduct, specularProduct;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform vec4 lightPosition;
      uniform float shininess;
      uniform mat3 normalMatrix;

      void main() {
        float n = (1.0 - t) * pow((1.0 + compIdx) / compNum, 2.0);
        float xx = vPosition.x - vPosition.x * pow(n, 0.5);
        float yy = vPosition.y - 2.0 * vPosition.y * pow(n, 2.0);
        float zz = vPosition.z - pow(n, 0.5);
        float ww = 1.0;
        
        vec4 aPosition = vec4(xx, yy, zz, ww);
        vec3 pos = (modelViewMatrix * aPosition).xyz;

        vec3 L;
        
        if(lightPosition.w == 0.0) 
          L = normalize(lightPosition.xyz);
        else 
          L = normalize( lightPosition.xyz - pos );

        vec3 E = -normalize( pos );
        vec3 H = normalize( L + E );
        vec3 N = normalize( normalMatrix*vNormal.xyz);

        vec4 ambient = vec4(vColor, 1.0);

        float Kd = max( dot(L, N), 0.0 );
        vec4  diffuse = Kd*diffuseProduct;

        float Ks = pow( max(dot(N, H), 0.0), shininess );
        vec4  specular = Ks * specularProduct;
        
        if( dot(L, N) < 0.0 ) {
          specular = vec4(0.0, 0.0, 0.0, 1.0);
        }

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * aPosition;

        if (style == 1) {
          if (dot(N, L) < 0.0) {
            fColor = vec4(vColor, 1.0);
          } else if (dot(N, L) < 0.8) {
            fColor = vec4(0.0, 0.0, 0.0, 0.0);
          } else {
            fColor = vec4(vColor, 1.0);
          }
        } else if (style == 2) {
          fColor = ambient + diffuse +specular;
        }
      }`, gl.VERTEX_SHADER);

    this.fragmentShader = initGlShader(gl,
      `precision mediump float;

      varying vec4 fColor;

      void main() {
        gl_FragColor = fColor;
      }`, gl.FRAGMENT_SHADER);
    
    this.program = initGlProgram(gl, [this.vertexShader, this.fragmentShader]);
  }

  renderGlText (data, options) {
    var pos = options.pos;
    var fontSize = options.fontSize;
    var fontColor = hexToRgb(options.fontColor);
    var textStyle = options.textStyle;
    fontColor = vec3(fontColor.r / 255, fontColor.g / 255, fontColor.b / 255);

    var t = options.t;

    if (t === 0) {
      return;
    }

    var gl = this.gl;
    var program = this.program;

    var pointsArray = [];
    var normalsArray = [];
    var colorArray = [];
    var compIdxArray = [];

    var near = -10;
    var far = 10;
    var radius = 1.5;
    var theta  = 0.7;
    var phi    = 0.1;
    var dr = 5.0 * Math.PI/180.0;

    var left = -3.0;
    var right = 3.0;
    var ytop =3.0;
    var bottom = -3.0;

    var lightPosition = vec4( 1.0, 1.0, 1.0, 0.0 );
    var lightAmbient = vec4( 0.5, 0.5, 0.5, 1.0 );
    var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

    var materialAmbient = vec4( 0.5, 0.5, 0.5, 1.0 );
    var materialDiffuse = vec4( 0.7, 0.7, 0.7, 1.0 );
    var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    var materialShininess = 20.0;

    var ambientColor, diffuseColor, specularColor;

    var modelViewMatrix, projectionMatrix;
    var modelViewMatrixLoc, projectionMatrixLoc;

    var normalMatrix, normalMatrixLoc;

    var eye;
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);

    gl.useProgram( program );
    gl.enable(gl.DEPTH_TEST);

    gl.viewport( pos.x - fontSize * 4, (this.canvas.height - pos.y) - fontSize * 4, fontSize * 8, fontSize * 8);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var data;

    pointsArray = data[0];
    normalsArray = data[1];
    colorArray = data[2];
    var compIdxArray = data[3];
    var graphMap = data[4];

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(compIdxArray), gl.STATIC_DRAW);

    var compIdx = gl.getAttribLocation( program, "compIdx");
    gl.vertexAttribPointer(compIdx, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(compIdx);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    gl.uniform4fv( gl.getUniformLocation(program,
      "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
      "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
      "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
      "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
      "shininess"), materialShininess );
    gl.uniform1f( gl.getUniformLocation(program,
      "compNum"), graphMap.length );
    gl.uniform1f( gl.getUniformLocation(program,
      "t"), t );
    gl.uniform1i( gl.getUniformLocation(program,
      "style"), textStyle );
    gl.uniform3fv( gl.getUniformLocation(program,
      "vColor"), flatten(fontColor) );

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
    radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    normalMatrix = [
      vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
      vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
      vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length);
  }

  clear (useScissor) {
    var gl = this.gl;
    if (useScissor) {
      if (!this.clearArea.length) {
        return;
      }
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(this.clearArea[0], this.clearArea[1], this.clearArea[2], this.clearArea[3]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);
    } else {
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
  }
}
