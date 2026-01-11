/**
 * Gemini API 测试脚本
 * 
 * 用法：
 * node test-gemini.js YOUR_API_KEY
 * 
 * 或者设置环境变量：
 * GEMINI_API_KEY=your_key node test-gemini.js
 */

const apiKey = process.argv[2] || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ 错误：请提供 API Key');
  console.log('\n使用方法：');
  console.log('  node test-gemini.js YOUR_API_KEY');
  console.log('  或');
  console.log('  GEMINI_API_KEY=your_key node test-gemini.js');
  process.exit(1);
}

console.log('🔍 测试 Gemini API 连接...\n');

const testPrompt = '请用一句话介绍自己';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: testPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100,
    }
  }),
})
  .then(async (response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API 请求失败: ${response.status} - ${JSON.stringify(error)}`);
    }
    return response.json();
  })
  .then((data) => {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      console.log('✅ Gemini API 连接成功！\n');
      console.log('📝 测试响应：');
      console.log('─'.repeat(50));
      console.log(text);
      console.log('─'.repeat(50));
      console.log('\n🎉 恭喜！您的 API Key 配置正确，可以开始使用了。');
      console.log('\n下一步：');
      console.log('1. 在项目根目录创建 .env 文件');
      console.log('2. 添加：VITE_GEMINI_API_KEY=' + apiKey);
      console.log('3. 重启开发服务器：npm run dev');
    } else {
      console.error('⚠️  API 返回了空响应');
      console.log('完整响应：', JSON.stringify(data, null, 2));
    }
  })
  .catch((error) => {
    console.error('❌ 测试失败：', error.message);
    console.log('\n常见问题：');
    console.log('1. API Key 是否正确？');
    console.log('2. 是否启用了 Generative Language API？');
    console.log('3. 网络连接是否正常？');
    console.log('\n请访问 https://aistudio.google.com/app/apikey 检查您的 API Key');
  });
