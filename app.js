var express = require('express');
var path = require('path');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const {exec} = require("child_process");

var app = express();

var uploadedFile = '';

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.zip')
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'),
  async (req, res,next) => {
  uploadedFile = req.file.path;
});

app.post('/run-flux', (req, res) => {
  unzipUpload(uploadedFile);
  console.log(req.body)
  const formNamespace = req.body.namespace;
  const formPath = req.body.path;
  fluxCustomizeBuild(formNamespace, 'public/extracts/' + formPath);
});

app.get('/download', function (req, res) {
  res.download('public/outputs/output.yaml');
});


function unzipUpload(uploadedFile) {
  const {exec} = require("child_process");
  exec("/usr/bin/unzip " + uploadedFile + " -d public/extracts/", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

function fluxCustomizeBuild(namespace, path) {
  const {exec} = require("child_process");
  exec("flux build kustomization " + namespace + " --path " + path + " >> public/outputs/output.yaml", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

function cleanupFiles() {
  const {exec} = require("child_process");
  exec("rm -rf public/extracts/*", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  exec("rm -rf public/uploads/*", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  exec("rm -rf public/outputs/*", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

module.exports = app;
