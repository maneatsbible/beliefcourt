// D3.js loader utility for Truthbook visualizations
// Loads D3 from CDN if not already present

export async function loadD3() {
  if (window.d3) return window.d3;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
    script.async = true;
    script.onload = () => resolve(window.d3);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
