class Canvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imgData: any;
  height: number;
  width: number;

  constructor() {
    this.height = window.innerHeight;
    this.width = window.innerWidth;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(2, 2);
    document.body.appendChild(this.canvas);

    this.imgData = this.ctx.createImageData(this.width, this.height);
  }

  update = linearMem => {
    this.imgData.data.set(linearMem);
  };

  draw = () => {
    this.ctx.putImageData(this.imgData, 0, 0);
  };
}

class Mandelbrot {
  memoryBase: number = 0;
  pageSize: number = 65536;
  maxIter: number;

  canvas: Canvas;
  imports: {
    env: {
      memoryBase: number;
      memory: WebAssembly.Memory;
      abort: () => void;
    };
  };

  constructor(canvas: Canvas, maxIter: number = 150) {
    this.maxIter = maxIter;
    this.canvas = canvas;
    this.imports = {
      env: {
        memoryBase: this.memoryBase,
        memory: new WebAssembly.Memory({
          initial:
            Math.floor(
              (this.canvas.width * this.canvas.height * 4) / this.pageSize
            ) + 1,
        }),
        abort: () => {}, // required by wasm.instantiate.imports
      },
    };
  }

  run = async () => {
    fetch('build/untouched.wasm')
      .then(response => response.arrayBuffer())
      .then(buffer => WebAssembly.instantiate(buffer, this.imports))
      .then(module => {
        const { mandelbrot, getDataBuffer, memory } = module.instance.exports;

        mandelbrot(this.canvas.width, this.canvas.height, this.maxIter);
        const offset = getDataBuffer();
        const linearMem = new Uint8Array(
          memory.buffer,
          offset,
          this.canvas.width * this.canvas.height * 4
        );

        this.canvas.update(linearMem);
        this.canvas.draw();
      });
  };
}

const canvas = new Canvas();
const mandelbrot = new Mandelbrot(canvas);
mandelbrot.run();
