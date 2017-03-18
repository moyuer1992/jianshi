var textCtx = document.createElement("canvas").getContext("2d");

function calTriangleArea (A, B, C) {
  var a = distance(A, B);
  var b = distance(B, C);
  var c = distance(C, A);

  var p = (a + b + c) / 2;
  return Math.sqrt(p * (p - a) + (p - b) + (p - c));
}

function distance (p1, p2) {
  return Math.sqrt( (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]) + (p1[2] - p2[2]) * (p1[2] - p2[2]));
}

function makeTextData (text, size, options) {
  var pointsArray = [];
  var normalsArray = [];
  var colorsArray = [];
  var compIdxArray = [];
  var e = [];
  var g = [];
  var markMap = [];
  var cnt = 0;
  var width = size;
  var height = size;
  textCtx.canvas.width  = width;
  textCtx.canvas.height = height;

  var ctx = textCtx;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = size + 'px ' + (options.font || '隶书');
  ctx.fillStyle = 'black';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  var data = imageData.data;
  var grid = 1;

  var triangle = function (a, b, c, index, options) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    compIdxArray.push(index);
    compIdxArray.push(index);
    compIdxArray.push(index);

    var normal = cross(subtract(b, a), subtract(c, a));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));
    normalsArray.push(vec4(normal[0], normal[1], normal[2], 0.0));

    if (options) {
      switch (options.colorStyle) {
        case 'test':
          var index = options.index;
          var n = options.n;
          var area = calTriangleArea(a, b, c);

          var color = vec4( 0.0, 0.0, 0.0, area > 100 ? 1.0 : Math.pow(area / 100, 0.5) );
          colorsArray.push(color);
          colorsArray.push(color);
          colorsArray.push(color);
          break;
      }
    }
  };

  var hasPixel = function (j, i) {
    //第j行，第i列
    if (i < 0 || j < 0) {
      return false;
    }
    return !!data[(j * ctx.canvas.width + i) * 4 + 3];
  };

  var markPoint = function (j, i) {
    var value = 0;

    if (i > 0 && hasPixel(j, i - 1)) {
      //与左边连通
      value = g[j][i - 1];
    } else {
      value = ++cnt;
    }

    if ( j > 0 && hasPixel(j - 1, i) && ( i === 0 || !hasPixel(j - 1, i - 1) ) ) {
      //与上连通 且 与左上不连通 （即首次和上一行连接）
      if (g[j - 1][i] !== value) {
        markMap.push([g[j - 1][i], value]);
      }
    }

    if ( !hasPixel(j, i - 1) ) {
      //行首
      if ( hasPixel(j - 1, i - 1) && g[j - 1][i - 1] !== value) {
        //与左上连通
        markMap.push([g[j - 1][i - 1], value]);
      }
    }

    if ( !hasPixel(j, i + 1) ) {
      //行尾
      if ( hasPixel(j - 1, i + 1) && g[j - 1][i + 1] !== value) {
        //与右上连通
        markMap.push([g[j - 1][i + 1], value]);
      }
    }

    return value;
  };

  for (var j = 0; j < ctx.canvas.height; j += grid) {
    g.push([]);
    e.push([]);

    for (var i = 0; i < ctx.canvas.width; i += grid) {
      var value = 0;
      var isEdge = false;


      if (hasPixel(j, i)) {
        value = markPoint(j, i);
      }
      e[j][i] = isEdge;
      g[j][i] = value;
    }
  }

  var finalGraph = seperateGraph(g, e, markMap, cnt);
  var graphs = finalGraph[0];
  var sampledEdge = finalGraph[2];
  var graphMap = [];
  var z = options.thick / 2;
  var z2 = -z;

  sampledEdge.forEach(function (graph, index) {
    var points = graph[0];
    var holes = graph[1];
    var triangles = earcut(flatten(points), holes);
    var num = points.length;

    for (var n = 0; n < triangles.length; n += 3) {
      var a = points[triangles[n]];
      var b = points[triangles[n + 1]];
      var c = points[triangles[n + 2]];

      //=====字体正面数据=====
      triangle(vec3(a[0], a[1], z), vec3(b[0], b[1], z), vec3(c[0], c[1], z), index);

      //=====字体背面数据=====
      triangle(vec3(a[0], a[1], z2), vec3(b[0], b[1], z2), vec3(c[0], c[1], z2), index);
    }

    var holesMap = [];
    var last = 0;

    if (holes.length) {
      for (var holeIndex = 0; holeIndex < holes.length; holeIndex++) {
        holesMap.push([last, holes[holeIndex] - 1]);
        last = holes[holeIndex];
      }
    }

    holesMap.push([last, points.length - 1]);

    for (var i = 0; i < holesMap.length; i++) {
      var startAt = holesMap[i][0];
      var endAt = holesMap[i][1];

      for (var j = startAt; j < endAt; j++) {
        triangle(vec3(points[j][0], points[j][1], z), vec3(points[j][0], points[j][1], z2), vec3(points[j+1][0], points[j+1][1], z), index);
        triangle(vec3(points[j][0], points[j][1], z2), vec3(points[j+1][0], points[j+1][1], z2), vec3(points[j+1][0], points[j+1][1], z), index);
      }
      triangle(vec3(points[startAt][0], points[startAt][1], z), vec3(points[startAt][0], points[startAt][1], z2), vec3(points[endAt][0], points[endAt][1], z), index);
      triangle(vec3(points[startAt][0], points[startAt][1], z2), vec3(points[endAt][0], points[endAt][1], z2), vec3(points[endAt][0], points[endAt][1], z), index);
    }
    graphMap.push(pointsArray.length);
  });
  return [pointsArray, normalsArray, colorsArray, compIdxArray, graphMap];
}

