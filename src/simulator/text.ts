import * as math from 'gl-matrix';
// 创建一个隐藏的 canvas 用来绘制文字
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
// 设置画布大小
canvas.width = 500;
canvas.height = 200;

function generateTextPositions(text: string): { textPositions: math.vec3[], center: math.vec3 } {
  // 绘制浪漫文字
  ctx.font = 'italic 40px "Brush Script MT", cursive';
  ctx.fillText(text, 50, 100);  // 使用填充而不是描边
  // 获取文字的像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const textPositions: math.vec3[] = [];
  const particleSize = 2;
  for (let x = 0; x < canvas.width; x += particleSize) {
    for (let y = 0; y < canvas.height; y += particleSize) {
      const index = (x + y * canvas.width) * 4;
      const alpha = data[index + 3];
      // 只有不透明的像素会生成粒子
      if (alpha > 128) {
        const particle = math.vec3.fromValues(0, canvas.height / 2 - y, -x + canvas.width / 2);
        textPositions.push(particle);
      }
    }
  }

  const center = math.vec3.create();
  for (let i = 0; i < textPositions.length; i++) {
    math.vec3.add(center, center, textPositions[i]);
  }
  math.vec3.scale(center, center, 1 / textPositions.length);

  return { textPositions, center };
}

export { generateTextPositions };
