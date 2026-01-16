# 🚀 NotePodcast 快速部署指南（5分钟版）

**适合**: 想快速上线的您  
**时间**: 5-10分钟

---

## 📋 三步部署法

### 第一步：注册GitHub（如已有账号，跳过）

1. 打开 https://github.com
2. 点击右上角 "Sign up"
3. 填写邮箱、密码、用户名
4. 验证邮箱

---

### 第二步：创建仓库并推送代码

#### 2.1 在GitHub上创建仓库

1. 登录GitHub
2. 点击右上角 "+" → "New repository"
3. 填写：
   - Repository name: **notepodcast**
   - 选择: **Public** (必须是Public才能用GitHub Pages)
4. 点击 "Create repository"

#### 2.2 复制仓库地址

在新页面中，找到类似这样的地址：
```
https://github.com/YOUR_USERNAME/notepodcast.git
```
点击复制按钮 📋

#### 2.3 在终端执行（请替换YOUR_USERNAME）

```bash
# 进入项目目录
cd /Users/hongyizhao/Desktop/NoteMyPD

# 添加远程仓库（把YOUR_USERNAME改成您的用户名！）
git remote add origin https://github.com/YOUR_USERNAME/notepodcast.git

# 推送代码（第一次推送）
git push -u origin deploy-v1.0.0

# 推送其他分支
git push origin main
git push origin v2.0-development
git push origin v1.0.0
```

**输入凭证时**：
- Username: 您的GitHub用户名
- Password: 使用Personal Access Token（不是密码！）

**如何获取Token？**
1. 访问 https://github.com/settings/tokens
2. "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成后复制（只显示一次！）

---

### 第三步：构建并部署

#### 3.1 安装gh-pages工具

```bash
npm install --save-dev gh-pages
```

#### 3.2 构建项目

```bash
npm run build
```

#### 3.3 部署到GitHub Pages

```bash
npx gh-pages -d dist -b gh-pages
```

等待完成后，访问：
```
https://YOUR_USERNAME.github.io/notepodcast/
```

---

## ✅ 完成！

您的网站已经上线了！🎉

### 测试一下：

1. 打开 https://YOUR_USERNAME.github.io/notepodcast/
2. 等待1-2分钟（首次部署需要时间）
3. 看到NotePodcast首页 = 成功！

---

## 🔄 以后如何更新？

当您修改代码后：

```bash
# 1. 构建
npm run build

# 2. 部署
npx gh-pages -d dist -b gh-pages
```

就这么简单！

---

## ⚠️ 遇到问题？

### 问题1: Token是什么？在哪里找？
**答**: 
1. https://github.com/settings/tokens
2. Generate new token (classic)
3. 勾选 repo
4. 复制token使用

### 问题2: 网站显示404
**答**: 等待1-2分钟，GitHub Pages需要部署时间

### 问题3: 样式丢失
**答**: 检查 vite.config.ts 中的 base 是否设置为 '/notepodcast/'

---

## 📞 需要详细教程？

查看完整指南：`GITHUB_DEPLOYMENT_GUIDE.md`

---

**祝您部署顺利！🚀**
