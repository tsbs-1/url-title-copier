// Function to get h1 element from page
function getPageH1() {
    const h1Elements = document.getElementsByTagName('h1');
    if (h1Elements.length > 0) {
      return h1Elements[0].textContent.trim();
    }
    return document.title; // Return page title if no h1 exists
  }
  
  // Add message listener
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getH1") {
      sendResponse({h1: getPageH1()});
      return true; // Return true to support asynchronous response
    }
    
    // Handle copy request from background script
    if (request.action === "performCopy") {
      try {
        // Create blob for HTML content
        const htmlBlob = new Blob([request.html], { type: 'text/html' });
        // Create blob for text content
        const textBlob = new Blob([request.text], { type: 'text/plain' });
        
        // Use ClipboardItem if available (modern browsers)
        if (window.ClipboardItem) {
          navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': textBlob,
              'text/html': htmlBlob
            })
          ]).then(() => {
            sendResponse({success: true});
          }).catch(err => {
            console.error("Clipboard API failed:", err);
            fallbackCopy();
          });
        } else {
          fallbackCopy();
        }
        
        // Fallback method
        function fallbackCopy() {
          const textArea = document.createElement("textarea");
          textArea.value = request.text;
          document.body.appendChild(textArea);
          textArea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textArea);
          sendResponse({success: success});
        }
      } catch (err) {
        console.error("Copy error:", err);
        sendResponse({success: false, error: err.message});
      }
      
      return true; // Return true for asynchronous response
    }
  });