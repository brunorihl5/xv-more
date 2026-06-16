/* ================= GATE ================= */
const gate = document.getElementById('gate');
const btnEntrar = document.getElementById('btnEntrar');
const musicPlayer = document.getElementById('music-player');
const bgAudio = document.getElementById('bgAudio');
const musicToggle = document.getElementById('musicToggle');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const eq = document.getElementById('eq');

// petals on gate
const petalsContainer = document.getElementById('petals-container');
const petalChars = ['✦','✧','♡','❀'];
for(let i=0;i<18;i++){
  const p = document.createElement('div');
  p.className='petal';
  p.textContent = petalChars[Math.floor(Math.random()*petalChars.length)];
  p.style.left = Math.random()*100+'%';
  p.style.fontSize = (10+Math.random()*14)+'px';
  p.style.animationDuration = (6+Math.random()*8)+'s';
  p.style.animationDelay = (Math.random()*6)+'s';
  petalsContainer.appendChild(p);
}

let audioStarted = false;
bgAudio.addEventListener('error', ()=>{ setPlayingUI(false); });
function tryPlayAudio(){
  if(audioStarted) return;
  bgAudio.volume = 0.55;
  bgAudio.play().then(()=>{
    audioStarted = true;
    setPlayingUI(true);
  }).catch(()=>{ setPlayingUI(false); });
}

btnEntrar.addEventListener('click', ()=>{
  gate.classList.add('hidden');
  document.body.style.overflow='auto';
  musicPlayer.classList.remove('hide');
  tryPlayAudio();
  launchEntryConfetti();
  setTimeout(()=>{ document.querySelectorAll('.hero .reveal').forEach(el=>el.classList.add('in')); }, 200);
});

document.body.style.overflow='hidden';

/* ================= REVEAL ON SCROLL ================= */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
    }
  });
},{threshold:.15});
revealEls.forEach(el=>io.observe(el));

/* ================= MUSIC TOGGLE ================= */
function setPlayingUI(playing){
  iconPlay.style.display = playing? 'none':'block';
  iconPause.style.display = playing? 'block':'none';
  eq.classList.toggle('paused', !playing);
}
musicToggle.addEventListener('click', ()=>{
  if(bgAudio.paused){
    bgAudio.play().then(()=>setPlayingUI(true)).catch(()=>{});
  } else {
    bgAudio.pause();
    setPlayingUI(false);
  }
});

/* ================= COUNTDOWN ================= */
// Fecha del evento: 24 de octubre de 2026, 21:30 (hora Argentina UTC-3)
const eventDate = new Date('2026-10-24T21:30:00-03:00').getTime();
const elDays = document.getElementById('cd-days');
const elHours = document.getElementById('cd-hours');
const elMins = document.getElementById('cd-mins');
const elSecs = document.getElementById('cd-secs');
const countdownBox = document.getElementById('countdown');

function pad(n){return n.toString().padStart(2,'0');}
function updateCountdown(){
  const now = Date.now();
  let diff = eventDate - now;
  if(diff <= 0){
    countdownBox.innerHTML = '<div class="countdown-finished">¡Es hoy! ♡</div>';
    clearInterval(timer);
    return;
  }
  const days = Math.floor(diff/(1000*60*60*24));
  diff -= days*1000*60*60*24;
  const hours = Math.floor(diff/(1000*60*60));
  diff -= hours*1000*60*60;
  const mins = Math.floor(diff/(1000*60));
  diff -= mins*1000*60;
  const secs = Math.floor(diff/1000);
  elDays.textContent = pad(days);
  elHours.textContent = pad(hours);
  elMins.textContent = pad(mins);
  elSecs.textContent = pad(secs);
}
updateCountdown();
const timer = setInterval(updateCountdown, 1000);

/* ================= PARTY CONFETTI CANVAS ================= */
const canvas = document.getElementById('party-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const colors = ['#cda86e','#a9824c','#e7c9a6','#7c5a2e','#fbf6ec'];
let confettiParticles = [];

function spawnConfetti(x,y,count=60){
  for(let i=0;i<count;i++){
    confettiParticles.push({
      x: x ?? canvas.width/2,
      y: y ?? canvas.height/2,
      vx: (Math.random()-0.5)*9,
      vy: (Math.random()*-9)-2,
      gravity: 0.18,
      size: 4+Math.random()*5,
      color: colors[Math.floor(Math.random()*colors.length)],
      rotation: Math.random()*360,
      rotSpeed: (Math.random()-0.5)*12,
      life: 0,
      maxLife: 90+Math.random()*40,
      shape: Math.random()>0.5?'circle':'rect'
    });
  }
}

function launchEntryConfetti(){
  spawnConfetti(canvas.width*0.2, canvas.height*0.15, 50);
  spawnConfetti(canvas.width*0.8, canvas.height*0.15, 50);
  spawnConfetti(canvas.width*0.5, canvas.height*0.05, 40);
}

function animateConfetti(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  confettiParticles.forEach(p=>{
    p.life++;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.rotSpeed;
    const alpha = Math.max(0, 1 - p.life/p.maxLife);
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rotation*Math.PI/180);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if(p.shape==='circle'){
      ctx.beginPath();
      ctx.arc(0,0,p.size/2,0,Math.PI*2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);
    }
    ctx.restore();
  });
  confettiParticles = confettiParticles.filter(p=>p.life < p.maxLife && p.y < canvas.height+50);
  requestAnimationFrame(animateConfetti);
}
animateConfetti();

/* confetti burst on RSVP button hover/click for fun */
document.querySelector('.btn-whatsapp')?.addEventListener('click', (e)=>{
  const rect = e.currentTarget.getBoundingClientRect();
  spawnConfetti(rect.left+rect.width/2, rect.top, 45);
});

/* gentle ambient confetti every so often once inside */
let ambientStarted=false;
btnEntrar.addEventListener('click', ()=>{
  if(ambientStarted) return;
  ambientStarted = true;
  setInterval(()=>{
    if(document.hidden) return;
    spawnConfetti(Math.random()*canvas.width, -10, 6);
  }, 1800);
});