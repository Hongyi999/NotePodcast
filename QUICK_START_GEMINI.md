# 🚀 Gemini API 快速开始指南

## 3分钟完成配置

### 步骤 1: 获取 API Key（1分钟）

1. 打开浏览器，访问：https://aistudio.google.com/app/apikey
2. 使用您的 Google 账户登录
3. 点击蓝色按钮 **"Create API Key"**
4. 选择项目或创建新项目
5. 复制生成的 API Key（格式：`AIzaSy...`）

### 步骤 2: 配置项目（30秒）

在项目根目录（`/Users/hongyizhao/Desktop/NoteMyPD/`）创建或编辑 `.env` 文件：

```bash
# 粘贴您的 API Key
VITE_GEMINI_API_KEY=AIzaSy粘贴您实际的密钥在这里
```

**重要提示：**
- 不要有多余的空格
- 不要用引号包裹密钥
- 确保 `.env` 文件在项目根目录

### 步骤 3: 测试 API（30秒）

在项目目录打开终端，运行：

```bash
cd /Users/hongyizhao/Desktop/NoteMyPD
node test-gemini.js YOUR_API_KEY
```

看到 ✅ 表示成功！

### 步骤 4: 启动应用（1分钟）

```bash
# 终端 1: 启动后端
npm run dev:server

# 终端 2: 启动前端（新终端窗口）
npm run dev
```

或者使用一行命令（带环境变量）：

```bash
# 后端
npm run dev:server

# 前端（新终端）
VITE_GEMINI_API_KEY='你的密钥' npm run dev
```

### 步骤 5: 验证（30秒）

1. 打开浏览器：http://localhost:5173
2. 输入小宇宙URL测试：
   ```
   https://www.xiaoyuzhoufm.com/episode/6960a90f74b7d64ad0067f8e
   ```
3. 观察控制台（F12），应该看到AI正常生成内容

---

## 🎉 完成！

现在您的应用已使用 Google Gemini API，享受：
- ✅ **免费配额**：每天 1,500 次请求
- ✅ **更稳定**：更少的 429 错误
- ✅ **高质量**：与智谱AI相当的生成质量

---

## ❓ 遇到问题？

### Q: 看到 "API key not configured"
**A:** 
1. 检查 `.env` 文件是否在正确位置
2. 确认变量名是 `VITE_GEMINI_API_KEY`
3. 重启开发服务器

### Q: 看到 403 错误
**A:**
1. 访问 https://console.cloud.google.com/
2. 启用 "Generative Language API"
3. 重新生成 API Key

### Q: 仍然看到 429 错误
**A:**
- Gemini 限制：60 次/分钟
- 等待 1 分钟后重试
- 检查是否多个窗口同时使用

### Q: 想回退到智谱AI
**A:** 查看 `MIGRATION_TO_GEMINI.md` 的"如何回退"部分

---

## 📚 更多信息

- 详细设置: `GEMINI_SETUP.md`
- 迁移说明: `MIGRATION_TO_GEMINI.md`
- 智谱AI设置: `ZHIPU_API_SETUP.md`（备用）

---

**祝您使用愉快！** 🎊
