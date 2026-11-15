(()=>{
let tabApi;
function simplifyReplica(){
 const overlay=document.getElementById('overlay');
 const styles=overlay.querySelector('#styles');
 styles.hidden=true;
 styles.replaceChildren();
 const styleHeading=styles.previousElementSibling;
 if(styleHeading?.classList.contains('fieldtitle'))styleHeading.hidden=true;
 // Reference video is the only source upload in these two workflows.
 const upload=overlay.querySelector('#upload');
 upload.accept='video/mp4,video/quicktime,video/webm';
 upload.multiple=false;
 overlay.querySelector('label.fieldtitle[for="upload"]').textContent='01 / 上传参考视频';
 const promptLabel=overlay.querySelector('label.fieldtitle[for="prompt"]');
 promptLabel.textContent='02 / 告诉 AI 你的想法';
 overlay.querySelectorAll('#imageUploadSection,[data-reference-image-upload]').forEach(section=>section.hidden=true);
}
['replica','drama'].forEach(key=>{const button=document.querySelector(`[data-create="${key}"]`),original=button.onclick;button.onclick=()=>{original();simplifyReplica();if(!tabApi){const prompt=document.getElementById('prompt');const composer=document.createElement('section');composer.className='pl-old-panel';prompt.before(composer);composer.append(prompt);tabApi=window.LingganPrompts.addTabs({container:composer.parentElement,composer,id:'replicaPromptMode',onApply:item=>{prompt.value=item.prompt;prompt.focus()}})}tabApi.select('input')}});
})();
