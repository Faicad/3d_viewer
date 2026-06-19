# 3D Viewer AI 控制接口

## 概述

三种方式控制查看器：

- **URL 参数**：页面加载时自动设置初始状态（语言、主题、环境贴图、自动加载模型）
- **HTTP API**（推荐）：`serve.mjs` 内置 SSE 桥，AI 通过 `curl` 发送命令，浏览器实时执行。无需浏览器 JS 能力。
- **postMessage API**：同窗口内实时控制

---

## 一、模型加载

将模型文件复制到服务目录下的 `models/`，然后通过 URL 参数或 API 命令加载。

```bash
cp /path/to/model.stl <skill_dir>/models/
node <skill_dir>/scripts/serve.mjs
# 打开 http://localhost:4273/#/workspace?url=./models/model.stl
```

支持格式：GLB、glTF、STEP、STP、STL、OBJ、3MF、FBX、PLY、SCAD，以及其他 Three.js 支持的格式。

STEP/STP 文件在加载时自动通过 OCCT WASM 转换为 GLB 再渲染。SCAD 文件通过 openscad-wasm 编译为 mesh 后渲染。

HDR/EXR 环境贴图同样处理（复制到 `models/` 后通过 `loadEnvFile` 命令加载）。

---

## 二、URL 参数（初始状态）

```
http://localhost:4273/#/workspace?url=<path>&theme=dark&lang=zh&env=studio
```

| 参数 | 类型 | 可选值 | 默认值 | 说明 |
|------|------|--------|--------|------|
| `url` | string | 服务目录下的相对路径 | — | 页面加载后自动加载该模型 |
| `theme` | string | `light` / `dark` / `system` | `system` | 界面主题 |
| `lang` | string | `zh` / `en` / `es` / `ja` / `ko` / `fr` / `de` / `pt` / `ru` / `ar` / `hi` / `id` / `tr` / `it` / `nl` / `pl` / `vi` / `th` / `uk` / `sv` | 浏览器语言 | 界面语言 |
| `env` | string | `studio` / 任意 HDR URL | `studio` | 环境贴图。支持 Poly Haven 等支持 CORS 的 CDN 链接 |

---

## 三、SSE/HTTP 桥接（跨进程控制）

`serve.mjs` 内置 SSE 桥，解决 AI 进程与浏览器进程隔离的问题：

```
AI (curl) ──POST /api/command──→ serve.mjs ──SSE──→ 浏览器执行
```

### 请求格式

所有命令**建议携带 `id`**，serve.mjs 等待浏览器回传结果后返回。若未传 `id` 则自动生成（响应中会附加 `_warning` 提示）。超时 30 秒。

```bash
curl -X POST http://localhost:4273/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"3d-viewer","id":"req-001","command":"getTheme","params":{}}'
# 响应: {"type":"3d-viewer","id":"req-001","command":"getTheme","status":"success","data":{"theme":"dark"}}
# 超时（30s）: {"type":"3d-viewer","id":"req-001","command":"getTheme","status":"error","error":"Command timeout: getTheme"}
```

#### 异步命令说明

`loadModel` 是异步命令。SSE handler 会 `await` 直到模型完全加载（含 STEP→GLB 转换），然后 POST `/api/result` 唤醒 MCP Promise。因此 `loadModel` 请求会阻塞到模型真正可用才返回，response 中直接包含完整的模型信息。

#### 错误响应

| 状态码 | 条件 | 响应体 |
|--------|------|--------|
| 400 | JSON 格式错误 | `{"type":"3d-viewer","status":"error","error":"Invalid JSON"}` |
| 503 | 无 SSE 客户端连接 | `{"type":"3d-viewer","status":"error","error":"No connected clients"}` |
| 504 | 同步模式超时（30s） | `{"type":"3d-viewer","id":"<id>","command":"<cmd>","status":"error","error":"Command timeout: <cmd>"}` |

### 命令格式

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 固定 `"3d-viewer"` |
| `command` | string | 是 | 命令名称 |
| `id` | string | 强烈建议 | 请求 ID。未传时 serve.mjs 自动生成（响应附带 `_warning`） |
| `params` | object | 否 | 命令参数 |

> 命令列表与 postMessage API 完全一致，见下文。

---

## 四、postMessage API（同窗口控制）

### 协议格式

