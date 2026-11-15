(()=>{
const imageExamples=[
 {name:'自然发型写真',category:'发型',prompt:'美业人像写真，自然蓬松的法式发型，柔和自然光，干净背景，发丝细节清晰，真实摄影质感。',image:'photo-1534528741775-53994a69daeb'},
 {name:'沙龙氛围大片',category:'场景',prompt:'高级美发沙龙场景，柔和暖色灯光，简洁空间布局，呈现人物造型与门店氛围，真实商业摄影质感。',image:'photo-1600948836101-f9ffda59d250'},
 {name:'产品宣传海报',category:'产品',prompt:'美业产品商业摄影，产品居中，柔和光影，背景简洁，适当留白，突出包装与材质细节，画面不含文字。',image:'photo-1522335789203-aabd1fc54bc9'},
 {name:'多图场景融合',category:'场景',prompt:'融合参考素材中的人物、产品与场景，保持主体特征，统一光线、透视与色调，构图自然，呈现美业商业大片质感。',image:'photo-1524504388940-b1c1722653e1'}
];
const videoExamples=[
 {name:'女生轻抚头发 · 发型展示',category:'发型',prompt:'人物坐在沙龙椅上，抬手轻抚侧面头发，然后自然看向镜头。保持人物面部、服饰和背景一致，镜头缓慢推进，光线柔和，发丝运动自然。'},
 {name:'沙龙空间 · 缓慢运镜',category:'场景',prompt:'镜头从沙龙入口缓慢向前移动，依次展示镜台、座椅和暖色灯光。保持空间结构稳定，光影自然，画面平稳，呈现舒适专业的门店氛围。'},
 {name:'护理产品 · 细节特写',category:'产品',prompt:'以美业护理产品为主体，镜头由中景缓慢推进至包装特写，柔和光线掠过瓶身。产品外观和文字保持稳定，背景简洁，突出材质与光泽。'},
 {name:'造型完成 · 自然转身',category:'发型',prompt:'造型完成后，人物缓慢转头展示侧面与背面的发型，再自然回望镜头。保持人物身份、服饰和发型结构一致，头发轻微摆动，镜头平稳，真实摄影质感。'}
];
const videos=new Map(),pictures=new Map();
function render(host,{media='image',items,onApply}){
 const examples=items?items.map((t,i)=>({...imageExamples[i%imageExamples.length],...t})):media==='video'?videoExamples:imageExamples;
 let query='',category='全部';host.replaceChildren();host.classList.add('prompt-library');host.classList.remove('image-template-grid');
 const intro=document.createElement('p');intro.className='pl-intro';intro.textContent=media==='video'?'先读提示词，再看对应视频，选用后可继续修改。':'先读提示词，再看图片示意，选用后可继续修改。';
 const search=document.createElement('input');search.type='search';search.placeholder=media==='video'?'搜索视频提示词，例如：抚头发':'搜索图片提示词，例如：发型';search.setAttribute('aria-label','搜索'+(media==='video'?'视频':'图片')+'提示词');search.className='pl-search';
 const filters=document.createElement('div');filters.className='pl-filters';const list=document.createElement('div');list.className='pl-list';
 ['全部','发型','场景','产品'].forEach(c=>{const b=document.createElement('button');b.textContent=c;b.setAttribute('aria-pressed',c===category);b.onclick=()=>{category=c;[...filters.children].forEach(x=>x.setAttribute('aria-pressed',x===b));paint()};filters.append(b)});
 const empty=document.createElement('p');empty.className='pl-empty';empty.textContent='没有找到匹配的提示词，试试其他关键词。';empty.hidden=true;
 host.append(intro,search,filters,list,empty);
 search.oninput=()=>{query=search.value.trim().toLowerCase();paint()};
 function paint(){list.querySelectorAll('video').forEach(v=>v.pause());list.replaceChildren();const matches=examples.map((item,index)=>({item,index})).filter(({item})=>(category==='全部'||item.category===category)&&(!query||(item.name+item.prompt).toLowerCase().includes(query)));empty.hidden=!!matches.length;
 matches.forEach(({item,index})=>{
 const card=document.createElement('article');card.className='pl-card';const title=document.createElement('h3');title.textContent=item.name;const label=document.createElement('div');label.className='pl-label';label.textContent='提示词';const prompt=document.createElement('p');prompt.className='pl-prompt';prompt.textContent=item.prompt;card.append(title,label,prompt);
 const mediaBox=document.createElement('div');mediaBox.className='pl-media';const note=document.createElement('small');note.className='pl-media-note';const key=media+':'+item.name;
 if(media==='video'){const video=document.createElement('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.setAttribute('aria-label',item.name+'对应效果视频');if(videos.has(key)){video.src=videos.get(key);mediaBox.append(video)}else{const placeholder=document.createElement('div');placeholder.className='pl-video-placeholder';placeholder.textContent='▷\n对应效果视频';mediaBox.append(placeholder)}note.textContent=videos.has(key)?'本页上传的对应效果视频 · 刷新后清除':'对应效果视频待补充 · 上传后可在此播放';}
 else{const img=document.createElement('img');img.src=pictures.get(key)||`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=550&q=80`;img.alt=item.name+'图片示意';img.loading='lazy';mediaBox.append(img);note.textContent=pictures.has(key)?'本页上传的对应效果图片':'风格示意图片 · 非此提示词的实测生成结果';}
 mediaBox.append(note);card.append(mediaBox);
 const actions=document.createElement('div');actions.className='pl-actions';const upload=document.createElement('input');upload.type='file';upload.accept=media==='video'?'video/mp4,video/webm,video/quicktime':'image/jpeg,image/png,image/webp';upload.hidden=true;const replace=document.createElement('button');replace.className='pl-upload';replace.textContent=media==='video'?'＋ 上传对应视频':'替换对应图片';replace.onclick=()=>upload.click();upload.onchange=()=>{const file=upload.files[0];if(!file)return;const valid=media==='video'?['video/mp4','video/webm','video/quicktime'].includes(file.type):['image/jpeg','image/png','image/webp'].includes(file.type);if(!valid||file.size>(media==='video'?100:20)*1024*1024){note.textContent=media==='video'?'请上传 100MB 内的 MP4、WEBM 或 MOV':'请上传 20MB 内的 JPG、PNG 或 WEBP';upload.value='';return}const map=media==='video'?videos:pictures;if(map.has(key))URL.revokeObjectURL(map.get(key));map.set(key,URL.createObjectURL(file));paint()};
 const apply=document.createElement('button');apply.className='pl-apply';apply.textContent='使用这条提示词 ↗';apply.onclick=()=>onApply(item,index);actions.append(replace,upload,apply);card.append(actions);list.append(card);
 });}paint();
}
function addTabs({container,composer,id,onApply}){
 const tabs=document.createElement('div');tabs.className='image-tabs pl-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','提示词方式');
 const input=document.createElement('button'),system=document.createElement('button');input.textContent='输入提示词';system.textContent='系统提示词';input.id=id+'InputTab';system.id=id+'SystemTab';input.setAttribute('role','tab');system.setAttribute('role','tab');composer.id=composer.id||id+'InputPanel';composer.setAttribute('role','tabpanel');composer.setAttribute('aria-labelledby',input.id);
 const library=document.createElement('section');library.id=id+'SystemPanel';library.className='pl-system-panel';library.setAttribute('role','tabpanel');library.setAttribute('aria-labelledby',system.id);input.setAttribute('aria-controls',composer.id);system.setAttribute('aria-controls',library.id);
 function select(mode){const isInput=mode==='input';input.setAttribute('aria-selected',isInput);system.setAttribute('aria-selected',!isInput);composer.hidden=!isInput;library.hidden=isInput;if(isInput)library.querySelectorAll('video').forEach(v=>v.pause())}
 input.onclick=()=>select('input');system.onclick=()=>select('system');tabs.append(input,system);tabs.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const target=e.target===input?system:input;target.click();target.focus()}};
 container.insertBefore(tabs,composer);composer.after(library);render(library,{media:'video',onApply:item=>{onApply(item);select('input')}});select('input');return{select};
}
window.LingganPrompts={render,addTabs};
})();
