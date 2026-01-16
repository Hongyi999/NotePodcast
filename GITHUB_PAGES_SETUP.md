# GitHub Pages 手动配置指南

## 🎯 问题：网站404

您的代码和gh-pages分支都已就绪，但GitHub Pages需要手动启用。

---

## ✅ 解决方案：3个步骤

### 第1步：确保仓库是公开的（Public）

1. 访问：https://github.com/Hongyi999/NotePodcast
2. 点击右上角 **Settings**
3. 滚动到页面底部 **"Danger Zone"**
4. 查看 **"Change repository visibility"**
5. 如果是Private（私有），点击改为 **Public（公开）**
   - 输入仓库全名确认：`Hongyi999/NotePodcast`
   - 点击 "I understand, change repository visibility"

**为什么要公开？**
- GitHub Pages免费服务只支持公开仓库
- 私有仓库需要GitHub Pro订阅

---

### 第2步：启用GitHub Pages

1. 在Settings页面，左侧菜单找到 **"Pages"**
2. 在 **"Build and deployment"** 部分：

   **Source（来源）**：
   - 选择：`Deploy from a branch`

   **Branch（分支）**：
   - 第一个下拉菜单：选择 `gh-pages`
   - 第二个下拉菜单：选择 `/ (root)`
   
3. 点击 **"Save"** 按钮

---

### 第3步：等待部署完成

1. 点击Save后，页面会显示处理中
2. 等待 **1-2分钟**
3. 刷新Pages设置页面
4. 应该看到绿色提示：
   ```
   ✅ Your site is live at https://Hongyi999.github.io/NotePodcast/
   ```

---

## 🔍 验证步骤

### 检查1：Pages是否启用

访问：https://github.com/Hongyi999/NotePodcast/settings/pages

应该看到：
```
✅ Your site is live at https://Hongyi999.github.io/NotePodcast/
```

### 检查2：部署工作流

访问：https://github.com/Hongyi999/NotePodcast/actions

应该看到：
- "pages build and deployment" 工作流
- 最新的一条显示 ✅ 绿色对勾

### 检查3：访问网站

访问：https://Hongyi999.github.io/NotePodcast/

应该看到NotePodcast的首页！

---

## ❓ 常见问题

### Q1: 找不到Settings标签？
**A**: 您可能没有仓库的管理员权限，或者浏览器窗口太窄，Settings在"..."菜单里。

### Q2: 找不到Pages选项？
**A**: 
1. 确认仓库是Public（公开）
2. Pages选项在Settings左侧菜单靠下的位置

### Q3: Pages设置里看不到gh-pages分支？
**A**: 
1. 刷新页面
2. 检查gh-pages分支是否存在：https://github.com/Hongyi999/NotePodcast/tree/gh-pages
3. 如果不存在，回到项目运行：`npx gh-pages -d dist -b gh-pages`

### Q4: 保存后还是404？
**A**: 
1. 等待2-3分钟（首次部署较慢）
2. 清除浏览器缓存（Cmd+Shift+R）
3. 尝试无痕模式访问
4. 检查Actions页面确认部署完成

### Q5: 显示"Your site is ready to be published"？
**A**: 
1. 这是正常的，等待1-2分钟
2. 刷新页面，会变成"Your site is live"

---

## 🎯 快速配置命令

如果您想重新部署，在终端执行：

```bash
# 进入项目目录
cd /Users/hongyizhao/Desktop/NoteMyPD

# 构建
npm run build

# 部署
npx gh-pages -d dist -b gh-pages
```

然后回到GitHub网站配置Pages设置。

---

## 📊 配置对照表

| 设置项 | 应该选择的值 |
|--------|-------------|
| Repository Visibility | **Public** ✅ |
| Pages Source | **Deploy from a branch** |
| Pages Branch | **gh-pages** |
| Pages Folder | **/ (root)** |

---

## 🎉 成功标志

当一切配置正确后，您会看到：

### 在GitHub Pages设置页面：
```
🟢 Your site is live at https://Hongyi999.github.io/NotePodcast/

Visit site
```

### 在浏览器中：
访问 https://Hongyi999.github.io/NotePodcast/ 会看到您的NotePodcast首页！

---

## 🆘 还是不行？

如果按照以上步骤操作后仍然无法访问，请提供：

1. **GitHub Pages设置页面的截图**（Settings → Pages）
2. **仓库可见性**（Public还是Private？）
3. **Actions页面截图**（最新的部署工作流状态）
4. **访问网站时看到的具体错误信息**

---

**祝您部署顺利！** 🚀
