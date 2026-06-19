import http from 'http'

const VIEWER_URL = process.env.MCP_VIEWER_URL || 'http://localhost:4273'

function postCommand(cmd) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ type: '3d-viewer', ...cmd })
    const url = new URL('/api/command', VIEWER_URL)
    const req = http.request({
      hostname: url.hostname, port: url.port, path: url.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let text = ''
      res.on('data', c => text += c)
      res.on('end', () => resolve(JSON.parse(text)))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

const TOOLS = [
  {
    name: 'set_theme', description: 'Toggle viewer theme (light/dark/system)',
    inputSchema: { type: 'object', properties: { value: { type: 'string', enum: ['light', 'dark', 'system'] } }, required: ['value'] },
    command: 'setTheme',
  },
  {
    name: 'get_theme', description: 'Get current theme',
    inputSchema: { type: 'object', properties: {} },
    command: 'getTheme',
  },
  {
    name: 'set_language', description: 'Switch UI language',
    inputSchema: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] },
    command: 'setLanguage',
  },
  {
    name: 'get_language', description: 'Get current language',
    inputSchema: { type: 'object', properties: {} },
    command: 'getLanguage',
  },
  {
    name: 'set_env', description: 'Switch environment map (studio, custom_N, or HDR URL)',
    inputSchema: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] },
    command: 'setEnv',
  },
  {
    name: 'get_env', description: 'Get current environment map ID',
    inputSchema: { type: 'object', properties: {} },
    command: 'getEnv',
  },
  {
    name: 'set_env_intensity', description: 'Set environment intensity (0-5)',
    inputSchema: { type: 'object', properties: { value: { type: 'number' } }, required: ['value'] },
    command: 'setEnvIntensity',
  },
  {
    name: 'set_env_rotation', description: 'Rotate environment map (radians)',
    inputSchema: { type: 'object', properties: { value: { type: 'number' } }, required: ['value'] },
    command: 'setEnvRotation',
  },
  {
    name: 'set_camera_mode', description: 'Switch perspective/orthographic camera',
    inputSchema: { type: 'object', properties: { value: { type: 'string', enum: ['perspective', 'orthographic'] } }, required: ['value'] },
    command: 'setCameraMode',
  },
  {
    name: 'reset_camera', description: 'Reset camera to fit model',
    inputSchema: { type: 'object', properties: {} },
    command: 'resetCamera',
  },
  {
    name: 'set_camera_position', description: 'Set camera position and target',
    inputSchema: { type: 'object', properties: { position: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Camera position [x, y, z]' }, target: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3, description: 'Look-at target [x, y, z]' } }, required: ['position'] },
    command: 'setCameraPosition',
  },
  {
    name: 'zoom_to_fit', description: 'Zoom camera to fit all visible geometry',
    inputSchema: { type: 'object', properties: { padding: { type: 'number', description: 'Padding factor (default 1.5)' } } },
    command: 'zoomToFit',
  },
  {
    name: 'get_material_presets', description: 'List all built-in material presets (29 presets: metals, plastics, glass, rubber, paints, etc.)',
    inputSchema: { type: 'object', properties: {} },
    command: 'getMaterialPresets',
  },
  {
    name: 'set_part_material_by_preset', description: 'Apply a built-in material preset to a part or batch-apply to matching parts. Use get_material_presets first to see available preset names.',
    inputSchema: { type: 'object', properties: { preset: { type: 'string', description: 'Preset name (camelCase, e.g. "chrome", "clearGlass")' }, partName: { type: 'string', description: 'Target part name (single part). Mutually exclusive with query.' }, query: { type: 'object', description: 'PartQuery filter for batch matching. Mutually exclusive with partName. Fields: name (regex string), color (object with rgb/name/tolerance), metalness/roughness (object with value/op), materialIndex (number or number[]), triangleCount (object with min/max), extruder (number), plateId (number).' } }, required: ['preset'] },
    command: 'setPartMaterialByPreset',
  },
  {
    name: 'set_part_material', description: 'Apply a custom material to a part or batch-apply to matching parts. Prefer set_part_material_by_preset when a matching preset exists.',
    inputSchema: { type: 'object', properties: { appearance: { type: 'object', description: 'MaterialAppearance object' }, partName: { type: 'string', description: 'Target part name (single part). Mutually exclusive with query.' }, query: { type: 'object', description: 'PartQuery filter for batch matching. Mutually exclusive with partName.' } }, required: ['appearance'] },
    command: 'setPartMaterial',
  },
  {
    name: 'get_part_material', description: 'Get current material state of a part (override, original, and preset name if any)',
    inputSchema: { type: 'object', properties: { partName: { type: 'string', description: 'Target part name. Omit to use selected part or first part.' } } },
    command: 'getPartMaterial',
  },
  {
    name: 'query_parts', description: 'Query parts by attribute filters. Returns matching parts without modifying material.',
    inputSchema: { type: 'object', properties: { query: { type: 'object', description: 'PartQuery filter. Fields: name (regex string), color (object with rgb/name/tolerance), metalness/roughness (object with value/op), materialIndex (number or number[]), triangleCount (object with min/max), extruder (number), plateId (number).' } }, required: ['query'] },
    command: 'queryParts',
  },
  {
    name: 'play_animation', description: 'Play current animation',
    inputSchema: { type: 'object', properties: {} },
    command: 'playAnimation',
  },
  {
    name: 'pause_animation', description: 'Pause animation',
    inputSchema: { type: 'object', properties: {} },
    command: 'pauseAnimation',
  },
  {
    name: 'stop_animation', description: 'Stop animation and return to start',
    inputSchema: { type: 'object', properties: {} },
    command: 'stopAnimation',
  },
  {
    name: 'select_animation', description: 'Select animation clip by index (0-based)',
    inputSchema: { type: 'object', properties: { index: { type: 'number' } }, required: ['index'] },
    command: 'selectAnimation',
  },
  {
    name: 'seek', description: 'Seek to time position (seconds, pauses after seek)',
    inputSchema: { type: 'object', properties: { time: { type: 'number' } }, required: ['time'] },
    command: 'seek',
  },
  {
    name: 'set_speed', description: 'Set animation playback speed multiplier',
    inputSchema: { type: 'object', properties: { value: { type: 'number' } }, required: ['value'] },
    command: 'setSpeed',
  },
  {
    name: 'clear_selection', description: 'Clear current selection',
    inputSchema: { type: 'object', properties: {} },
    command: 'clearSelection',
  },
  {
    name: 'set_active_tool', description: 'Switch view/transform tool',
    inputSchema: { type: 'object', properties: { value: { type: 'string', enum: ['view', 'objectTransform'] } }, required: ['value'] },
    command: 'setActiveTool',
  },
  {
    name: 'set_transform_mode', description: 'Set transform gizmo mode',
    inputSchema: { type: 'object', properties: { value: { type: 'string', enum: ['translate', 'rotate', 'scale'] } }, required: ['value'] },
    command: 'setTransformMode',
  },
  {
    name: 'set_fullscreen', description: 'Toggle fullscreen',
    inputSchema: { type: 'object', properties: { value: { type: 'boolean' } }, required: ['value'] },
    command: 'setFullscreen',
  },
  {
    name: 'toggle_left_panel', description: 'Toggle left panel',
    inputSchema: { type: 'object', properties: {} },
    command: 'toggleLeftPanel',
  },
  {
    name: 'toggle_right_panel', description: 'Toggle right panel',
    inputSchema: { type: 'object', properties: {} },
    command: 'toggleRightPanel',
  },
  {
    name: 'toggle_model_info', description: 'Toggle model info panel',
    inputSchema: { type: 'object', properties: {} },
    command: 'toggleModelInfo',
  },
  {
    name: 'toggle_env_panel', description: 'Toggle environment panel',
    inputSchema: { type: 'object', properties: {} },
    command: 'toggleEnvPanel',
  },
  {
    name: 'take_screenshot', description: 'Capture current viewport as base64 PNG',
    inputSchema: { type: 'object', properties: {} },
    command: 'takeScreenshot',
  },
  {
    name: 'load_model', description: 'Load a 3D model from URL into the viewer',
    inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'URL of the 3D model file (GLB, glTF, STEP, STL, OBJ, etc.)' }, data: { type: 'string', description: 'Base64 data URL of the model file' } }, anyOf: [{ required: ['url'] }, { required: ['data'] }] },
    command: 'loadModel',
  },
  {
    name: 'reset_viewer', description: 'Clear all loaded models and reset viewer to initial state',
    inputSchema: { type: 'object', properties: {} },
    command: 'resetViewer',
  },
]

