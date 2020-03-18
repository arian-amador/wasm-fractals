function check(x: f64, y: f64, max: i32, threshold: i32): i32 {
  let Z_re = x;
  let Z_im = y;

  for (let i: i32 = 0; i < max; ++i) {
    let Z_re2 = Z_re * Z_re;
    let Z_im2 = Z_im * Z_im;

    if (Z_re2 + Z_im2 > threshold) {
      return i;
    }

    Z_im = 2 * Z_re * Z_im + y;
    Z_re = Z_re2 - Z_im2 + x;
  }

  return 0;
}

export function mandelbrot(width: i32, height: i32, maxIter: i32): void {
  // Scale real numbers(x-axis) from pixel coordinates to complex numbers
  let minReal = -2.5;
  let maxReal = 2.0;
  let realScale = (maxReal - minReal) / (width + 1);

  // Scale imaginary numbers(y-axis) from pixel coordinates to complex numbers
  let minImaginary = -1.25;
  let maxImaginary = minImaginary + ((maxReal - minReal) * height) / width;
  let imaginaryScale = (maxImaginary - minImaginary) / (height + 1);

  for (let y = 0; y < height; y++) {
    let yScaled = maxImaginary - y * imaginaryScale;

    for (let x = 0; x < width; x++) {
      let xScaled = minReal + x * realScale;
      let iterations = check(xScaled, yScaled, maxIter, 5);
      let idx = x + y * width;

      store<u8>(idx, iterations);
    }
  }
}

export function growMem(pages: i32): i32 {
  return memory.grow(pages);
}
