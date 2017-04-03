var express = require('express')
var ffmpeg = require('fluent-ffmpeg')
var fs = require('fs')
var path = require('path')
var bodyParser = require('body-parser')

var app = express();

var resolve = file => path.resolve(__dirname, file)

app.use(express.static(resolve('../dist')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function (req, res) {
  var html = fs.readFileSync(resolve('../dist/index.html'), 'utf-8')
  res.send(html)
})

app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = ''
    req.setEncoding('utf8')
    req.on('data', function(chunk){ req.text += chunk })
    req.on('end', next)
  } else {
    next()
  }
});

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
  var response = {}

  if (matches.length !== 3) {
    return new Error('Invalid input string')
  }

  response.type = matches[1]
  response.data = new Buffer(matches[2], 'base64')

  return response
}

app.post('/video/record', function(req, res) {
  var imgs = req.text.split(' ')
  var timeStamp = Date.now()
  var folder = 'images/' + timeStamp
  if (!fs.existsSync(resolve(folder))){
    fs.mkdirSync(resolve(folder));
  }

  Promise.all(imgs.map(function (value, index) {
    var img = decodeBase64Image(value)
    var data = img.data
    var type = img.type
    return new Promise(function (resolve, reject) {
      fs.writeFile(path.resolve(__dirname, (folder + '/img' + index + '.' + type)), data, 'base64', function(err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })).then(function () {
    var proc = new ffmpeg({ source: resolve(folder + '/img%d.png'), nolog: true })
      .withFps(25)
      .on('end', function() {
        res.status(200)
        res.send({
          url: '/video/mpeg/' + timeStamp,
          filename: 'jianshi' + timeStamp + '.mpeg'
        })
      })
      .on('error', function(err) {
        console.log('an error happened: ' + err.message)
        res.status(400)
      })
      .saveToFile(resolve('video/jianshi' + timeStamp + '.mpeg'))
  })
})

app.get('/video/mpeg/:timeStamp', function(req, res) {
  res.contentType('mpeg');
  var rstream = fs.createReadStream(resolve('video/jianshi' + req.params.timeStamp + '.mpeg'));
  rstream.pipe(res, {end: true});
})

app.listen(3000);
