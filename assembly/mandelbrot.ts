function check(imaginary: f64, real: f64, maxIter: u32): u32 {
  let ixSq: f64, iySq: f64;
  let ix: f64 = 0.0;
  let iy: f64 = 0.0;
  let iteration: u32 = 0;

  while ((ixSq = ix * ix) + (iySq = iy * iy) <= 10.0) {
    iy = 2.0 * ix * iy + imaginary;
    ix = ixSq - iySq + real;
    if (iteration >= maxIter) break;
    ++iteration;
  }

  return iteration;
}

export function mandelbrot(width: u32, height: u32, maxIter: u32): void {
  let x: u32, y: u32, iteration: u32, idx: u32;
  let real: f64, imaginary: f64;
  let translateX: f64 = width * (1.0 / 1.6);
  let translateY: f64 = height * (1.0 / 2.0);
  let scale: f64 = 10.0 / min(3 * width, 4 * height);
  let realOffset: f64 = translateX * scale;

  for (y = 0; y < height; y++) {
    imaginary = (y - translateY) * scale;
    for (x = 0; x < width; x++) {
      idx = x + y * width;
      real = x * scale - realOffset;
      iteration = check(imaginary, real, maxIter);

      store<u8>(idx, iteration);
    }
  }
}

export function growMem(pages: i32): i32 {
  return memory.grow(pages);
}
