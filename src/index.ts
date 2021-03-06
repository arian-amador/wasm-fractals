class Canvas {
  height: number;
  width: number;
  size: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imgData: ImageData;
  rgbaMem: Uint8Array;
  intensity: number;
  red: number;
  green: number;
  blue: number;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ratio = window.devicePixelRatio || 1;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(ratio, ratio);

    this.setSliderOnInput();
    this.setSize();
  }

  process = () => {
    this.imgData = this.ctx.createImageData(this.width, this.height);

    for (let x: number = 0; x < this.width; x++) {
      for (let y: number = 0; y < this.height; y++) {
        let pos = y * this.width + x;
        let iter = this.rgbaMem[pos];

        this.imgData.data[pos * 4 + 0] = (iter * this.intensity) % this.red;
        this.imgData.data[pos * 4 + 1] =
          (iter * this.intensity - 1) % this.green;
        this.imgData.data[pos * 4 + 2] =
          (iter * this.intensity - 2) % this.blue;
        this.imgData.data[pos * 4 + 3] = 255;
      }
    }
  };

  render = () => {
    document.body.appendChild(this.canvas);
    this.ctx.putImageData(this.imgData, 0, 0);
  };

  setSize = () => {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.size = this.width * this.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  };

  setSliderOnInput = () => {
    let ctx = this;

    Array.from(document.getElementsByClassName('rangeSlider')).forEach(
      slider => {
        (<HTMLInputElement>slider).oninput = function() {
          ctx.getSliderValues();
          ctx.process();
          ctx.render();
        };
      }
    );

    this.getSliderValues();
  };

  getSliderValues = () => {
    const sliders = [
      { id: 'intensityRange', span: 'intensityVal', prop: 'intensity' },
      { id: 'redRange', span: 'redVal', prop: 'red' },
      { id: 'greenRange', span: 'greenVal', prop: 'green' },
      { id: 'blueRange', span: 'blueVal', prop: 'blue' },
    ];

    for (const slider of sliders) {
      let v = (<HTMLInputElement>document.getElementById(slider['id'])).value;
      document.getElementById(slider['span']).innerHTML = v;
      this[slider['prop']] = v;
    }
  };
}

class Mandelbrot {
  debounceDuration: number = 100;
  debounceTimeoutHandle: NodeJS.Timeout;

  maxIter: number;
  canvas: Canvas;

  constructor(canvas: Canvas, maxIter: number = 150) {
    this.maxIter = maxIter;
    this.canvas = canvas;

    addEventListener('resize', this.debouncedResize);
  }

  debouncedResize = () => {
    clearTimeout(this.debounceTimeoutHandle);
    this.debounceTimeoutHandle = setTimeout(this.resize, this.debounceDuration);
  };

  resize = () => {
    this.canvas.setSize();
    this.run();
  };

  run = async () => {
    const imports = {
      env: {
        memory: new WebAssembly.Memory({
          initial: Math.floor(this.canvas.size / 0xffff),
        }),
        abort: () => {},
      },
    };

    fetch('build/optimized.wasm')
      .then(response => response.arrayBuffer())
      .then(buffer => WebAssembly.instantiate(buffer, imports))
      .then(module => {
        // Import WASM module functions
        const exports = module.instance.exports;
        const growMem = <any>exports.growMem;
        const mandelbrot = <any>exports.mandelbrot;

        // Grow the memory used that hold stride calcs for the full canvas
        growMem(Math.ceil(this.canvas.size / 0xffff));
        mandelbrot(this.canvas.width, this.canvas.height, this.maxIter);

        // Get latest WASM memory buffer
        this.canvas.rgbaMem = new Uint8Array(
          (<WebAssembly.Memory>exports.memory).buffer
        );

        // Process strides to pixel and render on screen
        this.canvas.process();
        this.canvas.render();
      });
  };
}

const canvas = new Canvas();
const mandelbrot = new Mandelbrot(canvas, 256);
mandelbrot.run();
