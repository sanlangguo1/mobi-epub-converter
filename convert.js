#!/usr/bin/env node

import { program } from "commander";
import ora from "ora";
import chalk from "chalk";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

// ─── 递归扫描目录，找出所有 .mobi 文件 ───────────────────────────────────────
async function findMobiFiles(inputDir) {
  const results = [];
  const entries = fs.readdirSync(inputDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(inputDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findMobiFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".mobi")) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── 单文件转换 ───────────────────────────────────────────────────────────────
async function convertOne(inputFile, outputFile, ebookConvertPath) {
  // 确保输出目录存在
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  await execFileAsync(ebookConvertPath, [inputFile, outputFile]);
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────
async function main() {
  program
    .name("mobi2epub")
    .description("批量将 .mobi 文件转换为 .epub（依赖 Calibre ebook-convert）")
    .version("1.0.0")
    .requiredOption("-i, --input <dir>", "输入目录（包含 .mobi 文件）")
    .requiredOption("-o, --output <dir>", "输出目录（自动创建）")
    .option(
      "-e, --ebook-convert <path>",
      "ebook-convert 可执行文件路径",
      "ebook-convert", // 默认直接用 PATH 中的命令
    )
    .option("--overwrite", "覆盖已存在的 .epub 文件", false)
    .parse(process.argv);

  const opts = program.opts();
  const { input, output, ebookConvert, overwrite } = opts;

  // 检查输入目录
  if (!fs.existsSync(input)) {
    console.error(chalk.red(`✖ 输入目录不存在：${input}`));
    process.exit(1);
  }

  // 扫描 mobi 文件
  const spinner = ora("正在扫描 .mobi 文件...").start();
  const mobiFiles = await findMobiFiles(path.resolve(input));
  spinner.stop();

  if (mobiFiles.length === 0) {
    console.log(chalk.yellow("⚠ 未找到任何 .mobi 文件"));
    process.exit(0);
  }

  console.log(chalk.cyan(`\n📚 共找到 ${mobiFiles.length} 个 .mobi 文件\n`));

  const inputBase = path.resolve(input);
  const outputBase = path.resolve(output);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  const errors = [];

  // 逐文件转换
  for (let i = 0; i < mobiFiles.length; i++) {
    const mobiPath = mobiFiles[i];

    // 保留相对目录结构输出
    const relPath = path.relative(inputBase, mobiPath);
    const epubRel = relPath.replace(/\.mobi$/i, ".epub");
    const epubPath = path.join(outputBase, epubRel);
    const fileName = path.basename(mobiPath);
    const prefix = chalk.gray(`[${i + 1}/${mobiFiles.length}]`);

    // 跳过已存在文件（除非 --overwrite）
    if (!overwrite && fs.existsSync(epubPath)) {
      console.log(
        `${prefix} ${chalk.yellow("跳过")} ${fileName} ${chalk.gray("（已存在）")}`,
      );
      skipCount++;
      continue;
    }

    const taskSpinner = ora(
      `${prefix} 转换中 ${chalk.white(fileName)}`,
    ).start();

    try {
      await convertOne(mobiPath, epubPath, ebookConvert);
      taskSpinner.succeed(`${prefix} ${chalk.green("成功")} ${fileName}`);
      successCount++;
    } catch (err) {
      taskSpinner.fail(`${prefix} ${chalk.red("失败")} ${fileName}`);
      errors.push({ file: fileName, reason: err.message });
      failCount++;
    }
  }

  // 输出汇总
  console.log("\n" + "─".repeat(50));
  console.log(chalk.bold("转换完成汇总："));
  console.log(`  ${chalk.green("✔ 成功")}：${successCount} 个`);
  if (skipCount > 0)
    console.log(
      `  ${chalk.yellow("⊘ 跳过")}：${skipCount} 个（已存在，未覆盖）`,
    );
  if (failCount > 0) {
    console.log(`  ${chalk.red("✖ 失败")}：${failCount} 个`);
    errors.forEach((e) => {
      console.log(`    ${chalk.red("•")} ${e.file}`);
      console.log(`      ${chalk.gray(e.reason.split("\n")[0])}`);
    });
  }
  console.log("─".repeat(50));
}

main().catch((err) => {
  console.error(chalk.red("未预期错误："), err.message);
  process.exit(1);
});
