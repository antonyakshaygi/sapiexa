(function(){
"use strict";

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.hero-ai-canvas').forEach((canvas) => {
  const hero = canvas.closest('.hero');
  if(!hero) return;
  const ctx = canvas.getContext('2d');
  if(!ctx) return;

  const COLORS = ['94,234,212', '139,124,246', '255,180,84']; // cyan, violet, amber (rgb triplets)
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  let running = false, visible = true, raf = null;

  function nodeCount(){
    if(w < 640) return 30;
    if(w < 1000) return 46;
    return 62;
  }

  function makeNodes(){
    const n = nodeCount();
    nodes = Array.from({ length:n }, () => ({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.16,
      vy: (Math.random()-0.5)*0.16,
      r: 1.1 + Math.random()*1.6,
      c: COLORS[Math.floor(Math.random()*COLORS.length)]
    }));
  }

  function resize(){
    const rect = hero.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.max(1, Math.round(w*dpr));
    canvas.height = Math.max(1, Math.round(h*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
    makeNodes();
  }

  const LINK_DIST = 130;

  function drawFrame(){
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < LINK_DIST){
          const alpha = (1 - dist/LINK_DIST) * 0.22;
          ctx.strokeStyle = `rgba(${a.c},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    for(const p of nodes){
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.c},0.85)`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
  }

  function step(){
    if(!running) return;
    raf = requestAnimationFrame(step);
    if(!visible) return;
    for(const p of nodes){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -10) p.x = w+10; else if(p.x > w+10) p.x = -10;
      if(p.y < -10) p.y = h+10; else if(p.y > h+10) p.y = -10;
    }
    drawFrame();
  }

  function start(){ if(running || REDUCED_MOTION) return; running = true; raf = requestAnimationFrame(step); }
  function stop(){ running = false; if(raf) cancelAnimationFrame(raf); }

  resize();
  drawFrame();
  if(!REDUCED_MOTION) start();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); drawFrame(); }, 150);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => { visible = entry.isIntersecting; });
  }, { threshold:0.05 });
  io.observe(hero);
});

})();
