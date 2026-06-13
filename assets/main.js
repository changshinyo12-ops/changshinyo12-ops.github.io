/* Shared interactions: nav, cursor glow, reveal, counters, card spotlight, helix */
(function(){
  // mobile nav
  window.toggleNav = function(){ document.querySelector('.nav-links')?.classList.toggle('open'); };

  // cursor glow
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // animated counters
  function animateCount(el){
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1400; const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.round(eased * target) : (eased * target).toFixed(1);
      el.textContent = val + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => { if(en.isIntersecting){ animateCount(en.target); cio.unobserve(en.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  // card spotlight
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100)+'%');
      card.style.setProperty('--my', ((e.clientY - r.top)/r.height*100)+'%');
    });
  });

  // magnetic buttons
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.25}px, ${(e.clientY-r.top-r.height/2)*0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  // DNA helix canvas
  const canvas = document.getElementById('helix');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;
    const pair = ['#c8ff3d','#38e8ff','#ff4da6','#9b6bff'];
    function resize(){
      const dpr = window.devicePixelRatio || 1;
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); window.addEventListener('resize', resize);
    function draw(){
      ctx.clearRect(0,0,W,H);
      const cx = W/2, n = 26, span = H*0.78, top = H*0.11, amp = W*0.26;
      for(let i=0;i<n;i++){
        const y = top + (i/(n-1))*span;
        const ph = t + i*0.42;
        const x1 = cx + Math.sin(ph)*amp;
        const x2 = cx + Math.sin(ph+Math.PI)*amp;
        const d1 = (Math.sin(ph)+1)/2, d2 = (Math.sin(ph+Math.PI)+1)/2;
        // rung
        ctx.strokeStyle = `rgba(255,255,255,${0.08+0.12*Math.abs(Math.cos(ph))})`;
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke();
        // nodes
        const c = pair[i%pair.length];
        node(x1,y,3+4*d1,c,d1); node(x2,y,3+4*d2,pair[(i+2)%pair.length],d2);
      }
      t += 0.025; requestAnimationFrame(draw);
    }
    function node(x,y,r,c,a){
      ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fillStyle=c; ctx.globalAlpha=0.35+0.65*a;
      ctx.shadowColor=c; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1;
    }
    draw();
  }


  // lightbox for clickable photos
  const lb=document.createElement('div');
  lb.className='lightbox';
  lb.innerHTML='<span class="lb-close">&times;</span><img alt=""><div class="lb-cap"></div>';
  document.body.appendChild(lb);
  const lbImg=lb.querySelector('img'), lbCap=lb.querySelector('.lb-cap');
  function closeLB(){ lb.classList.remove('open'); }
  lb.addEventListener('click', closeLB);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLB(); });
  document.querySelectorAll('.ph.click').forEach(p=>{
    p.addEventListener('click', ()=>{
      const im=p.querySelector('img'); if(!im) return;
      lbImg.src=im.src; lbCap.textContent=p.dataset.cap||im.alt||'';
      lb.classList.add('open');
    });
  });

  // active nav by filename
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if(a.getAttribute('href') === path) a.classList.add('active');
  });
})();
