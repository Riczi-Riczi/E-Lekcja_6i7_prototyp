// I92 wydanie 2: nowa ilustracja otwarcia, trzy stany wilgoci i krajobraz głębin.
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function asset(key) { return window.GOZ_VISUAL_REFRESH && window.GOZ_VISUAL_REFRESH.assets[key]; }
  function missing() { return '<span class="visual-refresh-missing" role="status">Ilustracja jest niedostępna. Skorzystaj z opisu obok.</span>'; }
  function image(key, eager) {
    var a=asset(key); if (!a) return missing();
    var v=a.variants, best=v[Math.min(1,v.length-1)];
    return '<img class="visual-refresh-img" data-visual-key="'+esc(key)+'" src="'+esc(best.file)+'" srcset="'+v.map(function(x){return esc(x.file)+' '+x.width+'w';}).join(', ')+'" sizes="(max-width:800px) 92vw, 600px" width="'+a.width+'" height="'+a.height+'" alt="'+esc(a.alt)+'" loading="'+(eager?'eager':'lazy')+'" decoding="async">';
  }
  function svgImage(key,w,h) {
    var a=asset(key); if(!a) return '';
    var v=a.variants[a.variants.length-1];
    return '<image data-visual-key="'+esc(key)+'" href="'+esc(v.file)+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid slice"/>';
  }
  function moisture(state) {
    if(!asset('moisture-'+state)) return missing();
    var info=window.GOZ_Z5.moisture.filter(function(m){return m.id===state;})[0];
    return '<svg xmlns="http://www.w3.org/2000/svg" class="art-svg moisture-'+state+'" viewBox="0 0 800 400" role="img" aria-label="'+esc(info.alt)+'">'+svgImage('moisture-'+state,800,400)+'</svg>';
  }
  function depth() {
    if(!asset('depth')) return missing();
    var marks='';
    [0,2000,4000,6000,8000,10890].forEach(function(m){
      var y=30+(m/10890)*560;
      marks+='<path d="M14 '+y+'h12" stroke="#fff" stroke-width="1.5"/><text x="31" y="'+(y+5)+'" font-family="system-ui" font-size="14" font-weight="650" fill="white" stroke="#052531" stroke-width="3" paint-order="stroke">'+m.toLocaleString('pl-PL')+' m</text>';
    });
    var start=30+(7000/10890)*560;
    return '<svg xmlns="http://www.w3.org/2000/svg" class="art-svg depth-landscape" viewBox="0 0 260 620" role="img" aria-label="Umowny krajobraz podwodny ze skalą od 0 do 10 890 metrów. Jasny pasek wskazuje zakres badania 7000–10 890 metrów.">'+svgImage('depth',260,620)+'<path d="M9 30V590" stroke="#d3edf1" stroke-opacity=".45"/><path d="M9 '+start+'V590" stroke="#D7F297" stroke-width="5"/>'+marks+'</svg>';
  }
  document.addEventListener('error',function(e){
    var node=e.target;
    if(!node || !node.dataset || !node.dataset.visualKey || node.dataset.visualFailed) return;
    node.dataset.visualFailed='1';
    var host=node.closest('svg') || node, label=asset(node.dataset.visualKey), note=document.createElement('span');
    note.className='visual-refresh-missing';note.setAttribute('role','status');
    note.textContent='Ilustracja jest niedostępna. '+(label?label.alt:'Skorzystaj z opisu obok.');
    host.replaceWith(note);
  },true);
  document.addEventListener('DOMContentLoaded',function(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-visual="hero"]'),function(host){host.innerHTML=image('hero',true);});
  });
  window.GOZVisualRefresh={image:image,moisture:moisture,depth:depth};
})();
