const PAGESIZE = 65536;
const BASE_MEMORY = 0;

let canvas;
let ctx;
let imageData;
let width;
let height;

const bootstrap = () => {
  height = window.innerHeight;
  width = window.innerWidth;

  canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);

  ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  imgData = ctx.createImageData(width, height);
}

const drawCanvas = (linearMem) => {
  imgData.data.set(linearMem);

  ctx.putImageData(imgData, 0, 0);
};

const init = async () => {
  const res = await fetch('build/untouched.wasm');
  const buffer = await res.arrayBuffer();
  const module = await WebAssembly.instantiate(buffer, {
    env: {
      memoryBase: BASE_MEMORY,
      memory: new WebAssembly.Memory({
        initial: Math.floor((width * height * 4) / PAGESIZE) + 1
      }),
      abort: () => {},
    },
  });
  const {
    mandelbrot,
    memory,
    getDataBuffer
  } = module.instance.exports;

  mandelbrot(width, height, 150);
  const offset = getDataBuffer();
  const linearMem = new Uint8Array(memory.buffer, offset, width * height * 4);
  drawCanvas(linearMem)
};

bootstrap();
init();