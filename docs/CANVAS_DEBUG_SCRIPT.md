# Quick Debug Script

Run this in Browser Console (F12) after uploading image:

```javascript
// Find the canvas element
const canvas = document.querySelector('.seat-map-canvas');

if (!canvas) {
  console.log('❌ Canvas element not found!');
} else {
  console.log('✅ Canvas element found');
  
  // Get computed styles
  const styles = window.getComputedStyle(canvas);
  
  // Get inline style
  const inlineStyle = canvas.getAttribute('style');
  
  console.log('Canvas inline style:', inlineStyle);
  console.log('Canvas computed backgroundImage:', styles.backgroundImage);
  console.log('Canvas computed backgroundSize:', styles.backgroundSize);
  console.log('Canvas dimensions:', {
    width: canvas.offsetWidth,
    height: canvas.offsetHeight,
    clientWidth: canvas.clientWidth,
    clientHeight: canvas.clientHeight
  });
  
  // Check if image is loading
  if (styles.backgroundImage.includes('url')) {
    console.log('✅ Background image URL is set');
    
    // Try to test if URL is accessible
    const urlMatch = styles.backgroundImage.match(/url\("?([^"]+)"?\)/);
    if (urlMatch && urlMatch[1]) {
      const imageUrl = urlMatch[1];
      console.log('🔗 Image URL:', imageUrl);
      
      // Test if URL is accessible
      fetch(imageUrl, { method: 'HEAD' })
        .then(response => {
          console.log(`✅ Image URL is accessible (status: ${response.status})`);
        })
        .catch(error => {
          console.log(`❌ Image URL is NOT accessible:`, error);
        });
    }
  } else {
    console.log('❌ No background image URL set');
  }
}
```

**What to look for:**
- `Canvas element found` → Canvas exists ✓
- `Background image URL is set` → CSS has URL ✓
- `Image URL is accessible (status: 200)` → Storage allows read ✓
- `Image URL shows the actual URL` → Copy and test manually

---

**After running:**
1. Share the output
2. Check if canvas dimensions are reasonable (should be large)
3. Check if background image URL matches the upload log URL
