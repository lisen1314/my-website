(()=>{
const hero=document.getElementById('hero');
const slides=[
 {tag:'STYLE INSPIRATION / 潮流发型',label:'酷炫卷发灵感',images:['assets/hero-cool-hair.jpg'],alt:['蓬松立体卷发造型灵感'],source:'发型灵感 · 示例素材'},
 {tag:'WIG TRANSFORMATION / 男士假发',label:'男士假发前后对比',images:['assets/hero-men-before.jpg','assets/hero-men-after.jpg'],alt:['男士佩戴假发前','同一位男士佩戴假发后'],source:'公开对比案例 · Lordhair'},
 {tag:'WIG TRANSFORMATION / 女士假发',label:'女士假发前后对比',images:['assets/hero-women-before.jpg','assets/hero-women-after.jpg'],alt:['女士佩戴假发前','同一位女士佩戴假发后'],source:'公开对比案例 · Lordhair'}
];
hero.className='hero hero-carousel';hero.setAttribute('role','region');hero.setAttribute('aria-roledescription','轮播图');hero.setAttribute('aria-label','美业发型与假发灵感封面');
hero.innerHTML=`<div class="hc-track">${slides.map((s,i)=>`<article class="hc-slide hc-slide-${i}" role="group" aria-roledescription="幻灯片" aria-label="${i+1} / 3：${s.label}" aria-hidden="${i!==0}" ${i?'inert':''}><div class="hc-copy"><div class="hc-kicker"><span></span>${s.tag}</div><h2>美业全域获客，<br><em>高业绩就用</em><br class="hc-mobile-break"><strong>灵感AI</strong></h2><p>${s.label} · 把造型灵感变成获客内容</p><button class="hc-start">开启我的创作 <span>↗</span></button></div><div class="hc-visual ${s.images.length>1?'hc-compare':'hc-single'}">${s.images.map((src,j)=>`<figure><img src="${src}" alt="${s.alt[j]}" ${i===0?'fetchpriority="high"':'loading="lazy"'}>${s.images.length>1?`<figcaption>${j?'AFTER / 佩戴后':'BEFORE / 佩戴前'}</figcaption>`:''}</figure>`).join('')}<span class="hc-source">${s.source}</span></div></article>`).join('')}</div><div class="hc-controls"><div class="hc-dots" aria-label="选择轮播图片">${slides.map((s,i)=>`<button aria-label="第${i+1}页：${s.label}" aria-pressed="${i===0}" data-slide="${i}"></button>`).join('')}</div><span class="hc-counter"><b id="hcCurrent">01</b> / 03</span><div class="hc-arrows"><button id="hcPrevious" aria-label="上一张封面">←</button><button id="hcPause" aria-label="暂停自动轮播">Ⅱ</button><button id="hcNext" aria-label="下一张封面">→</button></div></div><span class="hc-announcement" role="status" aria-live="polite"></span>`;
const track=hero.querySelector('.hc-track'),panels=[...hero.querySelectorAll('.hc-slide')],dots=[...hero.querySelectorAll('[data-slide]')],pause=hero.querySelector('#hcPause');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let index=0,direction=1,paused=reduced.matches,hover=false,focused=false,timer=null,touchX=null;
function render(manual=false){track.style.transform=`translateX(-${index*100}%)`;panels.forEach((p,i)=>{p.setAttribute('aria-hidden',i!==index);p.inert=i!==index});dots.forEach((b,i)=>b.setAttribute('aria-pressed',i===index));hero.querySelector('#hcCurrent').textContent=String(index+1).padStart(2,'0');if(manual)hero.querySelector('.hc-announcement').textContent=`第 ${index+1} 页，${slides[index].label}`;}
function schedule(){clearInterval(timer);if(!paused&&!hover&&!focused&&!document.hidden)timer=setInterval(()=>{if(index===slides.length-1)direction=-1;else if(index===0)direction=1;index+=direction;render()},5000)}
function go(next){index=(next+slides.length)%slides.length;direction=index===slides.length-1?-1:1;render(true);schedule()}
function paintPause(){pause.textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-label',paused?'播放自动轮播':'暂停自动轮播')}
dots.forEach(b=>b.onclick=()=>go(Number(b.dataset.slide)));hero.querySelector('#hcPrevious').onclick=()=>go(index-1);hero.querySelector('#hcNext').onclick=()=>go(index+1);pause.onclick=()=>{paused=!paused;paintPause();schedule()};
hero.querySelectorAll('.hc-start').forEach(b=>b.onclick=()=>document.getElementById('toolsSection').scrollIntoView({behavior:reduced.matches?'auto':'smooth'}));
hero.addEventListener('mouseenter',()=>{hover=true;schedule()});hero.addEventListener('mouseleave',()=>{hover=false;schedule()});
hero.addEventListener('focusin',()=>{focused=true;schedule()});hero.addEventListener('focusout',()=>{requestAnimationFrame(()=>{focused=hero.contains(document.activeElement);schedule()})});
hero.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX},{passive:true});hero.addEventListener('touchend',e=>{if(touchX!==null){const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45)go(index+(dx<0?1:-1));touchX=null}},{passive:true});
hero.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(index+(e.key==='ArrowLeft'?-1:1))}});
document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;paintPause();schedule()});paintPause();schedule();
})();
