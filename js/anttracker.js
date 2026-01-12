const antImages = ['images/ants/ant1.png', 'images/ants/ant2.png'];
const antSize = 32;
const antCount = 8; // Number of ants on screen at once
const ants = [];
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

function randomScreenEdgePoint() {
  const padding = 20;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  switch (edge) {
    case 0: return { x: Math.random() * (w - 2 * padding) + padding, y: -antSize };
    case 1: return { x: w + antSize, y: Math.random() * (h - 2 * padding) + padding };
    case 2: return { x: Math.random() * (w - 2 * padding) + padding, y: h + antSize };
    case 3: return { x: -antSize, y: Math.random() * (h - 2 * padding) + padding };
  }
}

function spawnAnt() {
  const ant = document.createElement('img');
  ant.src = antImages[0];
  ant.className = 'ant-border-img';
  ant.style.position = 'fixed';
  ant.style.width = antSize + 'px';
  ant.style.height = antSize + 'px';
  ant.style.pointerEvents = 'none';
  ant.style.zIndex = 99999;
  document.body.appendChild(ant);
  const start = randomScreenEdgePoint();
  ant.style.left = start.x + 'px';
  ant.style.top = start.y + 'px';
  return {
    el: ant,
    x: start.x,
    y: start.y,
    imgIndex: 0,
    progress: 0,
    speed: 0.002 + Math.random() * 0.01,
    lastImgFrame: 0
  };
}

function animateAnts() {
  for (let i = ants.length - 1; i >= 0; i--) {
    const ant = ants[i];
    // Move toward the current mouse position
    const dx = mouseX - ant.x;
    const dy = mouseY - ant.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      ant.x += dx * ant.speed;
      ant.y += dy * ant.speed;
    }
    // Angle so head points to cursor
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    ant.el.style.left = ant.x + 'px';
    ant.el.style.top = ant.y + 'px';
    ant.el.style.transform = `rotate(${angle}deg)`;
    // Animate legs
    ant.lastImgFrame++;
    if (ant.lastImgFrame % 8 === 0) {
      ant.imgIndex = 1 - ant.imgIndex;
      ant.el.src = antImages[ant.imgIndex];
    }
    // Remove if close enough to cursor (disappear instantly)
    if (dist < 30) {
      ant.el.remove();
      ants.splice(i, 1);
    }
  }
  requestAnimationFrame(animateAnts);
}

// Listen to pointermove for cursor position
window.addEventListener('pointermove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Listen to touch events for mobile: ants follow last touched position
window.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches.length > 0) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }
});
window.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length > 0) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }
});
window.addEventListener('touchend', (e) => {
  if (e.changedTouches && e.changedTouches.length > 0) {
    mouseX = e.changedTouches[0].clientX;
    mouseY = e.changedTouches[0].clientY;
  }
});

// Spawn ants at intervals, up to antCount
setInterval(() => {
  if (ants.length < antCount) {
    ants.push(spawnAnt());
  }
}, 700);

animateAnts();