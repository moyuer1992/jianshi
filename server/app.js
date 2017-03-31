var express = require('express')
var ffmpeg = require('fluent-ffmpeg')
var fs = require('fs')
var path = require('path')

var app = express();

var resolve = file => path.resolve(__dirname, file)

app.use(express.static(resolve('../dist')))

app.get('/', function (req, res) {
  var html = fs.readFileSync(resolve('../dist/index.html'), 'utf-8')
  res.send(html)
})

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

// app.get('/video/:filename', function(req, res) {
//   res.contentType('flv');
//   // make sure you set the correct path to your video file storage
//   var pathToMovie = '/path/to/storage/' + req.params.filename;
//   var proc = ffmpeg(pathToMovie)
//     // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
//     .preset('flashvideo')
//     // setup event handlers
//     .on('end', function() {
//       console.log('file has been converted succesfully');
//     })
//     .on('error', function(err) {
//       console.log('an error happened: ' + err.message);
//     })
//     // save to stream
//     .pipe(res, {end:true});
// });

//   // make sure you set the correct path to your video file storage

    // save to stream
    //.pipe(outStream, {end:true});


app.listen(3000);

