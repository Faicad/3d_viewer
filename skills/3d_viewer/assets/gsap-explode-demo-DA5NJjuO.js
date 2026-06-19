function W(w,h){var V,D;const z=window.__gsap,g=window.__THREE,u=window.__viewerAPI;if(!z||!g||!u)return console.warn("[gsap-explode] Missing dependencies"),()=>{};const a="gsap-demo-explode",B="gsap-demo-explode-style";(V=document.getElementById(a))==null||V.remove(),(D=document.getElementById(B))==null||D.remove();const k=document.createElement("div");k.id=a,k.innerHTML=`<div class="ctrl-row">
    <button class="btn-icon btn-play" id="e-btn-play" title="播放 (Space)">▶</button>
    <button class="btn-icon secondary" id="e-btn-reset" title="重置 (R)">⟲</button>
    <div class="scrub-wrap">
      <input type="range" id="e-scrub" min="0" max="1000" value="0">
      <span class="time-label" id="e-time-label">0.00s / 0.00s</span>
    </div>
    <label>轴</label>
    <select class="ctrl-select" id="e-axis-select" style="max-width:40px">
      <option value="x">X</option>
      <option value="y">Y</option>
      <option value="z" selected>Z</option>
    </select>
    <label>运动</label>
    <select class="ctrl-select" id="e-easing-select">
      <option value="back.out(1.7)">微回弹</option>
      <option value="back.out(2.5)">强回弹</option>
      <option value="elastic.out(1,0.2)">弹簧震荡</option>
      <option value="bounce.out">弹跳</option>
      <option value="power3.out" selected>平滑缓出</option>
      <option value="expo.out">指数缓出</option>
      <option value="power3.inOut">缓入缓出</option>
      <option value="none">线性</option>
    </select>
  </div>
  <div class="ctrl-row">
    <label>时长</label>
    <input type="range" id="e-dur-slider" min="0.3" max="5" step="0.1" value="1.5">
    <span class="value" id="e-dur-val">1.5s</span>
    <label>扩散</label>
    <input type="range" id="e-spread-slider" min="1" max="6" step="0.1" value="2">
    <span class="value" id="e-spread-val">2.0×</span>
  </div>
  <div class="ctrl-row">
    <label><input type="checkbox" id="e-strict-sep" checked> 严格分散</label>
  </div>`;const P=document.createElement("style");P.id=B,P.textContent=`#${a} {
    position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
    background: rgba(13,13,26,0.6); backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;
    padding: 5px 8px; min-width: 260px;
    display: flex; flex-direction: column; gap: 3px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    font-family: 'Segoe UI', system-ui, sans-serif; color: #ccc;
    pointer-events: auto;
  }
  #${a} .ctrl-row {
    display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  }
  #${a} .ctrl-row label {
    font-size: 11px; color: #888; white-space: nowrap;
  }
  #${a} .ctrl-row .value {
    font-size: 11px; color: #88cc44; font-weight: 600; min-width: 24px;
    text-align: right; font-variant-numeric: tabular-nums;
  }
  #${a} .btn-icon {
    width: 24px; height: 24px; border-radius: 5px; border: none;
    cursor: pointer; font-size: 12px; display: flex; align-items: center;
    justify-content: center; transition: all 0.15s;
  }
  #${a} .btn-play { background: #88cc44; color: #0d0d1a; }
  #${a} .btn-play:hover { background: #a0e060; }
  #${a} .btn-play.paused { background: #ff8844; }
  #${a} .btn-play.paused:hover { background: #ffaa66; }
  #${a} .btn-icon.secondary { background: rgba(255,255,255,0.08); color: #ccc; }
  #${a} .btn-icon.secondary:hover { background: rgba(255,255,255,0.15); }
  #${a} .sep-line { border: none; border-top: 1px solid rgba(255,255,255,0.04); margin: 1px 0; }
  #${a} .scrub-wrap {
    display: flex; align-items: center; gap: 4px; flex: 1;
  }
  #${a} .scrub-wrap input[type="range"] { max-width: none; }
  #${a} .time-label {
    font-size: 11px; color: #888; min-width: 65px; text-align: right; font-variant-numeric: tabular-nums;
  }
  #${a} input[type="range"] {
    flex: 1; min-width: 40px; height: 3px; -webkit-appearance: none;
    appearance: none; background: rgba(255,255,255,0.12); border-radius: 2px;
    outline: none; cursor: pointer;
  }
  #${a} input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%;
    background: #88cc44; cursor: pointer; border: 2px solid #0d0d1a;
    transition: transform 0.1s;
  }
  #${a} input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
  #${a} input[type="range"]::-moz-range-thumb {
    width: 10px; height: 10px; border-radius: 50%;
    background: #88cc44; cursor: pointer; border: 2px solid #0d0d1a;
  }
  #${a} .ctrl-select {
    padding: 2px 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06); color: #ccc; font-size: 11px; outline: none; cursor: pointer; max-width: 56px;
  }
  #${a} .ctrl-select:focus { border-color: #88cc44; }`,document.head.appendChild(P),(document.getElementById("ai-layer")??document.body).appendChild(k);let x=[],n=null,c=!1;function H(){const e=window.__gsap_initial_positions;if(e){const o=u.getParts();for(let t=0;t<o.length;t++){const s=e[o[t].partId];if(s){const i=u.getPartProxy(o[t].partId);i&&i.position.set(s[0],s[1],s[2])}}}else{window.__gsap_initial_positions={};const o=u.getParts();for(let t=0;t<o.length;t++){const s=u.getPartProxy(o[t].partId);s&&(window.__gsap_initial_positions[o[t].partId]=[s.position.x,s.position.y,s.position.z])}}}function F(e){const o=window.__r3f_dev&&window.__r3f_dev.scene;if(!o)return null;let t=null;return o.traverse(function(s){t||s.isMesh&&s.userData&&s.userData.partId===e&&(t=s)}),t}function E(){H(),n&&(n.progress(0).kill(),n=null),c=!1;const e=document.getElementById("e-btn-play");e.textContent="▶",e.classList.remove("paused");const o=u.getParts();if(!o||!o.length)return;const t=[],s=[];for(let i=0;i<o.length;i++){const m=o[i],d=u.getPartProxy(m.partId);if(!d)continue;const v=d.position.clone();t.push(v),s.push(m.partId)}s.length&&(X(s,t,o),L())}function X(e,o,t){const s=document.getElementById("e-axis-select").value,i=parseFloat(document.getElementById("e-spread-slider").value),m=[];for(let l=0;l<t.length;l++){const r=F(t[l].partId);if(r){const p=new g.Box3().setFromObject(r);m.push(p.getCenter(new g.Vector3))}else m.push(o[l].clone())}const d=[];for(let l=0;l<e.length;l++)d.push({idx:l,wVal:m[l][s]});d.sort(function(l,r){return l.wVal-r.wVal});const v=d.length,A=d[0].wVal,N=d[v-1].wVal,Z=N-A,q=(A+N)/2,U=new g.Box3;for(let l=0;l<t.length;l++){const r=F(t[l].partId);if(r){const p=new g.Box3().setFromObject(r);U.union(p)}}const _=U.getSize(new g.Vector3),j=Math.max(_.x,_.y,_.z)||1,G=document.getElementById("e-strict-sep").checked;x=[];for(let l=0;l<v;l++){const r=d[l].idx,p=o[r],I=p.clone();if(G){const $=l/(v-1||1)*2-1,J=j*Math.max(0,i-1)*.5;I[s]=p[s]+$*J}else if(Z<.001){const $=v-1||1;I[s]=p[s]+(l/$-.5)*j*Math.max(0,i-1)}else I[s]=p[s]+(m[r][s]-q)*Math.max(0,i-1);x.push({partId:e[r],proxy:u.getPartProxy(e[r]),localPos:p,target:I,name:t[r].name})}}function L(){if(!x.length)return;n&&(n.progress(0).kill(),n=null);const e=document.getElementById("e-btn-play"),o=document.getElementById("e-easing-select").value,t=parseFloat(document.getElementById("e-dur-slider").value);n=z.timeline({paused:!0,onUpdate:b,onComplete:function(){c=!1,e.textContent="⟳",e.classList.remove("paused")},onReverseComplete:function(){c=!1,e.textContent="▶",e.classList.remove("paused"),b()}});for(let s=0;s<x.length;s++){const i=x[s];!i.proxy||!i.proxy.position||typeof i.proxy.position.x!="number"||n.fromTo(i.proxy.position,{x:i.localPos.x,y:i.localPos.y,z:i.localPos.z},{x:i.target.x,y:i.target.y,z:i.target.z,duration:t,ease:o,overwrite:!0},0)}b()}function S(){if(!n||!x.length)return;const e=document.getElementById("e-btn-play");c?(n.pause(),c=!1,e.textContent="▶",e.classList.remove("paused")):(n.progress()>=1&&n.progress(0),n.play(),c=!0,e.textContent="⏸",e.classList.add("paused"))}function M(){if(!n||n.progress()===0)return;const e=document.getElementById("e-btn-play");c=!0,e.textContent="⏸",e.classList.add("paused"),n.reverse()}function b(){const e=document.getElementById("e-scrub"),o=document.getElementById("e-time-label");if(!n){e.value="0",o.textContent="0.00s / 0.00s";return}const t=n.progress();e.value=String(t*1e3),o.textContent=(t*n.duration()).toFixed(2)+"s / "+n.duration().toFixed(2)+"s"}const C=document.getElementById("e-btn-play"),K=document.getElementById("e-btn-reset"),T=document.getElementById("e-scrub"),Y=document.getElementById("e-easing-select"),f=document.getElementById("e-dur-slider"),y=document.getElementById("e-spread-slider");C.addEventListener("click",S),K.addEventListener("click",M),T.addEventListener("input",function(){n&&(n.progress(parseFloat(T.value)/1e3).pause(),c=!1,C.textContent="▶",C.classList.remove("paused"),b())}),document.getElementById("e-axis-select").addEventListener("change",function(){E()}),Y.addEventListener("change",L),f.addEventListener("input",function(){document.getElementById("e-dur-val").textContent=parseFloat(f.value).toFixed(1)+"s"}),f.addEventListener("change",L),y.addEventListener("input",function(){document.getElementById("e-spread-val").textContent=parseFloat(y.value).toFixed(1)+"×"}),y.addEventListener("change",function(){E()}),document.getElementById("e-strict-sep").addEventListener("change",function(){E()});function R(e){if(!(e.target.tagName==="INPUT"||e.target.tagName==="SELECT")){if(e.key===" "&&(e.preventDefault(),S()),e.key==="r"&&M(),e.key==="ArrowRight"&&n){const o=Math.min(1,n.progress()+.02);n.progress(o).pause(),c=!1;const t=document.getElementById("e-btn-play");t.textContent="▶",t.classList.remove("paused"),b()}if(e.key==="ArrowLeft"&&n){const o=Math.max(0,n.progress()-.02);n.progress(o).pause(),c=!1;const t=document.getElementById("e-btn-play");t.textContent="▶",t.classList.remove("paused"),b()}}}return document.addEventListener("keydown",R),w!=null&&(w>parseFloat(y.max)&&(y.max=String(w)),y.value=String(w),document.getElementById("e-spread-val").textContent=w.toFixed(1)+"×"),h!=null&&(h>parseFloat(f.max)&&(f.max=String(h)),f.value=String(h),document.getElementById("e-dur-val").textContent=h.toFixed(1)+"s"),E(),function(){var o,t;n&&(n.progress(0).kill(),n=null),(o=document.getElementById(a))==null||o.remove(),(t=document.getElementById(B))==null||t.remove(),document.removeEventListener("keydown",R)}}export{W as startExplodeDemo};
