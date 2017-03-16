class TreeBgSprite extends BgSprite {
  constructor (editor) {
    super(editor);
  }

  init () {
    this.initGl();
  }

  drawStatic () {
    this.clear();
    var color = config.backgroundMap[config.state.backgroundIndex].colors[config.state.bgColorIndex];
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.renderGlMoon({
      pos: {x: 150, y: 150},
      r: 100,
      t: 1.0,
      numTimesToSubdivide: 5
    });

    this.renderGlTree({
      pos: {x: this.ctx.canvas.width - 350, y: this.ctx.canvas.height},
      theta: 0.2,
      minH: this.ctx.canvas.width / 80,
      iniH: 30
    });

    this.renderGlTree({
      pos: {x: this.ctx.canvas.width - 200, y: this.ctx.canvas.height},
      theta: 0.2,
      minH: this.ctx.canvas.width / 65,
      iniH: 50
    });
  }

  drawFrame () {
    this.clear();
    var color = config.backgroundMap[config.state.backgroundIndex].colors[config.state.bgColorIndex];
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.renderGlMoon({
      pos: {x: 150, y: 150},
      r: 100,
      t: this._t,
      numTimesToSubdivide: 5
    });

    this.renderGlTree({
      pos: {x: this.ctx.canvas.width - 350, y: this.ctx.canvas.height},
      theta: 0.2 * this._t,
      minH: this.ctx.canvas.width / 80,
      iniH: 30
    });

    this.renderGlTree({
      pos: {x: this.ctx.canvas.width - 200, y: this.ctx.canvas.height},
      theta: 0.2 * this._t,
      minH: this.ctx.canvas.width / 65,
      iniH: 50
    });
  }

  advance (t) {
    var stop = true;
    this.t = t;

    if (this._t < 1) {
      var dt = this.options.duration;
      var progress = t / dt;
      this._t = Math.pow(progress, 1);
      stop = false;
    }

    if (stop) {
      this.stop();
    }

    return stop;
  }

  stop () {
    this.animating = false;
    this._t = 0;
  }

  initGl () {
    var gl = this.gl;

    this.vertexMoonShader = initGlShader(gl,
      `attribute vec4 vPosition;
      attribute vec4 vNormal;
      attribute float compIdx;

      varying vec4 fColor;

      uniform float t;
      uniform float compNum;
      uniform vec3 vColor;

      uniform vec4 ambientProduct, diffuseProduct, specularProduct;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform vec4 lightPosition;
      uniform float shininess;
      uniform mat3 normalMatrix;

      void main() {
        vec3 pos = (modelViewMatrix * vPosition).xyz;

        vec3 L;
        
        if(lightPosition.w == 0.0) L = normalize(lightPosition.xyz);
        else L = normalize( lightPosition.xyz - pos );
         
        vec3 E = -normalize( pos );
        
        vec3 H = normalize( L + E );
        
        vec3 N = normalize( normalMatrix*vNormal.xyz);

        vec4 ambient = ambientProduct;

        float Kd = max( dot(L, N), 0.0 );
        vec4  diffuse = Kd*diffuseProduct;

        float Ks = pow( max(dot(N, H), 0.0), shininess );
        vec4  specular = Ks * specularProduct;
        
        if( dot(L, N) < 0.0 ) {
          specular = vec4(0.0, 0.0, 0.0, 1.0);
        }

        gl_PointSize = 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vPosition;

        fColor = ambient + diffuse +specular;
        fColor.a = 1.0;

        if (dot(N, L) < 0.0) {
          fColor = vec4(1.0, 1.0, 0.9 - 0.2 * t, 1.0);
        } else if (dot(N, L) < 0.9 + t * 0.09 ) {
          fColor = vec4(1.0, 1.0, 0.9 - 0.1 * t, 1.0);
        } else {
          fColor = vec4(1.0, 1.0, 0.9 + 0.05 * t, 1.0);
        }
      }`, gl.VERTEX_SHADER);

    this.fragmentMoonShader = initGlShader(gl,
      `precision mediump float;

      varying vec4 fColor;

      void main() {
        gl_FragColor = fColor;
      }`, gl.FRAGMENT_SHADER);
    
    this.moonProgram = initGlProgram(gl, [this.vertexMoonShader, this.fragmentMoonShader]);


    this.vertexTreeShader = initGlShader(gl,
      `attribute vec2 vPosition;

      varying vec4 fColor;

      void main() {
        gl_PointSize = 1.0;
        gl_Position = vec4(vPosition, 0.0, 1.0);

        //fColor = vec4(1.0, 1.0, 1.0, 0.8);
        fColor = vec4(0.8156862745098039, 0.8470588235294118, 0.8313725490196079, 1.0);
        //fColor = vec4(0.5490196078431373, 0.5882352941176471, 0.5686274509803921, 0.9);
      }`, gl.VERTEX_SHADER);

    this.fragmentTreeShader = initGlShader(gl,
      `precision mediump float;

      varying vec4 fColor;

      void main() {
        gl_FragColor = fColor;
      }`, gl.FRAGMENT_SHADER);
    
    this.treeProgram = initGlProgram(gl, [this.vertexTreeShader, this.fragmentTreeShader]);
  }

  renderGlTree (options) {
    var pointsArray = [];
    var colorsArray = [];
    var pos = options.pos;
    var theta = options.theta;
    var cnt = 0;
    var minH = options.minH * 2 / this.ctx.canvas.height;
    var gl = this.gl;

    function branch(root, h, phi, theta) {
      //theta: 分叉角度
      //phi: root枝杈角度

      var left = {
        x: 0 - h * Math.abs(Math.sin(theta)),
        y: h * Math.abs(Math.cos(theta))
      }

      var right = {
        x: h * Math.abs(Math.sin(theta)),
        y: h * Math.abs(Math.cos(theta))
      }

      //rotate
      var x = left.x * Math.cos(-phi) - left.y * Math.sin(-phi);
      var y = left.x * Math.sin(-phi) + left.y * Math.cos(-phi);

      left.x = x + root.x;
      left.y = y + root.y;

      //rotate
      x = right.x * Math.cos(-phi) - right.y * Math.sin(-phi);
      y = right.x * Math.sin(-phi) + right.y * Math.cos(-phi);

      right.x = x + root.x;
      right.y = y + root.y;

      pointsArray.push(vec2(root.x, root.y));
      pointsArray.push(vec2(left.x, left.y));
      pointsArray.push(vec2(root.x, root.y));
      pointsArray.push(vec2(right.x, right.y));
      cnt++;

      if (h >= minH) {
        branch(left, h * 5 / 6, phi - theta, theta);
        branch(right, h * 5 / 6, phi + theta, theta);
      }
    }

    var h = options.iniH * 2 / this.ctx.canvas.height;
    pointsArray.push(vec2(0.0, -1.0));
    pointsArray.push(vec2(0.0, -1.0 + h));
    branch({ x: 0.0, y: -1.0 + h }, h * 5 / 6, 0, theta * 2 / 3);

    var program = this.treeProgram;
    gl.useProgram( program );
    gl.enable(gl.DEPTH_TEST);

    gl.viewport( pos.x - this.ctx.canvas.width / 2, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays( gl.LINES, 0, pointsArray.length);
  }

  renderGlMoon (options) {

    function triangle(a, b, c) {
      pointsArray.push(a);
      pointsArray.push(b);
      pointsArray.push(c);

      normalsArray.push(a[0],a[1], a[2], 0.0);
      normalsArray.push(b[0],b[1], b[2], 0.0);
      normalsArray.push(c[0],c[1], c[2], 0.0);
    }

    function divideTriangle(a, b, c, count) {
      if ( count > 0 ) {
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
      }
      else {
        triangle( a, b, c );
      }
    }

    function tetrahedron(a, b, c, d, n) {
      divideTriangle(a, b, c, n);
      divideTriangle(d, c, b, n);
      divideTriangle(a, d, b, n);
      divideTriangle(a, c, d, n);
    }

    var t = options.t;
    var pos = options.pos;
    var r = options.r;
    var numTimesToSubdivide = options.numTimesToSubdivide || 5;

    if (t >= 1) {
      t = 1.0;
    }
    var phi = 0.1;
    var theta = 0.2 + t * 0.5;

    var gl = this.gl;
    var program = this.moonProgram;

    var pointsArray = [];
    var normalsArray = [];
    var colorArray = [];
    var compIdxArray = [];

    var near = -10;
    var far = 10;
    var radius = 1.5;
    var dr = 5.0 * Math.PI/180.0;

    var left = -3.0;
    var right = 3.0;
    var ytop =3.0;
    var bottom = -3.0;

    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);

    var lightPosition = vec4( 1.0, 1.0, 1.0, 0.0 );
    var lightAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
    var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

    var materialAmbient = vec4( 1.0, 1.0, 0.7, 1.0 );
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

    gl.viewport(pos.x - 2 * r, this.ctx.canvas.height - ( pos.y + 2 * r ), 4 * r, 4 * r);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    var data;

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

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
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

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
      "t"), t );

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

  clear () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
