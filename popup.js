document.addEventListener('DOMContentLoaded', function() {
    const copyButton = document.getElementById('copyButton');
    const resultDiv = document.getElementById('result');
    const successDiv = document.getElementById('success');
  
    copyButton.addEventListener('click', function() {
      // 現在のタブの情報を取得
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        // content.jsのメッセージを送信してh1タイトルを取得
        chrome.tabs.sendMessage(currentTab.id, {action: "getH1"}, function(response) {
          // レスポンスがない場合（content.jsがロードされていない場合など）はタブのタイトルを使用
          const h1Title = response && response.h1 ? response.h1 : currentTab.title;
          const url = currentTab.url;
          
          // クリップボードへコピーする形式を選択
          const linkOptions = {
            html: `<a href="${url}">${h1Title}</a>`,
            text: `${h1Title} (${url})`,
            markdown: `[${h1Title}](${url})`
          };
          
          // HTMLとプレーンテキストの両方をクリップボードに書き込む
          navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': new Blob([linkOptions.text], { type: 'text/plain' }),
              'text/html': new Blob([linkOptions.html], { type: 'text/html' })
            })
          ]).then(function() {
            // コピー成功表示
            successDiv.style.display = 'block';
            setTimeout(function() {
              successDiv.style.display = 'none';
            }, 2000);
            
            // 結果を表示（HTMLタグがそのまま表示されるよう）
            resultDiv.textContent = linkOptions.html;
          });
        });
      });
    });
  });