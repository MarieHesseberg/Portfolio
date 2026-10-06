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
      const width = 1240, height = 1550, stepX = 4, stepY = 6;
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
      context.font = 'bold 7px Consolas, monospace'; context.textBaseline = 'top';
      const code = '01</>{}[]const;return;function;SELECT;git;npm;#$>_010101';
      for (let y = 0; y < height; y += stepY) {
        for (let x = 0; x < width; x += stepX) {
          const i = (Math.min(height - 1, y + 3) * width + Math.min(width - 1, x + 2)) * 4;
          let light = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
          const nx = (x / width - 0.5) / 0.53, ny = (y / height - 0.49) / 0.64;
          const fade = Math.min(1, Math.max(0, (1.13 - Math.sqrt(nx * nx + ny * ny)) * 4));
          // Stronger tonal separation keeps eyes, glasses, hair and facial contours
          // readable at normal size, while fine glyphs remain visible close up.
          light = Math.min(1, Math.max(0, (light - 0.12) * 1.65)) * fade * Math.min(1, (height - y) / 150);
          if (light < 0.025) continue;
          context.fillStyle = `rgb(${Math.round(12 + light * 180)},${Math.round(25 + light * 230)},${Math.round(17 + light * 185)})`;
          context.fillText(code[(Math.floor(x / stepX) + Math.floor(y / stepY) * 17) % code.length], x, y);
        }
      }
      surface.classList.add('rendered'); toggle.hidden = false;
      const reveal = image.cloneNode();
      reveal.className = 'portrait portraitReveal'; reveal.alt = '';
      reveal.setAttribute('aria-hidden', 'true');
      surface.append(reveal);
      let pinned = false, hovering = false;
      const update = () => {
        surface.classList.toggle('revealed', pinned || hovering);
        toggle.textContent = pinned ? 'Vis kodeportrett' : 'Vis originalbilde';
        toggle.setAttribute('aria-pressed', String(pinned));
      };
      surface.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse') return;
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty('--drop-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        surface.style.setProperty('--drop-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
        hovering = true; update();
      });
      surface.addEventListener('pointerleave', () => { hovering = false; update(); });
      toggle.addEventListener('click', () => {
        pinned = !pinned; update();
      });
      update();
    } catch (_) {
      // The real photograph remains visible if canvas sampling is unavailable.
      surface.classList.remove('rendered');
    }
  }
  if (image.complete && image.naturalWidth) render();
  else image.addEventListener('load', render, { once: true });
})();
