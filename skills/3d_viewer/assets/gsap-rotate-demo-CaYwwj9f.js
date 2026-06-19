function V(){const l=window.__gsap,a=window.__THREE,s=window.__viewerAPI;if(!l||!a||!s)return console.warn("[gsap-rotate] Missing dependencies: gsap="+!!l+" THREE="+!!a+" api="+!!s),()=>{};const t="gsap-demo-rotate",p="gsap-demo-rotate-style",y=document.getElementById(t);y&&y.remove();const u=document.createElement("div");u.id=t,u.innerHTML=`<div class="ctrl-row">
    <button class="btn-icon btn-play" id="r-btn-play" title="播放/暂停">▶</button>
    <label>速度</label>
    <input type="range" id="r-speed" min="0" max="4" step="0.05" value="1">
    <span class="value" id="r-speed-val">1.00</span>
    <button class="btn-icon secondary" id="r-dir" title="切换方向">⟳</button>
    <button class="btn-icon secondary" id="r-mode" title="切换模式">📷</button>
    <span id="r-mode-label">相机</span>
  </div>
  <div class="ctrl-row">
    <label>轴</label>
    <select id="r-axis">
      <option value="y">Y</option>
      <option value="x">X</option>
      <option value="z">Z</option>
    </select>
    <label>运动</label>
    <select id="r-ease">
      <option value="none">linear</option>
      <option value="power1.inOut">power1</option>
      <option value="power2.inOut">power2</option>
      <option value="power3.inOut">power3</option>
      <option value="sine.inOut">sine</option>
      <option value="expo.inOut">expo</option>
      <option value="back.inOut">back</option>
      <option value="elastic.inOut" selected>elastic</option>
      <option value="bounce.inOut">bounce</option>
    </select>
  </div>`;const w=document.getElementById(p);w&&w.remove();const m=document.createElement("style");m.id=p,m.textContent=`#${t} {
    position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%);
    background: rgba(13,13,26,0.85); backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;
    padding: 5px 8px; min-width: 140px; z-index: 9999;
    display: flex; flex-direction: column; gap: 3px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    font-family: 'Segoe UI', system-ui, sans-serif; color: #ccc; pointer-events: auto;
  }
  #${t} .ctrl-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
  #${t} label { font-size: 11px; color: #888; white-space: nowrap; }
  #${t} .value { font-size: 11px; color: #66bbff; font-weight: 600; min-width: 24px; text-align: right; font-variant-numeric: tabular-nums; }
  #${t} input[type="range"] { flex: 1; min-width: 40px; height: 3px; -webkit-appearance: none; appearance: none; background: rgba(255,255,255,0.12); border-radius: 2px; outline: none; cursor: pointer; }
  #${t} input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%; background: #66bbff; cursor: pointer; border: 2px solid #0d0d1a; }
  #${t} .btn-icon { width: 24px; height: 24px; border-radius: 5px; border: none; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; }
  #${t} .btn-play { background: #66bbff; color: #0d0d1a; }
  #${t} .btn-play.paused { background: #ff8844; }
  #${t} .btn-icon.secondary { background: rgba(255,255,255,0.08); color: #ccc; }
  #${t} .btn-icon.secondary:hover { background: rgba(255,255,255,0.18); }
  #${t} select { padding: 2px 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); color: #ccc; font-size: 11px; outline: none; cursor: pointer; max-width: 56px; }
  #${t} select:focus { border-color: #66bbff; }`,document.head.appendChild(m),(document.getElementById("ai-layer")??document.body).appendChild(u);const r={angle:0},e={speed:1,dir:1,paused:!1,axis:"y",ease:"elastic.inOut",mode:"camera"};let b=new a.Vector3(0,1,0);const g=new a.Vector3;function v(){const n=s.getCameraState(),c=new a.Vector3(n.target[0],n.target[1],n.target[2]);g.copy(new a.Vector3(n.position[0],n.position[1],n.position[2])).sub(c),r.angle=0}function i(){if(l.killTweensOf(r),r.angle=0,e.mode==="object"&&s.setPartTransform("__model__",{quaternion:[0,0,0,1]}),e.paused)return;const n=e.dir*(Math.PI*2),c=Math.max(.1,6/Math.max(.01,e.speed));if(e.mode==="camera"){const o=s.getCameraState(),d=new a.Vector3(o.target[0],o.target[1],o.target[2]);g.copy(new a.Vector3(o.position[0],o.position[1],o.position[2])).sub(d),l.to(r,{angle:n,duration:c,ease:e.ease,overwrite:!0,onUpdate:function(){const O=new a.Quaternion().setFromAxisAngle(b,r.angle),f=g.clone().applyQuaternion(O);s.setCameraPosition([d.x+f.x,d.y+f.y,d.z+f.z],[d.x,d.y,d.z])},onComplete:function(){i()}})}else l.to(r,{angle:n,duration:c,ease:e.ease,overwrite:!0,onUpdate:function(){const o=new a.Quaternion().setFromAxisAngle(b,r.angle);s.setPartTransform("__model__",{quaternion:[o.x,o.y,o.z,o.w]})},onComplete:function(){i()}})}const x=document.getElementById("r-btn-play"),E=document.getElementById("r-speed"),C=document.getElementById("r-speed-val"),L=document.getElementById("r-dir"),h=document.getElementById("r-mode"),$=document.getElementById("r-mode-label"),k=document.getElementById("r-axis"),I=document.getElementById("r-ease");function _(){e.paused=!e.paused,x.textContent=e.paused?"▶":"⏸",x.classList.toggle("paused",e.paused),i()}x.addEventListener("click",_),E.addEventListener("input",function(){e.speed=parseFloat(E.value),C.textContent=e.speed.toFixed(2),i()}),L.addEventListener("click",function(){e.dir*=-1,i()}),h.addEventListener("click",function(){e.mode=e.mode==="camera"?"object":"camera",h.textContent=e.mode==="object"?"🧊":"📷",$.textContent=e.mode==="object"?"物体":"相机",i()}),k.addEventListener("change",function(){e.axis=k.value,b=e.axis==="x"?new a.Vector3(1,0,0):e.axis==="z"?new a.Vector3(0,0,1):new a.Vector3(0,1,0),v(),i()}),I.addEventListener("change",function(){e.ease=I.value,i()});function B(n){n.target instanceof HTMLInputElement||n.target instanceof HTMLSelectElement||n.key===" "&&(n.preventDefault(),_())}return document.addEventListener("keydown",B),v(),i(),function(){var c,o;l.killTweensOf(r),(c=document.getElementById(t))==null||c.remove(),(o=document.getElementById(p))==null||o.remove(),document.removeEventListener("keydown",B)}}export{V as startRotateDemo};