#### 请求
```js
window.postMessage({
  type: '3d-viewer',
  id: 'req-001',
  command: 'setTheme',
  params: { value: 'dark' }
}, '*')
```

#### 响应

```js
// 成功
{
  type: '3d-viewer',
  id: 'req-001',
  command: 'setTheme',
  status: 'success',
  data: { theme: 'dark' }
}

// 失败
{
  type: '3d-viewer',
  id: 'req-001',
  command: 'setTheme',
  status: 'error',
  error: 'Invalid theme: foo'
}
```

异步命令（`loadModel`、`exportModel`）通过 postMessage 通道时，即时返回 `{ loading: true }`，完成后推送 `modelLoaded` / `modelLoadError` 事件。AI 通过 SSE 通道使用时可忽略此差异（SSE 会 await 完整结果）。

---

### 命令列表

#### 模型控制

| 命令 | 参数 | 说明 |
|------|------|------|
| `loadModel` | `{ url: string }` 或 `{ data: string }` | 从 URL 或 base64 data URL 加载模型。STEP 自动转换为 GLB |
| `getModelInfo` | — | 获取当前模型信息（fileName、format、partCount、parts、animations） |
| `resetViewer` | — | 清空场景、清除选中、重置动画状态 |
| `exportModel` | `{ format: 'glb' \| 'stl' }` | 导出当前场景所有可见模型为 GLB 或 STL，返回 base64 编码的二进制数据 |

#### 主题

| 命令 | 参数 | 说明 |
|------|------|------|
| `setTheme` | `{ value: 'light' \| 'dark' \| 'system' }` | 切换主题 |
| `getTheme` | — | 获取当前主题 |

#### 语言

| 命令 | 参数 | 说明 |
|------|------|------|
| `setLanguage` | `{ value: string }` | 切换界面语言 |
| `getLanguage` | — | 获取当前语言 |

#### 环境贴图

| 命令 | 参数 | 说明 |
|------|------|------|
| `setEnv` | `{ value: string }` | 切换环境贴图（`studio`、`custom_N`、或 HDR URL） |
| `getEnv` | — | 获取当前环境贴图 ID |
| `setEnvIntensity` | `{ value: number }` | 设置环境强度 0-5 |
| `setEnvRotation` | `{ value: number }` | 旋转环境贴图（弧度） |
| `loadEnvFile` | `{ url: string, name: string }` | 加载自定义 HDR/EXR |

#### 材质控制

| 命令 | 参数 | 说明 |
|------|------|------|
| `getMaterialPresets` | — | 获取所有内置材质预设（名称 → 完整 MaterialAppearance 字典） |
| `setPartMaterialByPreset` | `{ preset: string, partName?: string }` 或 `{ preset: string, query: PartQuery }` | 应用内置预设到指定零件，或按查询批量设置 |
| `setPartMaterial` | `{ appearance: MaterialAppearance, partName?: string }` 或 `{ appearance: MaterialAppearance, query: PartQuery }` | 应用自定义材质到指定零件，或按查询批量设置 |
| `getPartMaterial` | `{ partName?: string }` | 获取指定零件的当前材质状态 |
| `queryParts` | `{ query: PartQuery }` | 按属性查询零件，返回匹配结果，不修改材质 |

##### 零件材质定位规则

`partName` 是**场景树中显示的零件名**（`GlbPartInfo.name`）。不传时按以下优先级自动确定目标：

| 优先级 | 条件 | 行为 |
|--------|------|------|
| 1 | 指定了 `partName` | 按名称匹配（重名取首个） |
| 2 | 有选中（`selectedReferenceIds` 非空） | 该节点下所有零件，支持零件/文件/组 |
| 3 | 未选中 | 当前活跃文件 → 其下所有零件 |

> **提示**：`getModelInfo` 返回每个零件的 `name`（场景树显示名）和 `partId`。

##### 预设 vs 自定义材质

- **`setPartMaterialByPreset`** — 从内置预设库中选择，系统记录该零件使用的是哪个 preset
- **`setPartMaterial`** — 传入任意 MaterialAppearance，系统标记该零件为"自定义材质"（清掉 preset 引用）

`getPartMaterial` 的返回值会区分这两种情况：

