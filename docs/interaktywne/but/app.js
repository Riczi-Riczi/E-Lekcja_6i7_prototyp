import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {patternTypes,makePattern,attachPattern} from './patterns.js';
import {palette,colorHex,colorName,createPicker} from './color-picker.js';
import {connectBridge} from './bridge.js';
const parts=[['toe','Nosek'],['side','Bok'],['heel','Pięta'],['tongue','Język'],['laces','Sznurówki'],['badge','Naszywka'],['sole','Podeszwa']];
const materialGroup=name=>name==='sole_edge'?'sole':parts.some(p=>p[0]===name)?name:null;
const $=s=>document.querySelector(s),canvas=$('#shoe'),viewport=$('#viewport');
if(new URLSearchParams(location.search).get('embed')==='1'){document.body.classList.add('embedded');document.documentElement.classList.add('embedded');}
// Osadzenie w lekcji (integracja 52): wstrzymanie przez rodzica, import bez zwrotnej zmiany, most protokołu.
let paused=false,importing=false,bridge=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let selected='toe',colors=Object.fromEntries(parts.map(([id])=>[id,'white'])),model,renderer;
const patterns=Object.fromEntries(parts.map(([id])=>[id,makePattern()]));
let yaw=-.60,pitch=.37,moving=!reduced.matches,baseYaw=yaw,phaseStart=0,phaseElapsed=0,raf=0,frames=0,lastFrame=0;
let drag=null,ready=false;const materials={},meshes=[];
let presentation=false,pairModel=null,contactShadow=null,pairShadow=null,shadowFloor=null,editView=null,basePicker,inkPicker,pairCorners=[];
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9eee3');
const camera=new THREE.PerspectiveCamera(33,1,.1,40),target=new THREE.Vector3(0,.57,0);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const status=text=>{$('#status').textContent=text;};
const compact=matchMedia('(max-width: 850px)');let activePanel='parts',paintTarget='base';
const viewTools=$('.view-tools'),viewDock=document.createElement('div');viewDock.id='view-dock';viewDock.innerHTML='<p class="view-dock-title">Sterowanie widokiem</p>';$('#colors legend').after(viewDock);
function dockViewTools(){const host=compact.matches||presentation?$('.preview'):viewDock;if(viewTools.parentElement!==host)host.append(viewTools);}
function panelUI(){
 dockViewTools();
 for(const id of ['parts','colors','patterns']){const field=$('#'+id),tab=$('[data-panel='+id+']');field.hidden=compact.matches&&id!==activePanel;tab.setAttribute('aria-selected',String(id===activePanel));tab.tabIndex=id===activePanel?0:-1;if(compact.matches){field.setAttribute('role','tabpanel');field.setAttribute('aria-labelledby','tab-'+id);}else{field.removeAttribute('role');field.removeAttribute('aria-labelledby');}}
 $('#base-tools').hidden=paintTarget!=='base';$('#ink-tools').hidden=paintTarget!=='ink';
 for(const b of document.querySelectorAll('[data-paint]'))b.setAttribute('aria-pressed',String(b.dataset.paint===paintTarget));
 $('#ink-help').textContent=patterns[selected].type==='none'?'Wybierz kolor, a następnie dodaj wzór.':'Kolor wzoru na wybranej części buta.';
}
function showPanel(id,focus=false){activePanel=id;panelUI();if(focus)$('[data-panel='+id+']').focus();}
for(const b of document.querySelectorAll('[data-panel]')){b.onclick=()=>{stopMotion();showPanel(b.dataset.panel);};b.onkeydown=e=>{const ids=['parts','colors','patterns'];if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=ids.indexOf(activePanel);showPanel(e.key==='Home'?ids[0]:e.key==='End'?ids[2]:ids[(i+(e.key==='ArrowRight'?1:2))%3],true);};}
for(const b of document.querySelectorAll('[data-paint]'))b.onclick=()=>{stopMotion();paintTarget=b.dataset.paint;panelUI();};
compact.addEventListener('change',panelUI);
$('#edit-ink').onclick=()=>{paintTarget='ink';showPanel('colors');if(!compact.matches)$('#ink-hex').focus({preventScroll:true});};
function updateUI(){
 for(const [id] of parts)$(`[data-part="${id}"]`).setAttribute('aria-pressed',String(id===selected));
 for(const [id] of palette)$(`[data-color="${id}"]`).setAttribute('aria-pressed',String(colors[selected]===id));
 const name=parts.find(p=>p[0]===selected)[1];
 $('#selection').textContent=name+' · '+colorName(colors[selected]);
 $('#chosen').textContent='Wybrano: '+name;
 $('#motion').setAttribute('aria-pressed',String(moving));$('#motion').textContent='Ruch: '+(moving?'włączony':'wyłączony');
 for(const [id] of patternTypes)$(`[data-pattern="${id}"]`).setAttribute('aria-pressed',String(patterns[selected].type===id));
 $('.pattern-options').hidden=patterns[selected].type==='none';const customInk=$('#pattern-color option[value=custom]');customInk.hidden=!patterns[selected].color.startsWith('#');$('#pattern-color').value=patterns[selected].color.startsWith('#')?'custom':patterns[selected].color;$('#pattern-size').value=patterns[selected].size;$('#size-value').value=patterns[selected].size+' / 5';
 basePicker?.set(colors[selected]);inkPicker?.set(patterns[selected].color);
 panelUI();
}
function stopMotion(){
 if(moving){moving=false;baseYaw=yaw;phaseElapsed=0;cancelAnimationFrame(raf);raf=0;updateUI();invalidate();}
}
function select(id){stopMotion();selected=id;paintTarget='base';if(compact.matches)activePanel='colors';updateUI();status('Wybrano: '+parts.find(p=>p[0]===id)[1]+'. Wybierz kolor.');invalidate();}
function changed(){if(!importing)bridge?.changed();}
function setColor(id){stopMotion();colors[selected]=id;for(const m of materials[selected]||[])m.color.set(colorHex(id));updateUI();status($('#selection').textContent);invalidate();changed();}
for(const [id,name] of parts){const b=document.createElement('button');b.type='button';b.dataset.part=id;b.textContent=name;b.setAttribute('aria-pressed','false');b.onclick=()=>select(id);$('.part-grid').append(b);}
for(const [id,name,hex] of palette){const b=document.createElement('button');b.type='button';b.className='swatch';b.dataset.color=id;b.setAttribute('aria-label',name);b.setAttribute('aria-pressed','false');const chip=document.createElement('span');chip.className='chip';chip.style.background=hex;chip.style.setProperty('--ink',['navy','green','violet','black','gray','red'].includes(id)?'#fff':'#163c2b');chip.setAttribute('aria-hidden','true');b.append(chip,document.createTextNode(name));b.onclick=()=>setColor(id);$('.color-grid').append(b);}
function updatePattern(){stopMotion();for(const m of materials[selected]||[])m.userData.updatePattern?.();updateUI();invalidate();changed();}
for(const [id,name,icon] of patternTypes){const b=document.createElement('button');b.type='button';b.dataset.pattern=id;b.setAttribute('aria-pressed','false');const glyph=document.createElement('span');glyph.className='pattern-icon';glyph.setAttribute('aria-hidden','true');glyph.textContent=icon;if(id==='organic')glyph.innerHTML='<svg viewBox="0 0 32 32" width="24" height="24"><path fill="currentColor" d="M7 13C0 15 2 27 11 27C16 27 17 30 24 27C33 22 26 17 25 13C28 3 17 0 14 7C12 12 12 12 7 13Z"/></svg>';b.append(glyph,document.createTextNode(name));b.onclick=()=>{patterns[selected].type=id;updatePattern();status(id==='none'?'Usunięto wzór.':'Wybrany wzór: '+name);};$('.pattern-grid').append(b);}
for(const [id,name] of palette){const option=document.createElement('option');option.value=id;option.textContent=name;$('#pattern-color').append(option);}
const customOption=document.createElement('option');customOption.value='custom';customOption.textContent='Kolor własny';customOption.hidden=true;customOption.disabled=true;$('#pattern-color').append(customOption);
$('#pattern-color').onchange=e=>{if(e.target.value==='custom')return;patterns[selected].color=e.target.value;updatePattern();};
basePicker=createPicker($('#base-picker'),{id:'base',label:'Rozszerz kolor',onChange:setColor,onInteract:stopMotion});
inkPicker=createPicker($('#ink-picker'),{id:'ink',label:'Rozszerz kolor wzoru',onChange:value=>{patterns[selected].color=value;updatePattern();},onInteract:stopMotion});
$('#pattern-size').oninput=e=>{patterns[selected].size=Number(e.target.value);updatePattern();};
$('#remove-pattern').onclick=()=>{patterns[selected].type='none';updatePattern();status('Usunięto wzór z wybranej części.');};
let singleCorners=[];
function orbit(){let r=presentation?(camera.aspect<1.25?7.2:4.7+2.3*Math.max(0,Math.sin(pitch)**2-.13)):(compact.matches?5.35:3.15+2.1*Math.max(0,Math.sin(pitch)**2-.13));const corners=presentation?pairCorners:singleCorners,margin=presentation?.89:.93;for(let attempt=0;attempt<3;attempt++){camera.position.set(target.x+r*Math.sin(yaw)*Math.cos(pitch),target.y+r*Math.sin(pitch),target.z+r*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(target);camera.updateMatrixWorld();if(!corners.length)break;const extent=Math.max(...corners.map(p=>{const v=p.clone().project(camera);return Math.max(Math.abs(v.x),Math.abs(v.y));}));if(extent<=margin)break;r*=extent/margin;}}
function frame(now){
 raf=0;if(document.hidden||!ready||paused)return;
 if(moving){if(!phaseStart)phaseStart=now;const elapsed=phaseElapsed+now-phaseStart;yaw=baseYaw+THREE.MathUtils.degToRad(7)*Math.sin(elapsed/10000*Math.PI*2);}
 orbit();renderer.render(scene,camera);frames++;lastFrame=now;
 if(moving)raf=requestAnimationFrame(frame);
}
function invalidate(){if(!raf&&!document.hidden&&ready&&!paused)raf=requestAnimationFrame(frame);}
function resize(){dockViewTools();const w=viewport.clientWidth,h=viewport.clientHeight;renderer?.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}
function turn(amount){stopMotion();yaw+=amount;invalidate();}
$('#left').onclick=()=>turn(-Math.PI/8);$('#right').onclick=()=>turn(Math.PI/8);
function home(){stopMotion();yaw=presentation?.55:-.60;pitch=presentation?.36:.37;invalidate();status('Przywrócono widok początkowy.');}
$('#top-view').onclick=()=>{stopMotion();yaw=Math.PI/2;pitch=1.50;invalidate();status('Widok z góry. Czubki butów są u góry.');};
function showPair(){if(!ready||presentation)return;stopMotion();editView={yaw,pitch};presentation=true;
 if(!pairModel){pairModel=model.clone(true);pairModel.scale.z=-1;scene.add(pairModel);pairShadow=contactShadow.clone();scene.add(pairShadow);}
 // Toes point toward -X. Wearer's left is +Z, right is -Z.
 // Original badge is on +Z; its mirrored counterpart is on -Z.
 model.userData.foot='left';pairModel.userData.foot='right';
 model.position.set(.025,0,.64);pairModel.position.set(.48,0,-.64);pairModel.visible=true;contactShadow.position.set(-.10,.016,.64);pairShadow.position.set(.35,.016,-.64);pairShadow.visible=true;target.set(.12,.35,0);scene.background.set('#eef0e9');shadowFloor.material.opacity=.04;
 const bounds=new THREE.Box3().setFromObject(model).union(new THREE.Box3().setFromObject(pairModel));pairCorners=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])pairCorners.push(new THREE.Vector3(x,y,z));
 document.body.classList.add('presenting');$('.controls').hidden=true;$('.presentation-bar').hidden=false;$('#chosen').hidden=true;$('.intro h1').textContent='Twoje buty. Twój styl.';$('.intro .eyebrow').textContent='PROJEKT GOTOWY DO POKAZANIA';$('.intro>p:last-child').textContent='Obejrzyj swoją parę z każdej strony.';$('#gesture-hint').textContent='Przeciągnij, aby obejrzeć parę. Do zmian wrócisz przyciskiem poniżej.';canvas.setAttribute('aria-label','Gotowa para butów 3D. Przeciągnij lub użyj strzałek, aby obrócić widok.');renderer.shadowMap.needsUpdate=true;home();resize();$('.intro').scrollIntoView({behavior:'instant'});$('#back-edit').focus({preventScroll:true});}
