class Canvas {
  height: number = window.innerHeight;
  width: number = window.innerWidth;

  size: number;
  byteSize: number;
  ctx: CanvasRenderingContext2D;
  imgData: any;

  constructor() {
    this.size = this.width * this.height;
    this.byteSize = this.size << 2;

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    document.body.appendChild(canvas);

    const ratio = window.devicePixelRatio || 1;
    this.ctx = canvas.getContext('2d');
    this.ctx.scale(ratio, ratio);
    this.imgData = this.ctx.createImageData(this.width, this.height);
  }

  render = linearMem => {
    this.imgData.data.set(linearMem.slice(0, this.byteSize));
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
          initial: Math.floor(
            (this.canvas.width * this.canvas.height * 4) / 0xffff
          ),
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

        exports.growMem(Math.ceil(this.canvas.byteSize / 0xffff));
        exports.mandelbrot(this.canvas.width, this.canvas.height, this.maxIter);

        this.canvas.render(new Uint8Array(exports.memory.buffer));
      });
  };
}

const canvas = new Canvas();
const mandelbrot = new Mandelbrot(canvas);
mandelbrot.run();
