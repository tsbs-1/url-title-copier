// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === "copy_url_title") {
      // Get current active tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs || !tabs[0]) {
          console.error("No active tab found");
          return;
        }
        
        const currentTab = tabs[0];
        
        // Instead of trying to use clipboard in background script,
        // inject a content script to handle the copy operation
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          function: (tabTitle, tabUrl) => {
            // Try to get H1 first
            let title = tabTitle;
            try {
              const h1Elements = document.getElementsByTagName('h1');
              if (h1Elements.length > 0) {
                title = h1Elements[0].textContent.trim();
              }
            } catch (e) {
              console.error("Error getting H1:", e);
            }
            
            // Format options
            const linkText = `${title} (${tabUrl})`;
            const linkHtml = `<a href="${tabUrl}">${title}</a>`;
            
            // Create a temporary element for copying
            const textArea = document.createElement("textarea");
            textArea.value = linkText;
            document.body.appendChild(textArea);
            textArea.select();
            
            // Copy command
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            return { success, title, url: tabUrl };
          },
          args: [currentTab.title, currentTab.url]
        }, (results) => {
          // Show success badge after script injection completes
          if (results && results[0] && results[0].result && results[0].result.success) {
            showCopySuccess();
          }
        });
      });
    }
  });
  
  // Function to show copy success
  function showCopySuccess() {
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
    
    // Clear badge after 2 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 2000);
  }