```typescript
{
  fileId: "...",
  parts: [
    { partId: "...", partName: "Box",
      override: { name:"Chrome", metalness:1, roughness:0.02, ... },
      original: { ... },
      preset: "chrome" },
    { partId: "...", partName: "Lid",
      override: { name:"Chrome", ... },
      original: { ... },
      preset: "chrome" },
  ],
  partCount: 2
}
```

##### MaterialAppearance 结构

```typescript
{
  name?: string
  color?: [number, number, number, number]   // RGBA 0-1
  metalness?: number       // 0-1
  roughness?: number       // 0-1
  transmission?: number    // 0-1
  thickness?: number
  ior?: number
  emissive?: [number, number, number]
  emissiveIntensity?: number
  clearcoat?: number
  clearcoatRoughness?: number
  sheen?: number
  sheenColor?: [number, number, number]
  anisotropy?: number
  doubleSided?: boolean
}
```

> **建议**：优先使用 `setPartMaterialByPreset`。AI 应先调用 `getMaterialPresets` 了解可用预设（29 个，覆盖金属/塑料/玻璃/橡胶/油漆等），按名字匹配后应用。

##### 批量查询（query 参数）

`setPartMaterialByPreset` 和 `setPartMaterial` 支持传入 `query` 参数（与 `partName` 互斥），一次性匹配所有符合条件的零件并应用材质：

```typescript
// 给所有名字以 "gear" 开头的零件应用 gold 预设
{ command: "setPartMaterialByPreset", params: { query: { name: "^gear" }, preset: "gold" } }
```

当 `query` 存在时忽略 `partName`。完整的 `PartQuery` 语法见下方 `queryParts`。

##### `queryParts` — 零件查询命令

按属性查询零件，不修改材质：

```typescript
{ command: "queryParts", params: { query: { name: ".*screw.*" } } }
// 返回：{ status: "success", data: { parts: [{ partId, partName, triangleCount, materialIndex, ... }], partCount: N } }
```

##### PartQuery 语法

```typescript
interface PartQuery {
  name?: string            // 零件名正则，如 "^gear"、".*screw.*"
  color?: ColorMatch       // 按原始材质颜色匹配
  metalness?: NumberMatch  // 按金属度匹配
  roughness?: NumberMatch  // 按粗糙度匹配
  materialIndex?: number | number[]  // 按 glTF 材质索引匹配
  triangleCount?: RangeMatch        // 按三角形数量范围匹配
  extruder?: number        // Bambu Lab 挤出器（1-based）
  plateId?: number         // Bambu Lab 平台
}

interface NumberMatch {
  value: number
  op?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'  // 默认 'eq'
}

interface RangeMatch {
  min?: number
  max?: number
}

interface ColorMatch {
  rgb?:                                // RGB(A) 0-255
    | [number, number, number]         // [255,0,0]
    | [number, number, number, number] // [255,0,0,255]
    | { r: number; g: number; b: number; a?: number }  // { r:255, g:0, b:0 }
    | string                           // "rgb(255,0,0)" / "rgba(255,0,0,1)" / "255,0,0" / "#FF0000" / "FF0000"
  name?: string                        // 颜色名："red"、"black"、"blue"、"grey" 等
  tolerance?: number                   // 容差 0-255，默认 0
}
```

多个条件之间为 **AND** 关系。`name` 正则使用 JavaScript `RegExp`，非法正则抛错。

内置颜色名：`black`、`white`、`red`、`green`、`blue`、`yellow`、`cyan`、`magenta`、`grey`/`gray`、`orange`、`brown`、`pink`、`purple`、`navy`。

示例：

```typescript
// 所有右侧零件
{ query: { name: "\\.R$" } }

// Main 材质零件（glTF 材质索引 = 1）
{ query: { materialIndex: 1 } }

// 所有金属零件（metalness = 1）
{ query: { metalness: { value: 1 } } }

// 所有非金属零件
{ query: { metalness: { value: 0.5, op: "gt" } } }

// 灰色的零件（近似匹配）
{ query: { color: { name: "grey", tolerance: 10 } } }

// 组合：左侧零件且为 Main 材质
{ query: { name: "\\.L$", materialIndex: 1 } }

// 批量应用 chrome 预设到所有金属零件
{ command: "setPartMaterialByPreset", params: { query: { metalness: { value: 0.5, op: "gt" } }, preset: "chrome" } }
```

##### `getMaterialPresets` 返回结构

