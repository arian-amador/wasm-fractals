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
var _this = this;
var PAGESIZE = 65536;
var BASE_MEMORY = 0;
var canvas;
var ctx;
var imgData;
var width;
var height;
var bootstrap = function () {
    height = window.innerHeight;
    width = window.innerWidth;
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    imgData = ctx.createImageData(width, height);
};
var drawCanvas = function (linearMem) {
    imgData.data.set(linearMem);
    ctx.putImageData(imgData, 0, 0);
};
var init = function () { return __awaiter(_this, void 0, void 0, function () {
    var imports;
    return __generator(this, function (_a) {
        imports = {
            env: {
                memoryBase: BASE_MEMORY,
                memory: new WebAssembly.Memory({
                    initial: Math.floor((width * height * 4) / PAGESIZE) + 1
                }),
                abort: function () { },
                imported_func: function (arg) { return console.log(arg); }
            }
        };
        fetch('build/untouched.wasm')
            .then(function (response) { return response.arrayBuffer(); })
            .then(function (buffer) { return WebAssembly.instantiate(buffer, imports); })
            .then(function (module) {
            var _a = module.instance.exports, mandelbrot = _a.mandelbrot, getDataBuffer = _a.getDataBuffer, memory = _a.memory;
            mandelbrot(width, height, 150);
            var offset = getDataBuffer();
            var linearMem = new Uint8Array(memory.buffer, offset, width * height * 4);
            drawCanvas(linearMem);
        });
        return [2];
    });
}); };
bootstrap();
init();
//# sourceMappingURL=index.js.map