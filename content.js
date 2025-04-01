// ページからh1要素を取得する関数
function getPageH1() {
    const h1Elements = document.getElementsByTagName('h1');
    if (h1Elements.length > 0) {
      return h1Elements[0].textContent.trim();
    }
    return document.title; // h1がない場合はページタイトルを返す
  }
  
  // メッセージリスナーを追加
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getH1") {
      sendResponse({h1: getPageH1()});
    }
  });