function G(){var Z,j;const S=window.__gsap,h=window.__THREE,c=window.__viewerAPI;if(!S||!h||!c)return console.warn("[gsap-assemble] Missing dependencies"),()=>{};const s="gsap-demo-assemble",k="gsap-demo-assemble-style";(Z=document.getElementById(s))==null||Z.remove(),(j=document.getElementById(k))==null||j.remove();const B=document.createElement("div");B.id=s,B.innerHTML=`<div class="ctrl-row">
    <button class="btn-icon btn-play" id="a-btn-play" title="播放 (Space)">▶</button>
    <button class="btn-icon secondary" id="a-btn-reset" title="重置 (R)">⟲</button>
    <div class="scrub-wrap">
      <input type="range" id="a-scrub" min="0" max="1000" value="0">
      <span class="time-label" id="a-time-label">0.00s / 0.00s</span>
    </div>
    <label>运动</label>
    <select class="ctrl-select" id="a-easing-select">
      <option value="power3.in" selected>重力加速</option>
      <option value="back.out(2.5)">强锁定</option>
      <option value="elastic.out(1,0.2)">弹簧着陆</option>
      <option value="bounce.out">弹跳着陆</option>
      <option value="back.out(1.5)">锁定回弹</option>
      <option value="power3.inOut">缓入缓出</option>
      <option value="expo.in">重重力感</option>
      <option value="none">线性</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>高度</label>
    <input type="range" id="a-height-slider" min="1.0" max="5.0" step="0.1" value="3.0">
    <span class="value" id="a-height-val">3.0×</span>
    <label>时长</label>
    <input type="range" id="a-duration-slider" min="0.2" max="3.0" step="0.1" value="0.8">
    <span class="value" id="a-duration-val">0.8s</span>
  </div>`;const _=document.createElement("style");_.id=k,_.textContent=`#${s} {
    position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
    background: rgba(13,13,26,0.6); backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;
    padding: 5px 8px; min-width: 220px;
    display: flex; flex-direction: column; gap: 3px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    font-family: 'Segoe UI', system-ui, sans-serif; color: #ccc;
    pointer-events: auto;
  }
  #${s} .ctrl-row {
    display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  }
  #${s} .ctrl-row label {
    font-size: 11px; color: #888; white-space: nowrap;
  }
  #${s} .ctrl-row .value {
    font-size: 11px; color: #44aaff; font-weight: 600; min-width: 24px;
    text-align: right; font-variant-numeric: tabular-nums;
  }
  #${s} .btn-icon {
    width: 24px; height: 24px; border-radius: 5px; border: none;
    cursor: pointer; font-size: 12px; display: flex; align-items: center;
    justify-content: center; transition: all 0.15s;
  }
  #${s} .btn-play { background: #44aaff; color: #0d0d1a; }
  #${s} .btn-play:hover { background: #66ccff; }
  #${s} .btn-play.paused { background: #ff8844; }
  #${s} .btn-play.paused:hover { background: #ffaa66; }
  #${s} .btn-icon.secondary { background: rgba(255,255,255,0.08); color: #ccc; }
  #${s} .btn-icon.secondary:hover { background: rgba(255,255,255,0.15); }
  #${s} .sep-line { border: none; border-top: 1px solid rgba(255,255,255,0.04); margin: 1px 0; }
  #${s} .scrub-wrap {
    display: flex; align-items: center; gap: 4px; flex: 1;
  }
  #${s} .scrub-wrap input[type="range"] { max-width: none; }
  #${s} .time-label {
    font-size: 11px; color: #888; min-width: 65px; text-align: right; font-variant-numeric: tabular-nums;
  }
  #${s} input[type="range"] {
    flex: 1; min-width: 40px; height: 3px; -webkit-appearance: none;
    appearance: none; background: rgba(255,255,255,0.12); border-radius: 2px;
    outline: none; cursor: pointer;
  }
  #${s} input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%;
    background: #44aaff; cursor: pointer; border: 2px solid #0d0d1a;
    transition: transform 0.1s;
  }
  #${s} input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
  #${s} input[type="range"]::-moz-range-thumb {
    width: 10px; height: 10px; border-radius: 50%;
    background: #44aaff; cursor: pointer; border: 2px solid #0d0d1a;
  }
  #${s} .ctrl-select {
    padding: 2px 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06); color: #ccc; font-size: 11px; outline: none; cursor: pointer; max-width: 56px;
  }
  #${s} .ctrl-select:focus { border-color: #44aaff; }`,document.head.appendChild(_),(document.getElementById("ai-layer")??document.body).appendChild(B);let w=[],I=[],o=null,p=!1,P=null;function O(){const e=window.__gsap_initial_positions;if(e){const t=c.getParts();for(let n=0;n<t.length;n++){const r=e[t[n].partId];if(r){const i=c.getPartProxy(t[n].partId);i&&i.position.set(r[0],r[1],r[2])}}}else{window.__gsap_initial_positions={};const t=c.getParts();for(let n=0;n<t.length;n++){const r=c.getPartProxy(t[n].partId);r&&(window.__gsap_initial_positions[t[n].partId]=[r.position.x,r.position.y,r.position.z])}}}function U(){O();const e=c.getParts();if(!e||!e.length)return!1;I=[],w=[];const t=[];for(let i=0;i<e.length;i++){const g=e[i],y=c.getPartProxy(g.partId);if(!y)continue;const d=y.position.clone();I.push({partId:g.partId,pos:d.clone()});const x=E(g.partId);let m,v=0;if(x){const a=new h.Box3().setFromObject(x);m=a.getCenter(new h.Vector3),v=a.max.z-a.min.z}else m=d.clone();t.push(m),w.push({partId:g.partId,proxy:y,localPos:d,worldPos:m,height:v,name:g.name})}if(!w.length)return!1;const n=new h.Box3;for(let i=0;i<t.length;i++)n.expandByPoint(t[i]);const r=n.max.z;return P={parts:w,assemblyTopZ:r},!0}function E(e){const t=window.__r3f_dev&&window.__r3f_dev.scene;if(!t)return null;let n=null;return t.traverse(function(r){n||r.isMesh&&r.userData&&r.userData.partId===e&&(n=r)}),n}function K(){for(let e=0;e<I.length;e++){const t=I[e],n=c.getPartProxy(t.partId);n&&n.position.copy(t.pos);const r=E(t.partId);r&&(r.visible=!0)}}function T(){o&&(o.progress(0).kill(),o=null),p=!1;const e=document.getElementById("a-btn-play");if(e.textContent="▶",e.classList.remove("paused"),!P)return;const t=P.parts,n=P.assemblyTopZ,r=parseFloat(document.getElementById("a-height-slider").value),i=parseFloat(document.getElementById("a-duration-slider").value),g=document.getElementById("a-easing-select").value;t.sort(function(a,l){return a.worldPos.z-l.worldPos.z}),K();const y=n*r;for(let a=0;a<t.length;a++)t[a].dropZ=t[a].localPos.z+(y-t[a].worldPos.z);const d={};let x=0;for(let a=0;a<t.length;a++){const l=t[a],f=l.worldPos.z.toFixed(2)+"|"+l.height.toFixed(2);d[f]||(d[f]=[]),d[f].push(l)}const m=Object.keys(d).sort(function(a,l){return parseFloat(a.split("|")[0])-parseFloat(l.split("|")[0])});o=S.timeline({paused:!0,onComplete:function(){p=!1,e.textContent="⟳",e.classList.remove("paused")}});for(let a=0;a<t.length;a++){const l=E(t[a].partId);l&&o.set(l,{visible:!1},0)}const v=1/60;for(let a=0;a<m.length;a++){const l=x*i,f=l<v?v:l,H=d[m[a]];for(let F=0;F<H.length;F++){const u=H[F],N=E(u.partId);N&&o.set(N,{visible:!0},f),o.fromTo(u.proxy.position,{x:u.localPos.x,y:u.localPos.y,z:u.dropZ},{x:u.localPos.x,y:u.localPos.y,z:u.localPos.z,duration:i,ease:g,overwrite:!0},f)}x++}b()}function L(){T()}function D(){if(!o)return;const e=document.getElementById("a-btn-play");p?(o.pause(),p=!1,e.textContent="▶",e.classList.remove("paused")):(o.progress()>=1&&o.progress(0),o.play(),p=!0,e.textContent="⏸",e.classList.add("paused"))}function A(){if(o){o.progress(0).pause(),p=!1;const e=document.getElementById("a-btn-play");e.textContent="▶",e.classList.remove("paused"),b()}}function b(){const e=document.getElementById("a-scrub"),t=document.getElementById("a-time-label");if(!o){e.value="0",t.textContent="0.00s / 0.00s";return}const n=o.progress();e.value=String(n*1e3),t.textContent=(n*o.duration()).toFixed(2)+"s / "+o.duration().toFixed(2)+"s"}const $=document.getElementById("a-btn-play"),V=document.getElementById("a-btn-reset"),M=document.getElementById("a-scrub"),X=document.getElementById("a-easing-select"),z=document.getElementById("a-height-slider"),C=document.getElementById("a-duration-slider");$.addEventListener("click",D),V.addEventListener("click",A),M.addEventListener("input",function(){o&&(o.progress(parseFloat(M.value)/1e3).pause(),p=!1,$.textContent="▶",$.classList.remove("paused"),b())}),X.addEventListener("change",L),z.addEventListener("input",function(){document.getElementById("a-height-val").textContent=parseFloat(z.value).toFixed(1)+"×"}),z.addEventListener("change",L),C.addEventListener("input",function(){document.getElementById("a-duration-val").textContent=parseFloat(C.value).toFixed(1)+"s"}),C.addEventListener("change",L);function R(e){if(!(e.target.tagName==="INPUT"||e.target.tagName==="SELECT")){if(e.key===" "&&(e.preventDefault(),D()),e.key==="r"&&A(),e.key==="ArrowRight"&&o){const t=Math.min(1,o.progress()+.02);o.progress(t).pause(),p=!1;const n=document.getElementById("a-btn-play");n.textContent="▶",n.classList.remove("paused"),b()}if(e.key==="ArrowLeft"&&o){const t=Math.max(0,o.progress()-.02);o.progress(t).pause(),p=!1;const n=document.getElementById("a-btn-play");n.textContent="▶",n.classList.remove("paused"),b()}}}return document.addEventListener("keydown",R),U()&&T(),function(){var t,n;o&&(o.progress(0).kill(),o=null),(t=document.getElementById(s))==null||t.remove(),(n=document.getElementById(k))==null||n.remove(),document.removeEventListener("keydown",R)}}export{G as startAssembleDemo};