function backToEdit(){if(!presentation)return;stopMotion();presentation=false;pairModel.visible=false;pairShadow.visible=false;model.position.set(.125,0,0);contactShadow.position.set(0,.016,0);target.set(0,.57,0);scene.background.set('#e9eee3');shadowFloor.material.opacity=.16;yaw=editView.yaw;pitch=editView.pitch;document.body.classList.remove('presenting');$('.controls').hidden=false;$('.presentation-bar').hidden=true;$('#chosen').hidden=false;$('.intro h1').textContent='Spójrz z innej strony.';$('.intro .eyebrow').textContent='JEDEN BUT. TWOJE KOLORY.';$('.intro>p:last-child').textContent='Obróć but, wybierz część i nadaj jej kolor.';$('#gesture-hint').textContent='Przeciągnij w bok, aby obrócić. Kliknij część, aby ją wybrać.';canvas.setAttribute('aria-label','But 3D. Przeciągnij w bok, aby obrócić. Strzałki obracają widok; Home przywraca widok początkowy.');renderer.shadowMap.needsUpdate=true;resize();canvas.focus({preventScroll:true});$('.intro').scrollIntoView({behavior:'instant'});}
$('#show-pair').onclick=showPair;$('#back-edit').onclick=backToEdit;
$('#home').onclick=home;
$('#motion').onclick=()=>{if(moving)stopMotion();else{moving=true;baseYaw=yaw;phaseStart=0;phaseElapsed=0;updateUI();invalidate();}};
$('#reset').onclick=()=>{stopMotion();for(const [id] of parts){colors[id]='white';for(const m of materials[id]||[])m.color.set('#FFFFFF');}updateUI();status('Przywrócono białe kolory wszystkich części.');invalidate();changed();};
// Selecting a control also freezes motion before a keyboard or pointer change.
$('.controls').addEventListener('pointerdown',stopMotion);
$('.controls').addEventListener('focusin',stopMotion);
canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();stopMotion();if(e.key==='Home')home();else if(e.key==='ArrowLeft')turn(-Math.PI/12);else if(e.key==='ArrowRight')turn(Math.PI/12);else{pitch=THREE.MathUtils.clamp(pitch+(e.key==='ArrowUp'?.12:-.12),.12,1.25);invalidate();}});
canvas.addEventListener('pointerdown',e=>{if(!ready||e.button!==0||drag)return;stopMotion();drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch,moved:false};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;if(!drag.moved)return;yaw=drag.yaw-dx*.009;pitch=THREE.MathUtils.clamp(drag.pitch+dy*.007,.12,1.25);invalidate();});
canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const wasDrag=drag.moved;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(wasDrag||presentation)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(meshes,false)[0];if(hit&&materialGroup(hit.object.material.name))select(materialGroup(hit.object.material.name));});
for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(bridge){stopMotion();drag=null;}if(moving&&phaseStart){phaseElapsed+=performance.now()-phaseStart;phaseStart=0;}cancelAnimationFrame(raf);raf=0;}else invalidate();});
reduced.addEventListener('change',e=>{if(e.matches)stopMotion();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stopMotion();ready=false;bridge?.fail('kontekst');$('#loading').hidden=false;$('#loading').textContent='Podgląd 3D został przerwany. Odśwież stronę, aby spróbować ponownie.';});
// Kontrakt projektu wersji 1 (HEX wielkimi literami). Import ustawia kolory i wzory bez zgłaszania zmiany do rodzica.
const hexOf=v=>colorHex(v).toUpperCase(),paletteId=hex=>palette.find(c=>c[2]===hex)?.[0]||hex,isHex=v=>typeof v==='string'&&/^#[0-9A-F]{6}$/.test(v);
function exportDesign(){return {version:1,colors:Object.fromEntries(parts.map(([id])=>[id,hexOf(colors[id])])),patterns:Object.fromEntries(parts.map(([id])=>[id,{type:patterns[id].type,color:hexOf(patterns[id].color),size:patterns[id].size}])),finished:false};}
function importDesign(d){
 if(!d||typeof d!=='object'||d.version!==1||!d.colors||!d.patterns)return;importing=true;
 for(const [id] of parts){const c=d.colors[id],p=d.patterns[id];
  if(isHex(c)){colors[id]=paletteId(c);for(const m of materials[id]||[])m.color.set(c);}
  if(p&&patternTypes.some(t=>t[0]===p.type)&&isHex(p.color)&&Number.isInteger(p.size)&&p.size>=1&&p.size<=5){Object.assign(patterns[id],{type:p.type,color:paletteId(p.color),size:p.size});for(const m of materials[id]||[])m.userData.updatePattern?.();}
 }
 updateUI();invalidate();importing=false;
}
function pause(){stopMotion();drag=null;paused=true;cancelAnimationFrame(raf);raf=0;}
function resume(){paused=false;invalidate();}
bridge=connectBridge('goz-shoe3d',{exportDesign,importDesign,pause,resume,setReduced:on=>{if(on)stopMotion();}});
updateUI();
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 scene.add(new THREE.HemisphereLight(0xffffff,0x899377,2.2));
 const key=new THREE.DirectionalLight(0xfff6e7,3);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;key.shadow.normalBias=.012;key.shadow.bias=-.0001;key.shadow.radius=4;scene.add(key);
 const fill=new THREE.DirectionalLight(0xe4eef8,1.3);fill.position.set(3,2,-4);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=.015;floor.receiveShadow=true;scene.add(floor);
 const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=128;const ctx=texCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(37,54,27,.30)');gradient.addColorStop(.5,'rgba(37,54,27,.12)');gradient.addColorStop(1,'rgba(37,54,27,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const contact=new THREE.Mesh(new THREE.PlaneGeometry(3.7,1.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(texCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.016;scene.add(contact);
 contactShadow=contact;shadowFloor=floor;
 const gltf=await new GLTFLoader().loadAsync('./assets/but_prototyp_01.glb');model=gltf.scene;model.position.x=.125;
 model.traverse(o=>{if(!o.isMesh)return;meshes.push(o);o.castShadow=true;o.receiveShadow=true;const id=materialGroup(o.material.name);if(id){materials[id]||=[];if(!materials[id].includes(o.material)){materials[id].push(o.material);attachPattern(o.material,patterns[id],palette);}o.material.color.set('#FFFFFF');}});
 if(Object.keys(materials).length!==7)throw new Error('Missing color groups');scene.add(model);model.updateWorldMatrix(true,true);model.traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i+=8)singleCorners.push(new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld));});ready=true;$('#loading').hidden=true;resize();new ResizeObserver(resize).observe(viewport);invalidate();bridge?.modelReady();
}catch(error){console.error(error);$('#loading').textContent='Nie udało się otworzyć buta 3D. Spróbuj odświeżyć stronę lub użyj przeglądarki z obsługą grafiki 3D.';for(const b of document.querySelectorAll('button'))b.disabled=true;bridge?.fail(renderer?'model':'webgl');}
// Read-only diagnostics, outside the learner UI; used by reproducible tests.
function pairPlacement(){if(!presentation)return null;return [model,pairModel].map(foot=>{foot.updateWorldMatrix(true,true);const center=new THREE.Box3().setFromObject(foot).getCenter(new THREE.Vector3());const screen=center.clone().project(camera);let badge;foot.traverse(o=>{if(o.isMesh&&o.material.name==='badge')badge=o;});const badgeCenter=new THREE.Box3().setFromObject(badge).getCenter(new THREE.Vector3());return {foot:foot.userData.foot,center:center.toArray(),badgeCenter:badgeCenter.toArray(),screenX:screen.x};});}
window.prototypeDiagnostics=()=>({ready,selected,presentation,pairVisible:!!pairModel?.visible,pairMirrored:pairModel?.scale.z===-1,pairPlacement:pairPlacement(),colors:{...colors},patterns:structuredClone(patterns),materialColors:Object.fromEntries(Object.entries(materials).map(([id,ms])=>[id,ms[0].color.getHexString()])),allMaterialColors:Object.fromEntries(Object.values(materials).flat().map(m=>[m.name,m.color.getHexString()])),fixedMaterials:Object.fromEntries(meshes.filter(m=>!materialGroup(m.material.name)).map(m=>[m.material.name,m.material.color.getHexString()])),yaw,pitch,moving,frames,lastFrame,drawCalls:renderer?.info.render.calls,triangles:renderer?.info.render.triangles,hidden:document.hidden,three:THREE.REVISION});