function jsonrpc(id, result) {
  return JSON.stringify({ jsonrpc: '2.0', id, result })
}

function jsonrpcError(id, code, message) {
  return JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })
}

let msgBuffer = ''
process.stdin.on('data', chunk => {
  msgBuffer += chunk.toString()
  const lines = msgBuffer.split('\n')
  msgBuffer = lines.pop() || ''
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const msg = JSON.parse(trimmed)
      handleMessage(msg)
    } catch { /* ignore malformed JSON */ }
  }
})

async function handleMessage(msg) {
  const { id, method, params } = msg

  try {
    switch (method) {
      case 'initialize': {
        const result = {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: '3d-viewer-mcp', version: '1.0.0' },
        }
        process.stdout.write(jsonrpc(id, result) + '\n')
        break
      }
      case 'notifications/initialized': {
        // Client is ready, nothing to do
        break
      }
      case 'tools/list': {
        const result = {
          tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
        }
        process.stdout.write(jsonrpc(id, result) + '\n')
        break
      }
      case 'tools/call': {
        const tool = TOOLS.find(t => t.name === params?.name)
        if (!tool) {
          process.stdout.write(jsonrpcError(id, -32602, `Unknown tool: ${params?.name}`) + '\n')
          return
        }
        const args = params?.arguments || {}
        const cmdId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const resp = await postCommand({ id: cmdId, command: tool.command, params: args })
        process.stdout.write(jsonrpc(id, {
          content: [{ type: 'text', text: JSON.stringify(resp) }],
        }) + '\n')
        break
      }
      default: {
        process.stdout.write(jsonrpcError(id ?? null, -32601, `Unknown method: ${method}`) + '\n')
      }
    }
  } catch (err) {
    process.stdout.write(jsonrpcError(id ?? null, -32603, err.message) + '\n')
  }
}
