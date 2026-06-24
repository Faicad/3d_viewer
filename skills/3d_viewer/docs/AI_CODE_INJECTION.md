# AI-Generated Custom UI（覆盖层 iframe 方案）

> 以前的 `executeCode` 注入方案已被移除（commit: xxx）。改用 overlay iframe 方案：
> 1. 安全的 iframe 边界隔离 viewer 的 DOM/cookie
> 2. 保留全部 GSAP 能力（`parent.__gsap`、`parent.__THREE`、`parent.__viewerAPI`）
> 3. 不需要 `eval` 或 `unsafe-inline` CSP

## 原理

AI 生成的 `.html` 文件被 viewer 加载为**叠加层 iframe**（同源）。因为同源，iframe 内部的 JS 可直接访问 `parent.__gsap`、`parent.__THREE`、`parent.__viewerAPI`，跟旧方案的 `executeCode` 能力完全相同。

| 旧方案 | 新方案 |
|--------|--------|
| `(0, eval)(js)` 执行字符串代码 | 原生 `<script>` 标签 |
| JS 可访问 viewer 全部 DOM/cookie | **不能** — iframe 边界隔离 |
| 需要 `script-src unsafe-inline` | 不需要 |
| 需要 `script-src 'unsafe-eval'` | 不需要 |

## viewerAPI 完整接口

AI 生成的 HTML 中的 JS 代码可通过 `parent.__viewerAPI`（或 `parent.viewerAPI`）使用以下接口。

### 场景查询（返回纯数据拷贝）

```js
parent.viewerAPI.getLoadedFiles()
// → [{ id: "uuid", fileName: "model.glb", format: "glb" }]

parent.viewerAPI.getParts()
// → [{ partId: "uuid:part-0", name: "Gear", triangleCount: 2400 }]

parent.viewerAPI.getSceneTree()
// → [{ id: "file:uuid", name: "model.glb", visible: true, children: [...] }]

parent.viewerAPI.getCameraState()
// → { position: [5, 4, 8], target: [0, 0, 0], mode: "perspective" }

parent.viewerAPI.getSelection()
// → ["uuid:part-0"]
```

### 坐标投影

```js
parent.viewerAPI.worldToScreen(x, y, z)
// → { x: 320, y: 240 } | null

parent.viewerAPI.screenToWorld(screenX, screenY)
// → { origin: [0,0,5], direction: [0.1, 0.2, -1] } | null
```

### 相机操作

```js
parent.viewerAPI.setCameraPosition([5, 4, 8], [0, 0, 0])
parent.viewerAPI.zoomToFit(/* padding?: number */)
parent.viewerAPI.zoomToPart("uuid:part-0")
```

### 选择与高亮

```js
parent.viewerAPI.highlightPart("uuid:part-0", /* color?: string */)
parent.viewerAPI.clearHighlight()
```

### getPartProxy() — GSAP 直接操作

`getPartProxy()` 返回真实的 `THREE.Vector3`/`THREE.Euler`/`THREE.Quaternion` 对象，**GSAP 可直接读写**。

```js
const part = parent.viewerAPI.getPartProxy("uuid:part-0")
// part.position → THREE.Vector3  { x, y, z }
// part.rotation → THREE.Euler    { x, y, z, order }
// part.quaternion → THREE.Quaternion
// part.scale → THREE.Vector3    { x, y, z }

// 特殊值 "__model__" 返回整个模型组的引用
const model = parent.viewerAPI.getPartProxy("__model__")
```

有了 `getPartProxy`，AI 代码可以直接将 GSAP tween 到这些对象上：

```js
const gsap = window.parent.__gsap
const part = parent.viewerAPI.getPartProxy("uuid:part-0")

// 基本动画
gsap.to(part.rotation, { y: Math.PI * 2, duration: 2, ease: "elastic.inOut(1,0.3)" })

// Timeline
const tl = gsap.timeline({ repeat: -1, yoyo: true })
tl.to(part.position, { x: 10, duration: 1 })
  .to(part.position, { y: 5, duration: 0.5 }, "-=0.3")

// Stagger
const all = ["part-0", "part-1", "part-2"].map(id => parent.viewerAPI.getPartProxy(id))
gsap.from(all.map(p => p.position), { y: -5, duration: 0.5, stagger: 0.1 })
```

### setPartTransform() — 纯数据写入

```js
parent.viewerAPI.setPartTransform("__model__", {
  quaternion: [0, 0.707, 0, 0.707],
})
```

### postMessage — 查询命令

当需要返回值（如 `getParts`、`getCameraState`）时，也可使用 postMessage 查询：

```js
function post(cmd) {
  const id = 'req-' + Date.now()
  const msg = { type: '3d-viewer', id, ...cmd }
  window.parent.postMessage(msg, '*')
  return new Promise(resolve => {
    const h = e => {
      if (e.data?.type === '3d-viewer' && e.data?.id === id) {
        removeEventListener('message', h)
        resolve(e.data)
      }
    }
    addEventListener('message', h)
  })
}

const info = await post({ command: 'getModelInfo', params: {} })
console.log(info.data)
```

## 全局可用变量（通过 `parent.*`）

| 变量 | 说明 |
|------|------|
| `parent.__viewerAPI` / `parent.viewerAPI` | 3D 场景桥接接口 |
| `parent.__gsap` | GSAP 动画库 |
| `parent.__THREE` | Three.js 模块 |

## 内置 Demo 案例

三个 `.html` 文件（与 `index.html` 同级）可直接在浏览器中通过 overlay iframe 加载：

```
/
├── gsap-rotate-demo.html    # 旋转控制面板
├── gsap-assemble-demo.html  # 装配动画
└── gsap-explode-demo.html   # 爆炸图动画
```

viewer 加载后，通过 `__openGSAPDemo('rotate')` / `__openGSAPDemo('assemble')` / `__openGSAPDemo('explode')` 在控制台触发。

### gsap-rotate-demo — 旋转控制面板

- 播放/暂停按钮、进度条
- 速度滑块 (0–4x)、方向切换
- 相机环绕 / 物体自转 模式切换
- X/Y/Z 旋转轴选择
- 8 种缓动函数

### gsap-assemble-demo — 装配动画

- 零件按包围盒 Z 轴排序，自下而上逐个落位
- 落高倍率调节（1–5×）
- 单零件时长调节（0.2–3s）
- 7 种着陆缓动

### gsap-explode-demo — 爆炸图动画

- 零件以场景中心为原点，沿径向飞散
- 飞散距离倍率（0.2–5×）
- 单零件时长（0.3–5s）
- 交错延迟 stagger（0–0.8s）
- 8 种缓动函数

## 注意事项

- iframe 背景透明，控制面板需使用 CSS 定位（`fixed` / `absolute`）
- 按钮和输入框需设置 `pointer-events: auto`（iframe 本身可能点击穿透）
- postMessage 仅用于查询命令，动画控制可直接用 `parent.__gsap`