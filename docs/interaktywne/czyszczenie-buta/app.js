import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {connectBridge} from './bridge.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#shoe'),viewport=$('#viewport'),regions=['toe','outer','inner','heel'];
const names={toe:'Przód',outer:'Bok zewnętrzny',inner:'Bok wewnętrzny',heel:'Pięta'};
const views={toe:[-Math.PI/2,.37],outer:[-.28,.30],inner:[Math.PI+.28,.30],heel:[Math.PI/2,.30]};
const titles=['Najpierw suche błoto.','Teraz pozostałe smugi.','Na koniec nadmiar wilgoci.'];
const descriptions=['Szczotką wykonuj delikatne ruchy. Usuń większe, zaschnięte grudki. Cienkie smugi zostaną na następny krok.','Przetrzyj powierzchnię lekko wilgotną szmatką. Usuń cienkie ślady brudu. Na but wystarczy niewielka ilość wilgoci.','Suchą szmatką zbierz nadmiar wilgoci z powierzchni. Potem but potrzebuje czasu na wyschnięcie.'];
const summaries=['Większe grudki usunięte. Pozostały cienkie smugi.','Smugi usunięte. Powierzchnia jest czysta i lekko wilgotna.','Nadmiar wilgoci zebrany z powierzchni.'];
const toolNames=['szczotkę','lekko wilgotną szmatkę','suchą szmatkę'];
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9eee3');
const camera=new THREE.PerspectiveCamera(33,1,.1,40),target=new THREE.Vector3(0,.57,0);
const ray=new THREE.Raycaster(),visibilityRay=new THREE.Raycaster(),pointer=new THREE.Vector2();
const meshes=[],cells=[],layers=[],corners=[];
let renderer,ready=false,raf=0,frames=0,yaw=-.60,pitch=.37,mode='rotate',tool=0,step=0,done=false,finished=false,drag=null,comparison='after',demoTimer=0,demoIndex=0,demoRunning=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(new URLSearchParams(location.search).get('embed')==='1'){document.body.classList.add('embedded');document.documentElement.classList.add('embedded');}
// Osadzenie w lekcji (integracja 52): wstrzymanie przez rodzica i ograniczenie ruchu lekcji; maska brudu nie jest zapisywana.
let paused=false,lessonReduced=false,bridge=null;
const status=text=>{$('#status').textContent=text;};

