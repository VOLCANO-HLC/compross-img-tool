import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import chalk from "chalk";

async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size;
}

async function compressImage(inputPath, quality = 80) {
  try {
    const originalSize = await getFileSize(inputPath);

    const buffer = await fs.readFile(inputPath);
    const extension = path.extname(inputPath).toLowerCase();
    // const outputBuffer = await sharp(buffer).jpeg({ quality }).toBuffer();
    let outputBuffer;
    switch (extension) {
      case ".png":
        outputBuffer = await sharp(buffer)
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        break;
      case ".jpeg":
      case ".jpg":
        outputBuffer = await sharp(buffer).jpeg({ quality }).toBuffer();
        break;
      case ".webp":
        outputBuffer = await sharp(buffer).webp({ quality }).toBuffer();
        break;
      case ".gif":
        // Note: sharp does not support GIF compression directly. You may need a different library.
        // Here we handle it as copying the file as is for now.
        outputBuffer = buffer; // No compression for GIF in this example.
        console.log(
          chalk.red(
            "GIF compression is not supported by sharp. Skipping compression."
          )
        );
        break;
      default:
        console.log(chalk.red(`不支持的文件类型: ${extension} , 不压缩.`));
        return;
    }
    await fs.writeFile(inputPath, outputBuffer);

    const newSize = await getFileSize(inputPath);

    console.log(chalk.green(`图片压缩并保存到  ${inputPath}`));
    console.log(chalk.yellow(`原体积 ${(originalSize / 1024).toFixed(2)} KB`));
    console.log(chalk.blue(`压缩后体积为: ${(newSize / 1024).toFixed(2)} KB`));
    console.log(
      chalk.red(
        `压缩体积为: ${((originalSize - newSize) / 1024).toFixed(2)} KB (${(
          (1 - newSize / originalSize) *
          100
        ).toFixed(2)}%)\n`
      )
    );
  } catch (error) {
    console.error(chalk.red("图片压缩失败！:", error));
  }
}

async function traverseAndCompress(dir, quality) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        await traverseAndCompress(filePath, quality);
      } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)) {
        await compressImage(filePath, quality);
      }
    }
    console.log(
      chalk.redBright(
        `若部分图片压缩后体积变大，说明图片已经压缩处理过，详情可以了解 压缩原理，仍有需要，可调整压缩率，即运行命令后加 100以内非负整数 ，进行二次压缩`
      )
    );
  } catch (error) {
    console.error(chalk.red("Error traversing directory:", error));
  }
}

export default traverseAndCompress;
