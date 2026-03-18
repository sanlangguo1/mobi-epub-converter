# MOBI-EPUB 电子书格式转换器

这是一个功能完整的电子书格式转换工具，支持 MOBI ↔ EPUB 互转。提供**Web 界面**和**命令行**两种使用方式。

## 📋 目录

- [功能特性](#功能特性)
- [系统要求](#系统要求)
- [安装步骤](#安装步骤)
- [使用方法](#使用方法)
  - [Web 界面方式](#web-界面方式)
  - [命令行方式](#命令行方式)
- [常见问题](#常见问题)
- [技术栈](#技术栈)

---

## ✨ 功能特性

### Web 界面

- 🖥️ 简洁直观的用户界面
- 📤 支持批量上传文件（点击或拖拽）
- 🔄 支持 MOBI → EPUB 和 EPUB → MOBI 双向转换
- ⚡ 实时显示转换进度
- 📥 单个下载或批量下载全部文件
- 🎯 中文文件名完美支持

### 命令行工具

- 🚀 批量转换整个目录
- 📁 保留原始目录结构
- ✅ 智能跳过已存在文件
- 📊 详细的转换结果汇总
- 🎨 彩色终端输出

---

## 💻 系统要求

### 必需环境

1. **Node.js** (v14 或更高版本)
2. **Calibre** (包含 `ebook-convert` 工具)
   - macOS: `brew install calibre`
   - Windows: 从 [Calibre 官网](https://calibre-ebook.com/download) 下载
   - Linux: `sudo apt-get install calibre` 或对应发行版命令

### 可选配置

如果 `ebook-convert` 不在系统 PATH 中，需要指定完整路径：

- macOS: `/Applications/calibre.app/Contents/MacOS/ebook-convert`
- Windows: `C:\Program Files\Calibre2\ebook-convert.exe`
- Linux: `/usr/bin/ebook-convert`

---

## 📦 安装步骤

### 1. 克隆项目（如果有 Git 仓库）

```bash
git clone https://github.com/sanlangguo1/mobi-epub-converter.git
cd mobi-epub-converter
```

### 2. 安装依赖

```bash
npm install
# 或使用 pnpm
pnpm install
```

### 3. 验证 Calibre 安装

```bash
ebook-convert --version
```

如果提示命令不存在，请确保已正确安装 Calibre 并添加到系统 PATH。

---

## 🚀 使用方法

### Web 界面方式

#### 启动服务器

```bash
npm start
# 或
npm run dev
```

#### 访问界面

打开浏览器访问：http://localhost:3000

#### 操作步骤

1. **选择文件**
   
   - 点击"选择文件"按钮
   - 或直接拖拽文件到上传区域
   - 支持一次选择多个文件

2. **选择转换方向**
   
   - MOBI → EPUB：将 MOBI 格式转换为 EPUB
   - EPUB → MOBI：将 EPUB 格式转换为 MOBI

3. **开始转换**
   
   - 点击"开始转换"按钮
   - 等待转换完成（会显示进度）

4. **下载文件**
   
   - 单个下载：点击每个文件对应的下载链接
   - 批量下载：点击"批量下载全部"按钮

#### 注意事项

- 上传的文件会保存在 `uploads` 目录
- 转换后的文件也保存在同一目录
- 可以手动清理 `uploads` 目录释放空间

---

### 命令行方式

#### 基本用法

```bash
node convert.js -i <输入目录> -o <输出目录> [选项]
```

#### 参数说明

| 参数                           | 说明                    | 是否必需 |
| ---------------------------- | --------------------- | ---- |
| `-i, --input <dir>`          | 输入目录（包含 .mobi 文件）     | ✅ 必需 |
| `-o, --output <dir>`         | 输出目录（自动创建）            | ✅ 必需 |
| `-e, --ebook-convert <path>` | ebook-convert 可执行文件路径 | ❌ 可选 |
| `--overwrite`                | 覆盖已存在的 .epub 文件       | ❌ 可选 |

#### 使用示例

##### 示例 1: 基本转换

```bash
# 将 input 目录下的所有 MOBI 文件转换为 EPUB，输出到 output 目录
node convert.js -i ./input -o ./output
```

##### 示例 2: 指定 ebook-convert 路径

```bash
# macOS 示例
node convert.js -i ./input -o ./output -e /Applications/calibre.app/Contents/MacOS/ebook-convert

# Windows 示例
node convert.js -i ./input -o ./output -e "C:\Program Files\Calibre2\ebook-convert.exe"
```

##### 示例 3: 覆盖已存在的文件

```bash
# 如果输出目录已有同名文件，默认会跳过，使用 --overwrite 强制覆盖
node convert.js -i ./input -o ./output --overwrite
```

##### 示例 4: 递归子目录转换

```bash
# 工具会自动递归扫描 input 目录及其所有子目录
node convert.js -i ./books -o ./converted-books
```

#### 输出示例

```
📚 共找到 5 个 .mobi 文件

[1/5] 转换中 book1.mobi
[1/5] 成功 book1.mobi
[2/5] 转换中 book2.mobi
[2/5] 成功 book2.mobi
[3/5] 跳过 book3.epub（已存在）
...

──────────────────────────────────────────────
转换完成汇总：
  ✔ 成功：4 个
  ⊘ 跳过：1 个（已存在，未覆盖）
──────────────────────────────────────────────
```

---

## ❓ 常见问题

### Q1: 提示 "ebook-convert: command not found"

**解决方案：**

1. 确认已安装 Calibre
2. 将 Calibre 添加到系统 PATH
3. 或在命令行模式中使用 `-e` 参数指定完整路径

### Q2: Web 界面无法启动

**解决方案：**

1. 检查端口 3000 是否被占用
2. 修改 `server.js` 中的 `port` 变量
3. 确保依赖已正确安装：`npm install`

### Q3: 中文文件名乱码

**解决方案：**

- 本项目已内置中文文件名处理，无需额外配置
- 如遇问题，请确保使用现代浏览器（Chrome、Firefox、Edge 等）

### Q4: 转换失败

**可能原因：**

1. 源文件损坏或不是有效的 MOBI/EPUB 格式
2. Calibre 版本过旧
3. 文件正在被其他程序占用

**解决方案：**

- 更新 Calibre 到最新版本
- 检查源文件是否可以正常打开
- 查看终端或控制台的详细错误信息

### Q5: 如何批量下载时避免浏览器拦截？

**解决方案：**

- 在浏览器设置中允许该站点的弹出窗口
- 或逐个点击下载链接
- 批量下载功能已设置 2 秒延迟，减少被拦截概率

---

## 🛠️ 技术栈

### 后端

- **Node.js** - 运行环境
- **Express** - Web 框架
- **Multer** - 文件上传处理
- **Child Process** - 调用 ebook-convert 命令

### 前端

- 原生 HTML/CSS/JavaScript
- 拖拽上传
- 批量下载管理

### 核心转换

- **Calibre ebook-convert** - 电子书格式转换引擎

---

## 📝 项目结构

```
mobi-to-epub/
├── public/
│   └── index.html          # Web 界面
├── uploads/                 # 上传和转换文件目录（运行时自动创建）
├── convert.js              # 命令行工具
├── server.js               # Web 服务器
├── package.json            # 项目配置
└── README.md               # 使用说明（本文件）
```

---

## 📄 许可证

MIT License

---

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。
