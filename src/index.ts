class Canvas {
  height: number;
  width: number;
  size: number;
  ctx: CanvasRenderingContext2D;
  imgData: ImageData;
  rgbaMem: Uint8Array;

  constructor() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.size = this.width * this.height;

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    document.body.appendChild(canvas);

    const ratio = window.devicePixelRatio || 1;
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(ratio, ratio);
    this.imgData = this.ctx.createImageData(this.width, this.height);
  }

  process = () => {
    for (let x: number = 0; x < this.width; x++) {
      for (let y: number = 0; y < this.height; y++) {
        let pos = y * this.width + x;
        let iter = this.rgbaMem[pos];

        this.imgData.data[pos * 4 + 0] = 1 * iter * 12;
        this.imgData.data[pos * 4 + 1] = (128 * iter * 4) % 128;
        this.imgData.data[pos * 4 + 2] = (356 * iter * 4) % 356;
        this.imgData.data[pos * 4 + 3] = 255;
      }
    }
  };

  render = () => {
    this.ctx.putImageData(this.imgData, 0, 0);
  };
}

class Mandelbrot {
  maxIter: number;
  canvas: Canvas;
  imports: {
    env: {
      memory: WebAssembly.Memory;
      abort: () => void;
    };
  };

  constructor(canvas: Canvas, maxIter: number = 50) {
    this.maxIter = maxIter;
    this.canvas = canvas;

    this.imports = {
      env: {
        memory: new WebAssembly.Memory({
          initial: Math.floor(this.canvas.size / 0xffff),
        }),
        abort: () => {},
      },
    };
  }

  run = async () => {
    fetch('build/untouched.wasm')
      .then(response => response.arrayBuffer())
      .then(buffer => WebAssembly.instantiate(buffer, this.imports))
      .then(module => {
        let exports = module.instance.exports;

        exports.growMem(Math.ceil(this.canvas.size / 0xffff));
        exports.mandelbrot(this.canvas.width, this.canvas.height, this.maxIter);

        this.canvas.rgbaMem = new Uint8Array(exports.memory.buffer);
        this.canvas.process();
        this.canvas.render();
      });
  };
}

const canvas = new Canvas();
const mandelbrot = new Mandelbrot(canvas, 350);
mandelbrot.run();
