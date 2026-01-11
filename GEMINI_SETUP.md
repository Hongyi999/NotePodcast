# Google Gemini API 设置指南

## 🎉 恭喜！您的应用已成功切换到 Google Gemini API

Google Gemini 提供免费配额，比智谱AI更加慷慨，适合个人项目使用。

---

## 📋 快速开始

### 第1步：获取 Gemini API Key

1. 访问 Google AI Studio: https://makersuite.google.com/app/apikey
   - 或者访问: https://aistudio.google.com/app/apikey

2. 使用您的 Google 账户登录

3. 点击 **"Create API Key"** 按钮

4. 选择一个现有的 Google Cloud 项目，或创建新项目

5. 复制生成的 API Key（格式类似：`AIzaSy...`）

### 第2步：配置环境变量

#### 方式 A：使用 .env 文件（推荐）

1. 在项目根目录创建或编辑 `.env` 文件：

```bash
# 删除或注释掉旧的智谱 API Key
# VITE_ZHIPU_API_KEY=your_old_key

# 添加 Gemini API Key
VITE_GEMINI_API_KEY=AIzaSy...你的实际API密钥...
```

2. 重启开发服务器：
```bash
# 停止当前服务（Ctrl+C）
npm run dev
npm run dev:server
```

#### 方式 B：直接在命令行传递（临时）

```bash
# 前端
VITE_GEMINI_API_KEY='你的API密钥' npm run dev

# 后端
npm run dev:server
```

---

## ✅ 验证配置

### 测试 API 是否正常工作

1. 启动服务器后，在浏览器打开：http://localhost:5173

2. 输入任意播客URL进行测试

3. 打开浏览器控制台（F12），应该看到：
   - ✅ 没有 "API key not configured" 错误
   - ✅ AI 摘要和转录正常生成
   - ✅ 没有 429 或配额不足错误

---

## 🆓 Gemini API 免费配额

### 免费额度（2024年数据，以官方为准）

- **每分钟请求数**: 60 RPM (Requests Per Minute)
- **每天请求数**: 1,500 RPD (Requests Per Day)
- **每月 token 数**: 完全免费，无限制（对于 gemini-pro 模型）

### 对比智谱AI

| 特性 | Gemini (Free) | 智谱AI (Free) |
|------|---------------|---------------|
| 每日请求 | 1,500 | ~100-500 |
| Token 限制 | 无限制 | 有限制 |
| 配额用完后 | 第二天重置 | 需充值 |
| 模型质量 | 优秀 | 优秀 |

---

## 🔍 常见问题

### Q1: 出现 "API key not configured" 错误

**解决方案：**
1. 确认 `.env` 文件中有 `VITE_GEMINI_API_KEY=...`
2. 确认已重启开发服务器
3. 检查 API Key 是否正确复制（没有多余空格）

### Q2: 出现 403 Forbidden 错误

**可能原因：**
- API Key 无效或已过期
- API Key 所属项目没有启用 Generative Language API

**解决方案：**
1. 访问 Google Cloud Console
2. 启用 "Generative Language API"
3. 重新生成 API Key

### Q3: 出现 429 Too Many Requests

**原因：**
- 超过每分钟 60 次请求限制
- 或超过每天 1,500 次请求限制

**解决方案：**
- 等待配额重置（通常是第二天）
- 如需更高配额，考虑升级到付费计划

### Q4: 生成的内容质量不够好

**优化建议：**
1. 提供更详细的 shownotes
2. 调整 `geminiApi.ts` 中的 `temperature` 参数（0.5-0.9）
3. 修改 prompt 提示词使其更加具体

---

## 🔧 高级配置

### 切换到其他 Gemini 模型

编辑 `src/services/geminiApi.ts`：

```typescript
// 默认使用 gemini-pro
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// 可选：使用更强大的模型（如果可用）
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
```

### 调整生成参数

在 `geminiApi.ts` 中修改 `generationConfig`：

```typescript
generationConfig: {
  temperature: 0.7,        // 创造性 (0.0-1.0)
  maxOutputTokens: 2500,   // 最大输出长度
  topP: 0.8,               // 核采样
  topK: 40,                // Top-K 采样
}
```

---

## 📊 监控使用情况

1. 访问 Google Cloud Console: https://console.cloud.google.com/
2. 选择您的项目
3. 导航到 "APIs & Services" → "Dashboard"
4. 查看 Generative Language API 的使用统计

---

## 🔄 回退到智谱AI

如果您想回退到智谱AI：

1. 在 `src/hooks/usePodcastData.ts` 中：
```typescript
// 改回
import { generateAISummary, generateTranscript } from '../services/zhipuApi';
```

2. 同样更新 `NotesModule.tsx` 和 `PodcastIntro.tsx`

3. 更新 `.env`：
```bash
VITE_ZHIPU_API_KEY=你的智谱密钥
# VITE_GEMINI_API_KEY=...
```

---

## 🌟 推荐的最佳实践

1. **不要提交 API Key 到 Git**
   - 确保 `.env` 在 `.gitignore` 中
   - 使用环境变量管理敏感信息

2. **合理使用 API**
   - 避免在短时间内频繁请求
   - 考虑添加缓存机制

3. **监控配额使用**
   - 定期检查 API 使用情况
   - 接近限制时考虑优化或升级

4. **准备降级方案**
   - 保留 zhipuApi.ts 文件作为备份
   - API 失败时提供友好提示

---

## 🆘 获取帮助

- **Gemini API 官方文档**: https://ai.google.dev/docs
- **Google AI Studio**: https://aistudio.google.com/
- **Stack Overflow**: 搜索 "google gemini api"

---

## ✨ 享受您的新 AI 助手！

Gemini 提供出色的性能和慷慨的免费配额，非常适合个人项目和中小型应用。

如有任何问题，请查看控制台日志或本文档的常见问题部分。
