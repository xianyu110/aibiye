// API 测试脚本
const API_KEY = 'sk-DJiL3g5qnU3bfNWI2nvZTNXRWW0MhCZLA8eghVcHw4UWa4Ph';
const DEEPSEEK_URL = 'https://for.shuo.bar/v1/chat/completions';
const GEMINI_URL = 'https://for.shuo.bar/v1beta/models/gemini-2.0-flash:generateContent';

console.log('🧪 开始测试 API 连接...\n');

// 测试 DeepSeek API
async function testDeepSeek() {
  console.log('📝 测试 DeepSeek API...');
  console.log('URL:', DEEPSEEK_URL);
  console.log('Model: deepseek-chat\n');

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '你好，请回复"测试成功"'
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ DeepSeek API 测试成功！');
      console.log('响应:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ DeepSeek API 测试失败');
      console.log('状态码:', response.status, response.statusText);
      console.log('错误详情:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ DeepSeek API 请求失败');
    console.log('错误:', error.message);
    return false;
  }
}

// 测试 Gemini API
async function testGemini() {
  console.log('\n📝 测试 Gemini API...');
  console.log('URL:', GEMINI_URL);
  console.log('Model: gemini-2.0-flash\n');

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: '你好，请回复"测试成功"'
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Gemini API 测试成功！');
      console.log('响应:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ Gemini API 测试失败');
      console.log('状态码:', response.status, response.statusText);
      console.log('错误详情:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Gemini API 请求失败');
    console.log('错误:', error.message);
    return false;
  }
}

// 运行测试
(async () => {
  const deepseekOk = await testDeepSeek();
  const geminiOk = await testGemini();

  console.log('\n' + '='.repeat(50));
  console.log('测试结果汇总:');
  console.log('DeepSeek API:', deepseekOk ? '✅ 通过' : '❌ 失败');
  console.log('Gemini API:', geminiOk ? '✅ 通过' : '❌ 失败');
  console.log('='.repeat(50));

  if (deepseekOk && geminiOk) {
    console.log('\n🎉 所有 API 测试通过！可以提交代码了。');
  } else {
    console.log('\n⚠️  部分 API 测试失败，请检查配置。');
    console.log('\n💡 建议:');
    if (!deepseekOk) {
      console.log('  - 检查 DeepSeek API Key 是否有效');
      console.log('  - 确认中转 API 地址是否正确');
      console.log('  - 查看详细错误信息');
    }
    if (!geminiOk) {
      console.log('  - 检查 Gemini API Key 是否有效');
      console.log('  - 确认中转 API 支持 Gemini');
      console.log('  - 如不需要文档上传功能，可禁用 Gemini');
    }
  }
})();
