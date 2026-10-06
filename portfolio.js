(() => {
  'use strict';
  const links = [...document.querySelectorAll('.navLinks a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => {
        if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-125px 0px -45% 0px', threshold: [0, 0.2, 0.5] });
    links.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
  }
  const image = document.querySelector('.portrait');
  const canvas = document.querySelector('.codePortrait');
  const surface = document.querySelector('.portraitSurface');
  const toggle = document.querySelector('.portraitToggle');
  if (!image || !canvas || !surface) return;
  function render() {
    try {
      // One bounded render, without an animation loop or thousands of DOM nodes.
      const width = 960, height = 1200, stepX = 4, stepY = 6;
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d');
      const sample = document.createElement('canvas');
      sample.width = width; sample.height = height;
      const source = sample.getContext('2d', { willReadFrequently: true });
      if (!context || !source) return;
      // Match the fallback's cover crop and object-position.
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const sw = image.naturalWidth * scale, sh = image.naturalHeight * scale;
      source.drawImage(image, (width - sw) / 2, (height - sh) * 0.48, sw, sh);
      const pixels = source.getImageData(0, 0, width, height).data;
      context.fillStyle = '#060b08'; context.fillRect(0, 0, width, height);
      context.font = 'bold 8px Consolas, monospace'; context.textBaseline = 'top';
      const code = '01</>{}[]const;return;function;SELECT;git;npm;#$>_010101';
      for (let y = 0; y < height; y += stepY) {
        for (let x = 0; x < width; x += stepX) {
          const i = ((y + 3) * width + x + 2) * 4;
          let light = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
          const nx = (x / width - 0.5) / 0.53, ny = (y / height - 0.49) / 0.64;
          const fade = Math.min(1, Math.max(0, (1.13 - Math.sqrt(nx * nx + ny * ny)) * 4));
          light = Math.pow(light, 0.85) * fade * Math.min(1, (height - y) / 150);
          if (light < 0.025) continue;
          context.fillStyle = `rgb(${Math.round(15 + light * 140)},${Math.round(29 + light * 225)},${Math.round(20 + light * 155)})`;
          context.fillText(code[(Math.floor(x / stepX) + Math.floor(y / stepY) * 17) % code.length], x, y);
        }
      }
      surface.classList.add('rendered'); toggle.hidden = false;
      toggle.addEventListener('click', () => {
        const rendered = surface.classList.toggle('rendered'); surface.classList.toggle('original', !rendered); toggle.textContent = rendered ? 'Vis originalbilde' : 'Vis kodeportrett';
      });
    } catch (_) {
      // The real photograph remains visible if canvas sampling is unavailable.
      surface.classList.remove('rendered');
    }
  }
  if (image.complete && image.naturalWidth) render();
  else image.addEventListener('load', render, { once: true });
})();


