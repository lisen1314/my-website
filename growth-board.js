(()=>{
const section=document.getElementById('inspiration');
// Keep the original gallery's hidden nodes for existing workspace navigation.
const legacy=document.createElement('div');legacy.hidden=true;while(section.firstChild)legacy.append(section.firstChild);section.append(legacy);
const cases=[
 {title:'烫发内容展示',file:'growth-case-1.png'},
 {title:'同城口播案例',file:'growth-case-2.png'},
 {title:'街景口播案例',file:'growth-case-3.png'},
 {title:'沙龙情景内容',file:'growth-case-4.png'},
 {title:'顾客咨询情景',file:'growth-case-5.png'},
 {title:'人物出镜案例',file:'growth-case-6.png'},
 {title:'门店服务展示',file:'growth-case-7.png'}
];
const board=document.createElement('div');board.className='growth-board';
const cards=copy=>cases.map((item,i)=>`<button class="gb-card" data-case="${i}" ${copy?'tabindex="-1"':''} aria-label="查看案例 ${i+1}：${item.title}"><div class="gb-photo"><img src="assets/${item.file}" alt="${copy?'':item.title+'原始截图，包含底部互动数据'}" loading="lazy" decoding="async"><span class="gb-expand">↗ 查看原图</span></div><span class="gb-caption"><b>${item.title}</b><small>案例 ${String(i+1).padStart(2,'0')} / 07</small></span></button>`).join('');
board.innerHTML=`<div class="gb-heading"><div><div class="section-label">GROWTH SHOWCASE / 内容案例</div><h2>流量变现榜<span>从内容到获客，让案例说话</span></h2></div><div class="gb-controls"><span class="gb-count">7 组案例</span><button id="gbPrev" aria-label="向前查看案例">←</button><button id="gbPause" aria-label="暂停案例自动滚动">Ⅱ</button><button id="gbNext" aria-label="向后查看案例">→</button></div></div><div class="gb-window" role="region" aria-label="流量变现榜案例图片，可左右滑动"><div class="gb-track"><div class="gb-group">${cards(false)}</div><div class="gb-group gb-copy" aria-hidden="true">${cards(true)}</div></div></div><p class="gb-note">左右滑动或点击查看原图 · 以下为提供的案例截图，展示内容与互动数据</p>`;
section.append(board);
const viewer=document.createElement('div');viewer.className='overlay gb-viewer';viewer.id='growthViewer';
viewer.innerHTML=`<section class="gb-dialog" role="dialog" aria-modal="true" aria-labelledby="gbViewerTitle"><div class="gb-viewer-head"><div><h2 id="gbViewerTitle">案例原图</h2><p id="gbViewerCount"></p></div><button id="gbZoom">放大阅读</button><button id="gbClose" aria-label="关闭案例原图">×</button></div><div class="gb-image-area"><img id="gbViewerImage" alt=""></div><div class="gb-viewer-foot"><button id="gbViewPrev">← 上一张</button><span>保留原始截图与数据</span><button id="gbViewNext">下一张 →</button></div></section>`;
document.body.append(viewer);
const find=id=>document.getElementById(id),scroller=board.querySelector('.gb-window'),group=board.querySelector('.gb-group'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,hover=false,focused=false,dragging=false,inView=true,open=false,current=0,opener=null,zoom=false,lastTime=0,remainder=0;
function pauseLabel(){find('gbPause').textContent=paused?'▷':'Ⅱ';find('gbPause').setAttribute('aria-label',paused?'播放案例自动滚动':'暂停案例自动滚动')}
function loop(now){const seconds=lastTime?Math.min((now-lastTime)/1000,.1):0;lastTime=now;if(!paused&&!hover&&!focused&&!dragging&&!open&&inView&&!document.hidden){const width=group.getBoundingClientRect().width;if(width>0){remainder+=seconds*24;const pixels=Math.floor(remainder);remainder-=pixels;scroller.scrollLeft+=pixels;if(scroller.scrollLeft>=width)scroller.scrollLeft-=width}}requestAnimationFrame(loop)}
function move(direction){const step=board.querySelector('.gb-card').getBoundingClientRect().width+18,width=group.getBoundingClientRect().width;if(direction<0&&scroller.scrollLeft<step)scroller.scrollLeft+=width;scroller.scrollBy({left:direction*step,behavior:reduced.matches?'instant':'smooth'})}
find('gbPrev').onclick=()=>move(-1);find('gbNext').onclick=()=>move(1);find('gbPause').onclick=()=>{paused=!paused;pauseLabel()};
board.addEventListener('mouseenter',()=>hover=true);board.addEventListener('mouseleave',()=>hover=false);board.addEventListener('focusin',()=>focused=true);board.addEventListener('focusout',()=>requestAnimationFrame(()=>focused=board.contains(document.activeElement)));
scroller.addEventListener('pointerdown',()=>dragging=true);window.addEventListener('pointerup',()=>dragging=false);window.addEventListener('pointercancel',()=>dragging=false);
function paint(){const item=cases[current];find('gbViewerTitle').textContent=item.title;find('gbViewerCount').textContent=`案例 ${current+1} / ${cases.length}`;find('gbViewerImage').src='assets/'+item.file;find('gbViewerImage').alt=item.title+'原始完整截图';viewer.querySelector('.gb-image-area').scrollTop=0}
function show(index,button){current=index;opener=button;open=true;zoom=false;viewer.classList.remove('gb-zoomed');find('gbZoom').textContent='放大阅读';paint();viewer.classList.add('open');document.body.style.overflow='hidden';find('gbClose').focus()}
function close(){open=false;viewer.classList.remove('open');document.body.style.overflow='';opener?.focus()}
board.querySelectorAll('[data-case]').forEach(button=>button.onclick=()=>show(Number(button.dataset.case),button));find('gbClose').onclick=close;viewer.onclick=e=>{if(e.target===viewer)close()};
find('gbViewPrev').onclick=()=>{current=(current+cases.length-1)%cases.length;paint()};find('gbViewNext').onclick=()=>{current=(current+1)%cases.length;paint()};
find('gbZoom').onclick=()=>{zoom=!zoom;viewer.classList.toggle('gb-zoomed',zoom);find('gbZoom').textContent=zoom?'适应窗口':'放大阅读'};
viewer.addEventListener('keydown',event=>{if(event.key==='Escape')close();else if(event.key==='ArrowRight')find('gbViewNext').click();else if(event.key==='ArrowLeft')find('gbViewPrev').click();else if(event.key==='Tab'){const buttons=[...viewer.querySelectorAll('button')];if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus()}else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus()}}});
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting},{threshold:0}).observe(board);
reduced.addEventListener('change',()=>{paused=reduced.matches;pauseLabel()});pauseLabel();requestAnimationFrame(loop);
})();
