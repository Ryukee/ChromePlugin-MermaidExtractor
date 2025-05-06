// 创建弹出输入框
function createPopup() {
    // 检查是否已经存在弹窗
    if (document.getElementById('mermaid-search-popup')) {
      return;
    }
    
    // 创建弹窗容器
    const popup = document.createElement('div');
    popup.id = 'mermaid-search-popup';
    popup.className = 'mermaid-popup';
    
    // 创建弹窗内容
    popup.innerHTML = `
      <div class="mermaid-popup-content">
        <h3>搜索 Mermaid 图表</h3>
        <input type="text" id="mermaid-keyword" placeholder="输入关键字">
        <div class="button-group">
          <button id="mermaid-search-btn">搜索</button>
          <button id="mermaid-cancel-btn">取消</button>
        </div>
        <div id="mermaid-result" class="hidden">
          <p id="mermaid-result-text"></p>
        </div>
      </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .mermaid-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        z-index: 10000;
      }
      .mermaid-popup-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .mermaid-popup h3 {
        margin-top: 0;
        margin-bottom: 10px;
      }
      .mermaid-popup input {
        padding: 8px;
        width: 300px;
      }
      .button-group {
        display: flex;
        gap: 10px;
      }
      .mermaid-popup button {
        padding: 8px 15px;
        cursor: pointer;
      }
      #mermaid-result {
        margin-top: 10px;
        padding: 10px;
        background-color: #f0f0f0;
        border-radius: 3px;
      }
      .hidden {
        display: none;
      }
      .success {
        color: green;
      }
      .error {
        color: red;
      }
    `;
    
    // 添加到页面
    document.body.appendChild(style);
    document.body.appendChild(popup);
    
    // 添加事件监听
    document.getElementById('mermaid-search-btn').addEventListener('click', searchMermaid);
    document.getElementById('mermaid-cancel-btn').addEventListener('click', () => {
      document.getElementById('mermaid-search-popup').remove();
    });
  }
  
  // 搜索 Mermaid 图表
  function searchMermaid() {
    const keyword = document.getElementById('mermaid-keyword').value.trim();
    const resultDiv = document.getElementById('mermaid-result');
    const resultText = document.getElementById('mermaid-result-text');
    
    if (!keyword) {
      resultDiv.classList.remove('hidden');
      resultText.textContent = '请输入关键字';
      resultText.className = 'error';
      return;
    }
    
    // 获取页面的 HTML 源代码
    const htmlSource = document.documentElement.outerHTML;
    
    // 使用正则表达式查找 ```mermaid 到 ``` 之间的内容，同时包含关键字
    const regex = /```mermaid([\s\S]*?)```/g;
    let match;
    let found = false;
    
    while ((match = regex.exec(htmlSource)) !== null) {
      const mermaidContent = match[0]; // 完整的匹配（包括 ```mermaid 和 ```）
      const mermaidCode = match[1]; // 仅 mermaid 代码内容
      
      if (mermaidContent.includes(keyword)) {
        // 找到包含关键字的 mermaid 代码

        let mermaidString = decodeEscapedString(mermaidContent);

        navigator.clipboard.writeText(mermaidString).then(() => {
          resultDiv.classList.remove('hidden');
          resultText.textContent = '已复制到剪贴板！';
          resultText.className = 'success';
          
          // 向 background.js 发送消息
          chrome.runtime.sendMessage({ 
            action: "copyToClipboard", 
            data: mermaidString 
          });
        }).catch(err => {
          resultDiv.classList.remove('hidden');
          resultText.textContent = '复制失败：' + err;
          resultText.className = 'error';
        });
        
        found = true;
        break;
      }
    }
    
    if (!found) {
      resultDiv.classList.remove('hidden');
      resultText.textContent = '未找到包含关键字的 Mermaid 图表';
      resultText.className = 'error';
    }
  }

  
/**
 * 解码字符串中的各种转义序列和Unicode编码
 * 处理:
 * 1. JavaScript转义序列 (\n, \t, \r, \", \', \\)
 * 2. Unicode编码 (\uXXXX)
 * 3. HTML实体编码 (&lt;, &gt;, &amp;, &quot;, &#39;, &#x..., &#...)
 * 4. 常见的Unicode表示法 (\u003c 等)
 *
 * @param {string} str 需要解码的字符串
 * @return {string} 解码后的字符串
 */
function decodeEscapedString(str) {
    if (!str || typeof str !== 'string') {
      return str;
    }
    
    // 第1步: 处理JavaScript字符串转义序列
    let result = str
      .replace(/\\n/g, '\n')    // 换行符
      .replace(/\\r/g, '\r')    // 回车符
      .replace(/\\t/g, '\t')    // 制表符
      .replace(/\\'/g, '\'')    // 单引号
      .replace(/\\"/g, '"')     // 双引号
      .replace(/\\\\/g, '\\');  // 反斜杠
      
    // 第2步: 处理Unicode转义序列 \uXXXX
    result = result.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
    
    // 第3步: 处理十六进制HTML实体 &#x...;
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
    
    // 第4步: 处理十进制HTML实体 &#...;
    result = result.replace(/&#(\d+);/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 10));
    });
    
    // 第5步: 处理命名HTML实体
    const htmlEntities = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': "'",
      '&nbsp;': ' ',
      '&copy;': '©',
      '&reg;': '®',
      '&deg;': '°',
      '&pound;': '£',
      '&euro;': '€',
      '&yen;': '¥',
      '&trade;': '™'
      // 可以根据需要添加更多实体
    };
    
    for (const [entity, char] of Object.entries(htmlEntities)) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }
    
    return result;
  }
  
  
  // 执行
  createPopup();