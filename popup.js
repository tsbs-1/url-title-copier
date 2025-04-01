// Function to show success message
function showSuccess() {
    successDiv.style.display = 'block';
    setTimeout(function() {
      successDiv.style.display = 'none';
    }, 2000);
  }document.addEventListener('DOMContentLoaded', function() {
const copyButton = document.getElementById('copyButton');
const resultDiv = document.getElementById('result');
const successDiv = document.getElementById('success');

// Function to copy URL and title
function copyUrlAndTitle() {
  // Get current tab information
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs || !tabs[0]) {
      console.error("No active tab found");
      return;
    }
    
    const currentTab = tabs[0];
    
    try {
      // Send message to content.js to get h1 title
      chrome.tabs.sendMessage(currentTab.id, {action: "getH1"}, function(response) {
        // Handle errors
        if (chrome.runtime.lastError) {
          console.log("Could not connect to content script. Using tab title instead.");
          performCopy(currentTab.title, currentTab.url);
          return;
        }
        
        // If no response, use tab title
        const h1Title = response && response.h1 ? response.h1 : currentTab.title;
        const url = currentTab.url;
        
        performCopy(h1Title, url);
      });
    } catch (error) {
      console.error("Error:", error);
      performCopy(currentTab.title, currentTab.url);
    }
  });
}

// Function to perform copy operation
function performCopy(title, url) {
  // Create HTML link
  const htmlContent = `<a href="${url}">${title}</a>`;
  const textContent = `${title} (${url})`;
  
  // Create a container for the HTML link
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  container.setAttribute('contenteditable', 'true');
  document.body.appendChild(container);
  
  // Select the content
  const range = document.createRange();
  range.selectNodeContents(container);
  
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  // Copy the selected content
  const success = document.execCommand('copy');
  
  // Clean up
  selection.removeAllRanges();
  document.body.removeChild(container);
  
  if (success) {
    showSuccess();
    resultDiv.textContent = htmlContent;
  } else {
    // Fallback to text-only copy if HTML copy fails
    const textArea = document.createElement('textarea');
    textArea.value = textContent;
    document.body.appendChild(textArea);
    textArea.select();
    
    const textSuccess = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (textSuccess) {
      showSuccess();
      resultDiv.textContent = textContent + " (テキスト形式のみコピーされました)";
    } else {
      resultDiv.textContent = "コピーに失敗しました。";
    }
  }
}

// Add click event listener to button
copyButton.addEventListener('click', copyUrlAndTitle);

// Execute copy function immediately if opened via shortcut
if (window.location.hash === '#directCopy') {
  copyUrlAndTitle();
}
});