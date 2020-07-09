"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

var _express = _interopRequireDefault(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _multer = _interopRequireDefault(require("multer"));

var _uuid = require("uuid");

var _path = _interopRequireDefault(require("path"));

var _cors = _interopRequireDefault(require("cors"));

var _cloudinary = _interopRequireDefault(require("cloudinary"));

var _administrador = _interopRequireDefault(require("./routes/administrador.routes"));

var _solicitante = _interopRequireDefault(require("./routes/solicitante.routes"));

var _trabajador = _interopRequireDefault(require("./routes/trabajador.routes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_dotenv["default"].config();

var app = (0, _express["default"])();

var storage = _multer["default"].diskStorage({
  destination: _path["default"].join(__dirname, 'public/uploads'),
  filename: function filename(req, file, cb) {
    cb(null, (0, _uuid.v4)() + _path["default"].extname(file.originalname).toLocaleLowerCase());
  }
}); //MIDDLEWARES


app.use((0, _cors["default"])()); //app.use(morgan('dev'));

app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use((0, _multer["default"])({
  storage: storage,
  limits: {
    fileSize: 2000000
  },
  dest: _path["default"].join(__dirname, 'public/uploads'),
  fileFilter: function fileFilter(req, file, cb) {
    var filetypes = /jpeg|png|jpg/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(_path["default"].extname(file.originalname));

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error, el archivo deber ser una imagen jpeg, png o jpg");
  }
}).single('image')); //SETTINGS

app.set('port', process.env.PORT || 6000); //ROUTES

app.use('/', function (req, res) {
  res.send('Bienvenido');
});
app.use('/api/administrador', _administrador["default"]);
app.use('/api/solicitante', _solicitante["default"]);
app.use('/api/trabajador', _trabajador["default"]); //INITIALIZATION

var init = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return app.listen(app.get('port'));

          case 3:
            console.log("Conectado al servidor en el puerto ".concat(app.get('port')));
            _context.next = 10;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);
            console.log("No se pudo conectar al servidor");
            console.log("Error: ".concat(_context.t0));

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 6]]);
  }));

  return function init() {
    return _ref.apply(this, arguments);
  };
}();

init();