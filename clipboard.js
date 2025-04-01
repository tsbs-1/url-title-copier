document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let title = urlParams.get('title');
    const url = urlParams.get('url');
    
    // If we have both parameters
    if (title && url) {
      // Attempt to fetch the page to get the H1 if possible
      fetch(url)
        .then(response => response.text())
        .then(html => {
          // Try to extract H1
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const h1 = doc.querySelector('h1');
          
          if (h1 && h1.textContent.trim()) {
            title = h1.textContent.trim();
          }
          
          performCopy(title, url);
        })
        .catch(error => {
          console.log("Could not fetch page, using tab title:", error);
          performCopy(title, url);
        });
    } else {
      document.getElementById('status').textContent = 'Error: Missing parameters';
    }
    
    function performCopy(title, url) {
      // Create the content
      const contentDiv = document.getElementById('content');
      
      // Method 1: Using a textarea and document.execCommand
      try {
        // Create a textarea for plain text backup
        const textarea = document.createElement('textarea');
        textarea.value = `${title} (${url})`;
        document.body.appendChild(textarea);
        
        // Create a rich content div for HTML format
        contentDiv.innerHTML = `<a href="${url}">${title}</a>`;
        contentDiv.contentEditable = 'true';
        contentDiv.style.position = 'fixed';
        contentDiv.style.top = '0';
        contentDiv.style.opacity = '0';
        contentDiv.style.pointerEvents = 'none';
        
        // Select the HTML content
        const range = document.createRange();
        range.selectNodeContents(contentDiv);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Try to copy HTML content
        const success = document.execCommand('copy');
        
        if (!success) {
          // If HTML format fails, try plain text
          textarea.select();
          document.execCommand('copy');
        }
        
        // Clean up
        selection.removeAllRanges();
        document.body.removeChild(textarea);
        
        document.getElementById('status').textContent = 'Link copied to clipboard!';
      } catch (e) {
        console.error("Copy error:", e);
        document.getElementById('status').textContent = 'Error copying link.';
      }
      
      // Method 2: Using the modern Clipboard API (as backup)
      try {
        navigator.clipboard.writeText(`${title} (${url})`);
        
        if (navigator.clipboard.write) {
          const htmlBlob = new Blob([`<a href="${url}">${title}</a>`], {type: 'text/html'});
          const textBlob = new Blob([`${title} (${url})`], {type: 'text/plain'});
          
          navigator.clipboard.write([
            new ClipboardItem({
              'text/html': htmlBlob,
              'text/plain': textBlob
            })
          ]);
        }
      } catch (e) {
        console.log("Clipboard API method attempted as backup:", e);
      }
    }
  });