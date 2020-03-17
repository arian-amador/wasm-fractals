const PAGESIZE = 65536;
const BASE_MEMORY = 0;

let canvas;
let ctx;
let imgData;
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
};

const drawCanvas = linearMem => {
  imgData.data.set(linearMem);

  ctx.putImageData(imgData, 0, 0);
};

const init = async () => {
  const imports = {
    env: {
      memoryBase: BASE_MEMORY,
      memory: new WebAssembly.Memory({
        initial: Math.floor((width * height * 4) / PAGESIZE) + 1,
      }),
      abort: () => {},
      imported_func: arg => console.log(arg),
    },
  };

  fetch('build/untouched.wasm')
    .then(response => response.arrayBuffer())
    .then(buffer => WebAssembly.instantiate(buffer, imports))
    .then(module => {
      const { mandelbrot, getDataBuffer, memory } = module.instance.exports;

      mandelbrot(width, height, 150);
      const offset = getDataBuffer();
      const linearMem = new Uint8Array(
        memory.buffer,
        offset,
        width * height * 4
      );
      drawCanvas(linearMem);
    });
};

bootstrap();
init();
