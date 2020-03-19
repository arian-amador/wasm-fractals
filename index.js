var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Canvas = (function () {
    function Canvas() {
        var _this = this;
        this.process = function () {
            _this.imgData = _this.ctx.createImageData(_this.width, _this.height);
            for (var x = 0; x < _this.width; x++) {
                for (var y = 0; y < _this.height; y++) {
                    var pos = y * _this.width + x;
                    var iter = _this.rgbaMem[pos];
                    _this.imgData.data[pos * 4 + 0] = (iter * _this.intensity) % _this.red;
                    _this.imgData.data[pos * 4 + 1] =
                        (iter * _this.intensity - 1) % _this.green;
                    _this.imgData.data[pos * 4 + 2] =
                        (iter * _this.intensity - 2) % _this.blue;
                    _this.imgData.data[pos * 4 + 3] = 255;
                }
            }
        };
        this.render = function () {
            document.body.appendChild(_this.canvas);
            _this.ctx.putImageData(_this.imgData, 0, 0);
        };
        this.setSize = function () {
            _this.height = window.innerHeight;
            _this.width = window.innerWidth;
            _this.size = _this.width * _this.height;
            _this.canvas.width = _this.width;
            _this.canvas.height = _this.height;
        };
        this.setSliderOnInput = function () {
            var ctx = _this;
            Array.from(document.getElementsByClassName('rangeSlider')).forEach(function (slider) {
                slider.oninput = function () {
                    ctx.getSliderValues();
                    ctx.process();
                    ctx.render();
                };
            });
            _this.getSliderValues();
        };
        this.getSliderValues = function () {
            var i = document.getElementById('intensityRange').value;
            var r = document.getElementById('redRange').value;
            var g = document.getElementById('greenRange').value;
            var b = document.getElementById('blueRange').value;
            document.getElementById('intensityVal').innerHTML = i;
            document.getElementById('redVal').innerHTML = r;
            document.getElementById('greenVal').innerHTML = g;
            document.getElementById('blueVal').innerHTML = b;
            _this.intensity = i - 0;
            _this.red = r - 0;
            _this.green = g - 0;
            _this.blue = b - 0;
        };
        this.canvas = document.createElement('canvas');
        var ratio = window.devicePixelRatio || 1;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(ratio, ratio);
        this.setSliderOnInput();
        this.setSize();
    }
    return Canvas;
}());
var Mandelbrot = (function () {
    function Mandelbrot(canvas, maxIter) {
        var _this = this;
        if (maxIter === void 0) { maxIter = 150; }
        this.debounceDuration = 100;
        this.debouncedResize = function () {
            clearTimeout(_this.debounceTimeoutHandle);
            _this.debounceTimeoutHandle = setTimeout(_this.resize, _this.debounceDuration);
        };
        this.resize = function () {
            _this.canvas.setSize();
            _this.run();
        };
        this.run = function () { return __awaiter(_this, void 0, void 0, function () {
            var imports;
            var _this = this;
            return __generator(this, function (_a) {
                imports = {
                    env: {
                        memory: new WebAssembly.Memory({
                            initial: Math.floor(this.canvas.size / 0xffff)
                        }),
                        abort: function () { }
                    }
                };
                fetch('build/untouched.wasm')
                    .then(function (response) { return response.arrayBuffer(); })
                    .then(function (buffer) { return WebAssembly.instantiate(buffer, imports); })
                    .then(function (module) {
                    var exports = module.instance.exports;
                    exports.growMem(Math.ceil(_this.canvas.size / 0xffff));
                    exports.mandelbrot(_this.canvas.width, _this.canvas.height, _this.maxIter);
                    _this.canvas.rgbaMem = new Uint8Array(exports.memory.buffer);
                    _this.canvas.process();
                    _this.canvas.render();
                });
                return [2];
            });
        }); };
        this.maxIter = maxIter;
        this.canvas = canvas;
        addEventListener('resize', this.debouncedResize);
    }
    return Mandelbrot;
}());
var canvas = new Canvas();
var mandelbrot = new Mandelbrot(canvas, 256);
mandelbrot.run();
//# sourceMappingURL=index.js.map