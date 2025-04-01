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
        
        // Create active tab
        chrome.tabs.create(
          { 
            url: chrome.runtime.getURL("clipboard.html") + 
                 `?title=${encodeURIComponent(currentTab.title)}&url=${encodeURIComponent(currentTab.url)}`,
            active: false 
          },
          function(tab) {
            // After a short delay to ensure the page is loaded
            setTimeout(() => {
              // Show the success notification
              showCopySuccess();
              
              // Close the tab after giving it time to execute the copy
              setTimeout(() => {
                chrome.tabs.remove(tab.id);
              }, 500);
            }, 500);
          }
        );
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