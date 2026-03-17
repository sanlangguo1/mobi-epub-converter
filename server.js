#!/usr/bin/env node

import express from "express";
import multer from "multer";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;
const execFileAsync = promisify(execFile);

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ✅ 修复中文乱码：multer 内部用 latin1 编码文件名
    // 需要先用 latin1 解码，再用 utf8 重新编码
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8",
    );

    // 把修正后的文件名存回去，方便后续使用
    file.originalname = originalName;
    cb(null, originalName);
  },
});

const upload = multer({ storage });

// 静态文件服务
app.use(express.static("public"));

// 转换单个文件
async function convertFile(inputFile, outputFile, ebookConvertPath) {
  try {
    const normalizedInput = path.normalize(inputFile);
    const normalizedOutput = path.normalize(outputFile);
    await execFileAsync(ebookConvertPath, [normalizedInput, normalizedOutput]);
    return true;
  } catch (error) {
    console.error("转换失败:", error);
    throw error;
  }
}

// 转换接口
app.post("/convert", upload.array("files"), async (req, res) => {
  try {
    const { format } = req.body;
    const files = req.files;
    const results = [];

    for (const file of files) {
      try {
        const inputPath = file.path;
        const outputExt = format === "epub" ? ".epub" : ".mobi";

        // ✅ file.originalname 已经在 multer filename 回调里修正为 utf8
        const originalName = file.originalname;
        const outputName = originalName.replace(/\.(mobi|epub)$/i, outputExt);
        const outputPath = path.join(path.dirname(inputPath), outputName);

        await convertFile(inputPath, outputPath, "ebook-convert");

        results.push({
          original: originalName,
          converted: outputName,
          status: "success",
          // ✅ 修复：正确插入 encodeURIComponent 编码后的文件名
          download: `/download/${encodeURIComponent(outputName)}`,
        });
      } catch (error) {
        results.push({
          original: file.originalname,
          status: "error",
          message: error.message,
        });
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 下载接口
app.get("/download/:filename", (req, res) => {
  // 处理可能的双重编码问题，确保中文文件名正确解码
  let filename = req.params.filename;
  try {
    // 首先尝试双重解码，因为浏览器可能会自动编码一次
    filename = decodeURIComponent(decodeURIComponent(filename));
  } catch (e) {
    try {
      // 如果双重解码失败，尝试单次解码
      filename = decodeURIComponent(filename);
    } catch (e2) {
      // 如果仍然失败，使用原始值
    }
  }

  const filePath = path.join(process.cwd(), "uploads", filename);

  if (fs.existsSync(filePath)) {
    // 确保文件名（包括特殊字符）正确显示
    const encodedFilename = encodeURIComponent(filename);

    // 使用标准的 RFC 5987 格式处理中文文件名
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFilename}`,
    );
    res.setHeader("Content-Type", "application/octet-stream");

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on("error", (err) => {
      console.error("下载失败:", err);
      res.status(500).json({ error: "下载失败" });
    });
  } else {
    res.status(404).json({ error: "文件不存在" });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log("请打开浏览器访问以上地址开始转换");
});