```typescript
{
  presets: {
    chrome:        { name:"Chrome",         color:[0.95,0.95,0.96], metalness:1.0, roughness:0.02 },
    gold:          { name:"Gold",           color:[1.0,0.84,0.0],   metalness:1.0, roughness:0.1 },
    // ...共 29 个预设
  }
}
```

#### 动画控制

GLB 文件内置的骨骼/变形动画（如产品演示动画、角色动作）。**这是 GLB 自身格式的原生动画系统**，由 Three.js `AnimationMixer` 驱动，通过 `playAnimation` / `pauseAnimation` / `seek` 等命令控制播放。

> ⚠️ **与 GSAP 动画 Demo 的区别**：
> - **GLB 内置动画**（本节命令）— 模型文件自带的骨骼/变形动画片段，播放/暂停/跳转，AI 通过 API 命令控制
> - **GSAP Demo 动画**（`executeCode` 注入）— AI 生成的 GSAP 装配/爆炸/旋转效果，操作零件整体运动，AI 通过 `node demos/<name>.mjs` 注入 UI 面板控制
>
> 两者互不依赖：GLB 内置动画由模型作者定义，GSAP Demo 由 AI 实时生成。

| 命令 | 参数 | 说明 |
|------|------|------|
| `getAnimationInfo` | — | 获取动画列表和播放状态 |
| `playAnimation` | — | 播放当前选中动画 |
| `pauseAnimation` | — | 暂停播放 |
| `stopAnimation` | — | 停止并回到起点 |
| `selectAnimation` | `{ index: number }` | 选择第 N 个动画片段（从 0 开始） |
| `seek` | `{ time: number }` | 跳转到指定时间点（秒） |
| `setSpeed` | `{ value: number }` | 设置播放速度倍数 |
| `setAnimationMaximized` | `{ value: boolean }` | 最大化/还原动画窗口 |

#### 相机

| 命令 | 参数 | 说明 |
|------|------|------|
| `setCameraPosition` | `{ position: [x,y,z], target?: [x,y,z] }` | 设置相机位置和观察目标 |
| `resetCamera` | — | 重置相机到默认位置 `(0, -6, 4)`，看向原点 |
| `zoomToFit` | `{ padding?: number }` | 缩放适配所有可见几何体（`padding` 默认 1.5） |
| `setCameraMode` | `{ value: 'perspective' \| 'orthographic' }` | 切换透视/正交投影 |

#### 选择 & 工具

| 命令 | 参数 | 说明 |
|------|------|------|
| `clearSelection` | — | 清除选中 |
| `getSelection` | — | 获取当前选中部件列表 |
| `setActiveTool` | `{ value: 'view' \| 'objectTransform' }` | 切换查看/变换工具 |
| `setTransformMode` | `{ value: 'translate' \| 'rotate' \| 'scale' }` | 设置变换 gizmo 模式 |

#### UI 面板

| 命令 | 参数 | 说明 |
|------|------|------|
| `toggleRightPanel` | — | 切换右侧场景树面板 |

#### 截屏

| 命令 | 参数 | 说明 |
|------|------|------|
| `takeScreenshot` | `{ width?: number, height?: number }` | 截取当前视口，返回 base64 PNG data URL |

#### 代码注入（AI 生成自定义 UI）

| 命令 | 参数 | 说明 |
|------|------|------|
| `executeCode` | `{ html?: string, css?: string, js?: string, mode?: 'replace' \| 'append' \| 'clear' }` | 🧪 实验性。在 `#ai-layer` 中注入 AI 生成的 UI，可操作场景 |

> `executeCode` 是 AI 生成自定义 UI 的入口，**当前为实验性功能**，接口和行为可能在未来版本中调整。详见 [AI Code Injection](./AI_CODE_INJECTION.md)。

内置三个 Demo 可直接 `node demos/<name>.mjs` 执行，向本地 viewer 注入动画控制面板：

| Demo | 说明 |
|------|------|
| `gsap-rotate-demo.html` | 旋转控制面板 — 相机环绕/物体自转、速度、缓动、轴选择 |
| `gsap-assemble-demo.mjs` | 装配动画 — 零件自下而上逐个落位，可调节落高、时长、着陆缓动 |
| `gsap-explode-demo.mjs` | 爆炸图动画 — 零件沿径向飞散，可调距离、stagger、时长、缓动 |