function orbit(){
 let r=3.15+2.1*Math.max(0,Math.sin(pitch)**2-.13);
 for(let attempt=0;attempt<4;attempt++){
  camera.position.set(target.x+r*Math.sin(yaw)*Math.cos(pitch),target.y+r*Math.sin(pitch),target.z+r*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(target);camera.updateMatrixWorld();
  if(!corners.length)break;
  const extent=Math.max(...corners.map(p=>{const v=p.clone().project(camera);return Math.max(Math.abs(v.x),Math.abs(v.y));}));
  if(extent<=.87)break;r*=extent/.87;
 }
}
function invalidate(){if(raf||document.hidden||!ready||paused)return;raf=requestAnimationFrame(()=>{raf=0;if(!ready||document.hidden||paused)return;orbit();renderer.render(scene,camera);frames++;});}
function resize(){renderer?.setSize(viewport.clientWidth,viewport.clientHeight,false);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();invalidate();}
function stopGesture(){const id=drag?.id;drag=null;$('#brush-cursor').style.display='none';if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}
function setMode(value){stopGesture();mode=value;canvas.classList.toggle('clean',mode==='clean');$$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('#gesture-hint').textContent=mode==='rotate'?'Przeciągnij, aby obejrzeć but. Do czyszczenia wybierz „Czyść”.':'Przesuwaj narzędzie po zabrudzeniu lub dotykaj pojedynczych miejsc. Obrót włączysz przyciskiem „Obróć but”.';}
function setView(id){stopGesture();[yaw,pitch]=views[id];$$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===id)));orbit();invalidate();}
function fraction(region){const cs=region?cells.filter(c=>c.region===region):cells;const total=cs.reduce((s,c)=>s+c.weight,0);return total?cs.reduce((s,c)=>s+c.weight*(1-c.level[step]),0)/total:0;}
function updateUI(){
 const progress=finished?1:fraction();
 $('#step-count').textContent=finished?'TRZY KROKI ZA TOBĄ':`KROK ${step+1} Z 3`;
 $('#step-title').textContent=finished?'Czysty i zadbany.':titles[step];
 $('#step-description').textContent=finished?'Obejrzyj efekt z każdej strony i porównaj go ze stanem przed czyszczeniem.':descriptions[step];
 $('#step-state').textContent=finished?'Gotowe':done?'Krok wykonany':demoRunning?'Pokaz':progress>.02?'W trakcie':'Wybierz narzędzie';
 $('#surface-label').textContent=finished?(comparison==='before'?'Przed czyszczeniem':'Po wytarciu'):done?['Cienkie smugi','Lekka wilgoć','Po wytarciu'][step]:['Zaschnięte błoto','Cienkie smugi','Lekka wilgoć'][step];
 $('#progress-fill').style.width=`${progress*100}%`;
 $('.progress-track').setAttribute('aria-valuenow',String(Math.round(progress*10)*10));
 $('.progress-track').setAttribute('aria-valuetext',done||finished?'Krok wykonany':progress<.1?'Początek kroku':progress<.65?'Czyszczenie w toku':'Większość zabrudzenia usunięta');
 const remaining=regions.filter(r=>fraction(r)<.70);
 $('#progress-text').textContent=done||finished?'Wszystkie główne obszary objęte czyszczeniem.':remaining.length?'Obejmij czyszczeniem: '+remaining.map(r=>names[r].toLowerCase()).join(', ')+'.':'Dokończ pozostałe widoczne ślady.';
 $('#area-state').textContent=names[$('#area').value]+': '+(fraction($('#area').value)>.98?'obszar gotowy w tym kroku.':'obszar do przetarcia.');
 $('#step-result').hidden=!done||finished;$('#summary').textContent=summaries[step];
 $('#next').textContent=['Przejdź do wilgotnej szmatki','Przejdź do suchej szmatki','Zobacz efekt i porównaj'][step];
 $('#alternative').hidden=finished;$('#finish').hidden=!finished;
 for(const b of $$('[data-tool]')){b.setAttribute('aria-pressed',String(+b.dataset.tool===tool));b.disabled=finished||demoRunning;}
 $('#clean-area').disabled=!ready||done||finished||demoRunning;$('#demo').disabled=!ready||done||finished||demoRunning;$('#area').disabled=demoRunning;$('#next').disabled=demoRunning;
 $$('[data-compare]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.compare===comparison)));
}

// Continuous object-space patterns; three separate overlay meshes/masks.
const noiseGLSL=`
 float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
function makeLayer(index,positions,normals){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('cleanMask',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3).fill(index===2?0:1),1));
 const material=new THREE.MeshStandardMaterial({color:['#715135','#907758','#728d94'][index],roughness:[1,.93,.12][index],metalness:index===2?.12:0,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1-index,polygonOffsetUnits:-1-index});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='attribute float cleanMask; varying float vCleanMask; varying vec3 vSurface;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvCleanMask=cleanMask;vSurface=position;transformed+=normal*${[.006,.003,.004][index]};`);
  shader.fragmentShader='varying float vCleanMask; varying vec3 vSurface;\n'+noiseGLSL+shader.fragmentShader;
  const effect=index===0?`float blob=noise3(vSurface*12.0)*.65+noise3(vSurface*32.0)*.35; float coverage=smoothstep(.40,.54,blob); diffuseColor.a*=coverage*vCleanMask; diffuseColor.rgb*=.68+.5*noise3(vSurface*75.0);`:
   index===1?`float smear=noise3(vSurface*vec3(9.,28.,13.));diffuseColor.a*=smoothstep(.22,.65,smear)*.52*vCleanMask;`:
   `float wet=noise3(vSurface*vec3(8.,19.,9.));diffuseColor.a*=(.24+.24*wet)*vCleanMask;diffuseColor.rgb*=.85+.25*wet;`;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\n${effect}\ndiffuseColor.a*=smoothstep(.32,.36,vSurface.y)*(1.0-smoothstep(.77,.84,vSurface.y));\nif(diffuseColor.a<.008)discard;`);
 };
 material.customProgramCacheKey=()=>`clean-layer-${index}`;
 const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=index===0?3:index===1?2:1;scene.add(mesh);return mesh;
}
function classify(p){return p.x<-.65?'toe':p.x>.96?'heel':p.z>0?'outer':'inner';}
function visibleFrom(p,origin,tolerance=.025){const direction=p.clone().sub(origin),distance=direction.length();visibilityRay.set(origin,direction.normalize());const hit=visibilityRay.intersectObjects(meshes,false)[0];return hit&&hit.distance>=distance-tolerance;}
function buildLayers(){
 const positions=[],normals=[],origins={toe:new THREE.Vector3(-4,2,0),outer:new THREE.Vector3(0,1.6,4),inner:new THREE.Vector3(0,1.6,-4),heel:new THREE.Vector3(4,1.8,0)};
 function addTriangle(a,b,c,na,nb,nc,depth=0){
  const ab=a.distanceToSquared(b),bc=b.distanceToSquared(c),ca=c.distanceToSquared(a);
  if(Math.max(ab,bc,ca)>.0064&&depth<9){
   if(ab>=bc&&ab>=ca){const p=a.clone().lerp(b,.5),n=na.clone().lerp(nb,.5).normalize();addTriangle(a,p,c,na,n,nc,depth+1);addTriangle(p,b,c,n,nb,nc,depth+1);}
   else if(bc>=ca){const p=b.clone().lerp(c,.5),n=nb.clone().lerp(nc,.5).normalize();addTriangle(a,b,p,na,nb,n,depth+1);addTriangle(a,p,c,na,n,nc,depth+1);}
   else{const p=c.clone().lerp(a,.5),n=nc.clone().lerp(na,.5).normalize();addTriangle(a,b,p,na,nb,n,depth+1);addTriangle(p,b,c,n,nb,nc,depth+1);}return;
  }
  const center=a.clone().add(b).add(c).multiplyScalar(1/3),normal=na.clone().add(nb).add(nc).normalize(),region=classify(center);
  // Outer accessible upper only: no lining, laces, underside, recesses or hidden cells.
  if(center.y<.32||center.y>.86||!visibleFrom(center,origins[region])||normal.dot(origins[region].clone().sub(center).normalize())<.12)return;
  const weight=b.clone().sub(a).cross(c.clone().sub(a)).length()/2;
  cells.push({center,normal,region,weight,level:[1,1,0]});
  for(const p of [a,b,c])positions.push(...p.toArray());for(const n of [na,nb,nc])normals.push(...n.toArray());
 }
 for(const mesh of meshes){
  if(!['toe','side','heel'].includes(mesh.material.name))continue;
  const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,idx=g.index,nmat=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  for(let i=0;i<(idx?idx.count:p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);addTriangle(...ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(mesh.matrixWorld)),...ids.map(j=>new THREE.Vector3().fromBufferAttribute(n,j).applyMatrix3(nmat).normalize()));}
 }
 if(!cells.length||regions.some(r=>!cells.some(c=>c.region===r)))throw new Error('Brak dostępnych obszarów');
 for(let i=0;i<3;i++)layers.push(makeLayer(i,positions,normals));
}
function syncLayers(){
 for(let k=0;k<3;k++){const attr=layers[k].geometry.attributes.cleanMask;for(let i=0;i<cells.length;i++){const value=comparison==='before'?(k===2?0:1):cells[i].level[k];attr.setX(i*3,value);attr.setX(i*3+1,value);attr.setX(i*3+2,value);}attr.needsUpdate=true;}invalidate();
}
function allowed(){if(!ready||done||finished||demoRunning)return false;if(tool!==step){status(`W tym kroku wybierz ${toolNames[step]}. Dotychczasowy efekt zostaje.`);return false;}return true;}
function cleanCell(cell,amount){cell.level[step]=Math.max(0,cell.level[step]-amount);if(step===1)cell.level[2]=Math.max(cell.level[2],1-cell.level[1]);}
function checkCompletion(){
 if(fraction()>=.90&&regions.every(r=>fraction(r)>=.70)){
  for(const cell of cells){cell.level[step]=0;if(step===1)cell.level[2]=1;}
  done=true;stopGesture();status(summaries[step]+' Wybierz przycisk przejścia dalej.');
 }
 syncLayers();updateUI();
}
function hitAt(x,y){const rect=canvas.getBoundingClientRect();if(x<rect.left||x>rect.right||y<rect.top||y>rect.bottom)return null;pointer.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);orbit();ray.setFromCamera(pointer,camera);return ray.intersectObjects(meshes,false)[0]||null;}
function scrub(x,y){
 if(!allowed())return false;const hit=hitAt(x,y);if(!hit)return false;
 let changed=false;const radius=.29,hitRegion=classify(hit.point);
 for(const cell of cells){const distance=cell.center.distanceTo(hit.point);if(distance>radius||cell.level[step]===0)continue;
  if((hitRegion==='outer'&&cell.region==='inner')||(hitRegion==='inner'&&cell.region==='outer'))continue;
  if(cell.normal.dot(camera.position.clone().sub(cell.center).normalize())<.05||!visibleFrom(cell.center,camera.position))continue;
  cleanCell(cell,Math.min(1,(radius-distance)/.09));changed=true;
 }
 if(changed)checkCompletion();return true;
}
function cleanRegion(id,isDemo=false){if(!isDemo&&!allowed())return;setView(id);for(const c of cells)if(c.region===id)cleanCell(c,1);checkCompletion();if(!done)status(`${isDemo?'Pokaz: ':''}${names[id]} - obszar gotowy. Wybierz kolejny obszar.`);}
function stopDemo(){clearTimeout(demoTimer);demoTimer=0;demoRunning=false;document.body.classList.remove('showing-demo');}
function advanceDemo(){if(!demoRunning||document.hidden)return;const id=regions[demoIndex++];$('#area').value=id;cleanRegion(id,true);if(demoIndex===regions.length){stopDemo();updateUI();status('Pokaz zakończony. '+summaries[step]+' Przejdź dalej lub zacznij od nowa.');return;}demoTimer=setTimeout(advanceDemo,reduced.matches||lessonReduced?650:1100);}

$$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$$('[data-view]').forEach(b=>b.onclick=()=>{setView(b.dataset.view);status(`Widok: ${names[b.dataset.view].toLowerCase()}.`);});
$$('[data-tool]').forEach(b=>b.onclick=()=>{stopGesture();tool=+b.dataset.tool;updateUI();status(tool===step?`Wybrano ${toolNames[tool]}. Włącz „Czyść” lub użyj przycisku obszaru.`:`W tym kroku wybierz ${toolNames[step]}. Dotychczasowy efekt zostaje.`);});
$('#area').onchange=()=>{setView($('#area').value);updateUI();status(`Wybrano obszar: ${names[$('#area').value].toLowerCase()}. Naciśnij „Wyczyść wybrany obszar”.`);};
$('#clean-area').onclick=()=>cleanRegion($('#area').value);
$('#demo').onclick=()=>{if(!allowed())return;stopGesture();demoRunning=true;demoIndex=0;document.body.classList.add('showing-demo');status('Pokaz wykonuje bieżący krok.');updateUI();advanceDemo();};
$('#next').onclick=()=>{if(!done)return;stopGesture();if(step===2){finished=true;setMode('rotate');status('Czyszczenie zakończone. Pozostaw but do wyschnięcia zgodnie z instrukcją pielęgnacji.');updateUI();$('[data-compare="after"]').focus();}else{step++;tool=step;done=false;status(`Krok ${step+1}. Wybierz ${toolNames[step]} i przetrzyj but.`);updateUI();$(`[data-tool="${step}"]`).focus();}};
$('#reset').onclick=()=>{stopDemo();stopGesture();for(const c of cells)c.level=[1,1,0];step=tool=0;done=finished=false;comparison='after';yaw=-.60;pitch=.37;$('#area').value='outer';setMode('rotate');$$('[data-view]').forEach(b=>b.setAttribute('aria-pressed','false'));syncLayers();updateUI();status('Zaczynamy od nowa. Wybierz szczotkę.');};
$$('[data-compare]').forEach(b=>b.onclick=()=>{comparison=b.dataset.compare;syncLayers();updateUI();status(comparison==='before'?'Widok przed czyszczeniem: zaschnięte błoto.':'Widok po wytarciu: nadmiar wilgoci zebrany.');});
canvas.addEventListener('pointerdown',e=>{if(!ready||e.button!==0||drag||demoRunning)return;if(mode==='clean'&&!allowed())return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch};canvas.setPointerCapture(e.pointerId);if(mode==='clean'&&!scrub(e.clientX,e.clientY))stopGesture();});
canvas.addEventListener('pointermove',e=>{
 const rect=canvas.getBoundingClientRect();if(mode==='clean'&&ready&&!finished&&!done){const cursor=$('#brush-cursor');cursor.style.display='block';cursor.style.left=(e.clientX-rect.left)+'px';cursor.style.top=(e.clientY-rect.top)+'px';}
 if(!drag||drag.id!==e.pointerId)return;
 if(mode==='rotate'){yaw=drag.yaw-(e.clientX-drag.x)*.009;pitch=THREE.MathUtils.clamp(drag.pitch+(e.clientY-drag.y)*.007,.12,1.1);invalidate();}
 else{if(e.buttons===0&&e.pointerType==='mouse'){stopGesture();return;}if(!scrub(e.clientX,e.clientY))stopGesture();}
});
for(const event of ['pointerup','pointercancel','lostpointercapture','pointerleave'])canvas.addEventListener(event,stopGesture);
window.addEventListener('blur',stopGesture);
canvas.addEventListener('keydown',e=>{if(mode!=='rotate'||!ready||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){yaw=-.60;pitch=.37;}else if(e.key==='ArrowLeft')yaw-=Math.PI/12;else if(e.key==='ArrowRight')yaw+=Math.PI/12;else pitch=THREE.MathUtils.clamp(pitch+(e.key==='ArrowUp'?.12:-.12),.12,1.1);invalidate();});
document.addEventListener('visibilitychange',()=>{stopGesture();if(document.hidden){cancelAnimationFrame(raf);raf=0;if(demoRunning){stopDemo();updateUI();status('Pokaz zatrzymany. Możesz uruchomić go ponownie.');}}else invalidate();});
function fail(message){ready=false;stopDemo();stopGesture();cancelAnimationFrame(raf);raf=0;$('#loading').hidden=false;$('#loading').textContent=message;$('#fallback').hidden=false;for(const b of $$('button,select'))b.disabled=true;canvas.tabIndex=-1;status('Podgląd niedostępny. Poniżej znajdziesz tekstowy opis trzech kroków.');bridge?.fail(arguments[1]||'model');}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail('Podgląd 3D został przerwany. Odśwież stronę, aby spróbować ponownie.','kontekst');});
function pause(){stopDemo();stopGesture();paused=true;cancelAnimationFrame(raf);raf=0;if(ready)updateUI();}
function resume(){paused=false;invalidate();}
bridge=connectBridge('goz-cleaning3d',{pause,resume,setReduced:on=>{lessonReduced=!!on;}});

try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 scene.add(new THREE.HemisphereLight(0xffffff,0x899377,2.2));
 const key=new THREE.DirectionalLight(0xfff6e7,3);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3});key.shadow.normalBias=.012;key.shadow.bias=-.0001;key.shadow.radius=4;scene.add(key);
 const fill=new THREE.DirectionalLight(0xe4eef8,1.3);fill.position.set(3,2,-4);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.16}));floor.rotation.x=-Math.PI/2;floor.position.y=.015;floor.receiveShadow=true;scene.add(floor);
 const tc=document.createElement('canvas');tc.width=tc.height=128;const ctx=tc.getContext('2d'),gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(37,54,27,.30)');gradient.addColorStop(.5,'rgba(37,54,27,.12)');gradient.addColorStop(1,'rgba(37,54,27,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const contact=new THREE.Mesh(new THREE.PlaneGeometry(3.7,1.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(tc),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.016;scene.add(contact);
 const gltf=await new GLTFLoader().loadAsync('./assets/but_prototyp_01.glb'),model=gltf.scene;model.position.x=.125;
 model.traverse(o=>{if(!o.isMesh)return;meshes.push(o);o.castShadow=o.receiveShadow=true;if(['toe','side','heel','tongue','laces','badge','sole','sole_edge'].includes(o.material.name))o.material.color.set('#FFFFFF');});scene.add(model);model.updateWorldMatrix(true,true);
 model.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=8)corners.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));});
 buildLayers();ready=true;$('#loading').hidden=true;resize();new ResizeObserver(resize).observe(viewport);updateUI();invalidate();bridge?.modelReady();
}catch(error){console.warn('Podgląd buta:',error.message);fail('Nie udało się otworzyć buta 3D. Odśwież stronę lub skorzystaj z tekstowego opisu poniżej.',renderer?'model':'webgl');}

// Read-only diagnostics. Tests use real controls/pointer events, never state setters.
window.cleaningDiagnostics=()=>({ready,step,tool,done,finished,mode,yaw,pitch,drag:!!drag,comparison,demoRunning,frames,hidden:document.hidden,reducedMotion:reduced.matches,progress:fraction(),regions:Object.fromEntries(regions.map(r=>[r,fraction(r)])),cells:cells.length,layerRemaining:[0,1,2].map(i=>cells.reduce((s,c)=>s+c.weight*c.level[i],0)),drawCalls:renderer?.info.render.calls,targets:cells.filter((c,i)=>i%12===0&&c.level[step]>.05&&visibleFrom(c.center,camera.position)&&c.normal.dot(camera.position.clone().sub(c.center).normalize())>.05).map(c=>{const v=c.center.clone().project(camera),rect=canvas.getBoundingClientRect();return {x:rect.left+(v.x+1)*rect.width/2,y:rect.top+(1-v.y)*rect.height/2,region:c.region};})});