function seperateGraph (g, e, markMap, cnt) {
  var graphs = [];
  var graphsEdge = [];
  var sampledEdge = []; 

  var markArr = [];
  var fathers = [];
  var markCollection = [];
  
  for (var i = 0; i < cnt; i++) {
    markArr[i] = i;
  }

  var findFather = function (n) {
    if (markArr[n] === n) {
      return n;
    } else {
      markArr[n] = findFather(markArr[n]); 
      return markArr[n];
    }
  }

  for (i = 0; i < markMap.length; i++) {
    var a = markMap[i][0];
    var b = markMap[i][1];
    
    var f1 = findFather(a);
    var f2 = findFather(b);

    if (f1 !== f2) {
      markArr[f2] = f1;
    }
  }

  for (i = 1; i < markArr.length; i++) {
    var f = findFather(markArr[i]);
    var index = fathers.indexOf(f);
    if (index !== -1) {
      markCollection[index].push(i)
    } else {
      fathers.push(f);
      markCollection.push([i]);
    }
  }

  for (i = 0; i < markCollection.length; i++) {
    graphs.push([]);
    graphsEdge.push([]);
  }

  for (var j = 0; j < g.length; j++) {
    for (i = 0; i < g[j].length; i++) {
      var v = g[j][i];
      for (var n = 0; n < markCollection.length; n++) {
        if (markCollection[n].indexOf(v) !== -1) {
          g[j][i] = n + 1;
          var p = [i, j];
          graphs[n].push(p);
          if (e[j][i]) {
            graphsEdge[n].push(p);
          }
        }
      }
    }
  }

  graphs.forEach(function (shape, index) {
    sampledEdge.push(orderEdge(g, e, index, 0));
  });
  return [graphs, graphsEdge, sampledEdge];
}

function findOuterContourEntry (g, v) {
  var start = [-1, -1];
  for (var j = 0; j < g.length; j++) {
    for (var i = 0; i < g[0].length; i++) {
      if (g[j][i] === v) {
        start = [i, j];
        return start;
      }
    }
  }
  return start;
}

function findInnerContourEntry (g, v, e) {
  var start = false;
  for (var j = 0; j < g.length; j++) {
    for (var i = 0; i < g[0].length; i++) {
      if (g[j][i] === v && (g[j + 1] && g[j + 1][i] === 0)) {
        var isInContours = false;
        if (typeof(e[j][i]) === 'number') {
          isInContours = true;
        }
        if (!isInContours) {
          start = [i, j];
          return start;
        }
      }
    }
  }
  return start;
}

function orderEdge (g, e, v, gap) {
  v++;
  var rs = [];
  var entryRecord = [];
  var start = findOuterContourEntry(g, v);
  var next = start;
  var end = false;
  rs.push(start);
  entryRecord.push(6);
  var holes = [];
  var mark;
  var holeMark = 2;
  e[start[1]][start[0]] = holeMark;

  var process = function (i, j) {
    if (i < 0 || i >= g[0].length || j < 0 || j >= g.length) {
      return false;
    }

    if (g[j][i] !== v || tmp) {
      return false;
    }
    
    e[j][i] = holeMark;
    tmp = [i, j]
    rs.push(tmp);
    mark = true;

    return true;
  }

  var map = [
    (i,j) => {return {'i': i + 1, 'j': j}},
    (i,j) => {return {'i': i + 1, 'j': j + 1}},
    (i,j) => {return {'i': i, 'j': j +1}},
    (i,j) => {return {'i': i - 1, 'j': j + 1}},
    (i,j) => {return {'i': i - 1, 'j': j}},
    (i,j) => {return {'i': i - 1, 'j': j - 1}},
    (i,j) => {return {'i': i, 'j': j - 1}},
    (i,j) => {return {'i': i + 1, 'j': j - 1}},
  ];

  var convertEntry = function (index) {
    var arr = [4, 5, 6, 7, 0, 1, 2, 3];
    return arr[index];
  }

  while (!end) {
    var i = next[0];
    var j = next[1];
    var tmp = null;
    var entryIndex = entryRecord[entryRecord.length - 1];

    for (var c = 0; c < 8; c++) {
      var index = ((entryIndex + 1) + c) % 8;
      var hasNext = process(map[index](i, j).i, map[index](i, j).j);
      if (hasNext) {
        entryIndex = convertEntry(index);
        break;
      }
    }

    if (tmp) {
      next = tmp;

      if ((next[0] === start[0]) && (next[1] === start[1])) {
        var innerEntry = findInnerContourEntry(g, v, e);
        if (innerEntry) {
          next = start = innerEntry;
          e[start[1]][start[0]] = holeMark;
          rs.push(next);
          entryRecord.push(entryIndex);
          entryIndex = 2;
          holes.push(rs.length - 1);
          holeMark++;
        } else {
          end = true;
        }
      }
    } else {
      rs.splice(rs.length - 1, 1);
      entryIndex = convertEntry(entryRecord.splice(entryRecord.length - 1, 1)[0]);
      next = rs[rs.length - 1];
    }

    entryRecord.push(entryIndex);
  }
  return [rs, holes];
}

function convertCanvasToGl (x, y, z, size) {
  return vec3((x - size / 2) / size, (size / 2 - y) / size, z);
}

function convertCanvasToGl2D (x, y, size) {
  return vec2((x - size / 2) / size, (size / 2 - y) / size);
}

function parseArr (data, size) {
  var points = data[0];
  var normals = data[1];
  var colors = data[2];

  for (var i = 0; i < points.length; i++) {
    points[i] = convertCanvasToGl(points[i][0], points[i][1], points[i][2], size);
  }
  return [points, normals, colors, data[3], data[4]];
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l;
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0;
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