---

## 五、loadModel 命令详解

### 请求

```js
{ type: '3d-viewer', id: 'load-1', command: 'loadModel', params: { url: 'https://example.com/model.glb' } }
// 或 base64 数据（小文件）：
{ type: '3d-viewer', id: 'load-1', command: 'loadModel', params: { data: 'data:model/gltf-binary;base64,...' } }
```

### 响应（SSE/HTTP 通道）

SSE handler `await` 异步结果，阻塞直到模型完全加载后返回：

```json
{
  "type": "3d-viewer",
  "id": "load-1",
  "command": "loadModel",
  "status": "success",
  "data": {
    "fileId": "uuid",
    "fileName": "model.glb",
    "format": "glb",
    "sourceUnit": "mm",
    "partCount": 3,
    "parts": [{ "partId": "0", "name": "Part1", "triangleCount": 1200 }],
    "animations": [{ "name": "Take 001", "duration": 2.5 }]
  }
}
```

失败时返回：

```json
{
  "type": "3d-viewer",
  "id": "load-1",
  "command": "loadModel",
  "status": "error",
  "error": "Failed to fetch: HTTP 404"
}
```

### 执行流程

1. AI 调用 MCP `load_model` → POST `/api/command` → serve.mjs SSE 到浏览器
2. 浏览器 SSE handler `await executeCommand(msg)`
3. `loadModel` 返回 Promise，内部执行 `fetch` → `detectFormat` → (可选 STEP→GLB 转换) → `loadFormat` → `addLoadedFile`
4. 完成后 handler POST `/api/result`，serve.mjs 唤醒 MCP Promise
5. AI 拿到包含 `{ fileId, fileName, format, partCount, parts }` 的完整响应

---

## 六、exportModel 命令详解

将当前场景中所有可见模型导出为 GLB 或 STL 格式。**导出数据通过 API 响应返回（base64 编码的二进制数据）**，UI 工具栏的 Export 按钮触发浏览器下载。

### 请求

```js
{
  type: '3d-viewer',
  id: 'exp-1',
  command: 'exportModel',
  params: {
    format: 'glb'
  }
}
```

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `format` | `"glb"` \| `"stl"` | **是** | — | 导出格式。GLB 保留材质，STL 纯几何（无材质） |

### 响应（SSE/HTTP 通道）

```json
{
  "type": "3d-viewer",
  "id": "exp-1",
  "command": "exportModel",
  "status": "success",
  "data": {
    "base64": "Z2xURgIAAAB...（base64 编码）",
    "byteLength": 43984,
    "format": "stl"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.base64` | string | base64 编码的二进制数据（GLB 或 STL） |
| `data.byteLength` | number | 原始字节数（解码后大小） |
| `data.format` | string | 导出格式（`"glb"` 或 `"stl"`） |

场景中无可导出几何体时返回：

```json
{
  "type": "3d-viewer",
  "id": "exp-1",
  "command": "exportModel",
  "status": "error",
  "error": "No exportable geometry in scene"
}
```

### 执行流程

1. `exportModel` 命令收集 R3F 场景中所有可见的 `THREE.Mesh`
2. 根据 `format` 参数选择导出器：
   - **STL** — 使用 Three.js `STLExporter`，导出世界空间坐标，无材质
   - **GLB** — 使用 Three.js `GLTFExporter`，保留当前生效的材质（含用户修改）
3. 导出结果编码为 base64，通过 API 响应返回（SSE await 完整结果后同步返回）

### 典型场景

```bash
# 导出为 GLB（保留材质），解码保存到文件
curl -X POST http://localhost:4273/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"3d-viewer","id":"exp-1","command":"exportModel","params":{"format":"glb"}}' \
  | jq -r '.data.base64' | base64 -d > model.glb

# 导出为 STL（纯几何）
curl -X POST http://localhost:4273/api/command \
  -H "Content-Type: application/json" \
  -d '{"type":"3d-viewer","id":"exp-2","command":"exportModel","params":{"format":"stl"}}' \
  | jq -r '.data.base64' | base64 -d > model.stl
```

收到成功响应后，`data.base64` 中包含 base64 编码的二进制数据，base64 解码后即为完整的 GLB 或 STL 文件。AI 可由此获取导出数据，将其保存到 `models/` 目录，或通过 `loadModel` 重新加载。

---
