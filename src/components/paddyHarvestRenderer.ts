import { HARVEST_INTRO_SECONDS } from './harvestTiming';

type Vector = [number, number, number];
type Rotation = [number, number, number, number];
type Color = [number, number, number, number];
interface Mesh { vertices: Float32Array; indices: Uint16Array }
interface Segment { a: Vector; b: Vector; radius: number; plant: number; color: Color }
interface Grain { position: Vector; direction: Vector; size: Vector; color: Color; plant: number; release: boolean; phase: number }
interface Blade { position: Vector; direction: Vector; size: Vector; plant: number }
export interface HarvestRenderer {
  setRunning: (running: boolean) => void;
  setPointer: (x: number, y: number) => void;
  dispose: () => void;
}

const vertexShader = `#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec3 a_normal;
layout(location=2) in vec3 a_offset;
layout(location=3) in vec3 a_scale;
layout(location=4) in vec4 a_rotation;
layout(location=5) in vec4 a_color;
uniform mat4 u_projection;
uniform mat4 u_view;
out vec3 v_normal;
out vec3 v_world;
out vec3 v_local;
out vec4 v_color;
vec3 rotate(vec3 p, vec4 q) { return p + 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p); }
void main() {
  v_world = rotate(a_position * a_scale, a_rotation) + a_offset;
  v_normal = normalize(rotate(a_normal / a_scale, a_rotation));
  v_local = a_position;
  v_color = a_color;
  gl_Position = u_projection * u_view * vec4(v_world, 1.0);
}`;

const fragmentShader = `#version 300 es
precision highp float;
in vec3 v_normal;
in vec3 v_world;
in vec3 v_local;
in vec4 v_color;
uniform vec3 u_eye;
uniform int u_material;
out vec4 outColor;
void main() {
  if (v_color.a < 0.025) discard;
  vec3 normal = normalize(v_normal);
  if (u_material == 1 && !gl_FrontFacing) normal = -normal;
  vec3 light = normalize(vec3(-0.6, 1.0, 1.2));
  vec3 view = normalize(u_eye - v_world);
  float diffuse = 0.43 + max(dot(normal, light), 0.0) * 0.57;
  diffuse += max(dot(normal, normalize(vec3(1.0, 0.1, 0.5))), 0.0) * 0.15;
  vec3 base = v_color.rgb;
  if (u_material == 1) {
    float vein = 1.0 - smoothstep(0.005, 0.025, abs(v_local.x));
    base += vec3(0.10, 0.13, 0.025) * vein;
    base *= 0.97 + 0.03 * sin(v_local.x * 140.0);
  }
  if (u_material == 2) {
    float ridge = pow(max(0.0, 1.0 - abs(v_local.x) * 5.0), 3.0);
    base *= 0.96 + 0.04 * sin(v_local.y * 22.0 + v_local.z * 4.0);
    base -= ridge * vec3(0.035, 0.028, 0.014);
  }
  float gloss = pow(max(dot(normal, normalize(light + view)), 0.0), u_material == 2 ? 30.0 : 15.0);
  float rim = pow(1.0 - max(dot(normal, view), 0.0), 3.0);
  vec3 color = base * diffuse + gloss * vec3(0.24, 0.21, 0.14) + rim * vec3(0.035, 0.055, 0.018);
  outColor = vec4(color, v_color.a);
}`;

const normalize = (v: Vector): Vector => {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};
const subtract = (a: Vector, b: Vector): Vector => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vector, b: Vector): Vector => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const seed = (value: number) => { const n = Math.sin(value * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const curve = (a: Vector, b: Vector, c: Vector, t: number): Vector => [0, 1, 2].map((i) => (1 - t) ** 2 * a[i] + 2 * (1 - t) * t * b[i] + t ** 2 * c[i]) as Vector;
const align = (direction: Vector): Rotation => {
  const d = normalize(direction);
  if (d[1] < -0.9999) return [1, 0, 0, 0];
  const q: Rotation = [d[2], 0, -d[0], 1 + d[1]];
  const length = Math.hypot(...q);
  return q.map((v) => v / length) as Rotation;
};
const euler = (x: number, y: number, z: number): Rotation => {
  const [sx, sy, sz] = [Math.sin(x / 2), Math.sin(y / 2), Math.sin(z / 2)];
  const [cx, cy, cz] = [Math.cos(x / 2), Math.cos(y / 2), Math.cos(z / 2)];
  return [sx * cy * cz + cx * sy * sz, cx * sy * cz - sx * cy * sz, cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz];
};
const multiply = (a: Rotation, b: Rotation): Rotation => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

function sphere(): Mesh {
  const vertices: number[] = [], indices: number[] = [];
  const rings = 10, sides = 12;
  for (let row = 0; row <= rings; row++) {
    const theta = row * Math.PI / rings;
    for (let column = 0; column <= sides; column++) {
      const phi = column * Math.PI * 2 / sides;
      const point = [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)];
      vertices.push(...point, ...point);
    }
  }
  for (let row = 0; row < rings; row++) for (let column = 0; column < sides; column++) {
    const a = row * (sides + 1) + column, b = a + sides + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
}

function leaf(): Mesh {
  const vertices: number[] = [], indices: number[] = [];
  for (let row = 0; row <= 18; row++) {
    const t = row / 18, width = Math.max(0.002, Math.sin(t * Math.PI) ** 0.8 * 0.42);
    const z = Math.sin(t * Math.PI) * 0.2 + t * t * 0.3;
    const normal = normalize([0, -(Math.cos(t * Math.PI) * Math.PI * 0.2 + t * 0.6), 1]);
    for (const side of [-1, 0, 1]) vertices.push(side * width, t, z - Math.abs(side) * 0.025, ...normal);
    if (row < 18) for (let column = 0; column < 2; column++) {
      const a = row * 3 + column;
      indices.push(a, a + 1, a + 3, a + 3, a + 1, a + 4);
    }
  }
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
}

function cylinder(): Mesh {
  const vertices: number[] = [], indices: number[] = [];
  for (let column = 0; column <= 10; column++) {
    const angle = column / 10 * Math.PI * 2, x = Math.cos(angle), z = Math.sin(angle);
    vertices.push(x, -1, z, x, 0, z, x, 1, z, x, 0, z);
    if (column < 10) {
      const a = column * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  return { vertices: new Float32Array(vertices), indices: new Uint16Array(indices) };
}

function plants() {
  const segments: Segment[] = [], grains: Grain[] = [], blades: Blade[] = [];
  const stalks: [Vector, Vector, Vector, Vector, Vector][] = [
    [[1.2, -3.0, -0.1], [1.4, -0.3, -0.1], [0.7, 1.75, -0.1], [-0.6, 2.35, 0.1], [-2.0, 0.25, 0.35]],
    [[2.0, -3.0, 0.7], [2.2, -1.0, 0.55], [1.25, 0.5, 0.65], [0.1, 1.25, 1.0], [-1.6, -1.05, 1.25]],
    [[2.3, -3.0, -1.2], [2.6, 0.3, -1.4], [1.7, 2.5, -1.1], [0.9, 2.8, -0.9], [-0.15, 1.25, -0.5]],
  ];
  const addCurve = (a: Vector, b: Vector, c: Vector, count: number, radius: number, plant: number, color: Color) => {
    for (let i = 0; i < count; i++) segments.push({ a: curve(a, b, c, i / count), b: curve(a, b, c, (i + 1) / count), radius, plant, color });
  };
  stalks.forEach(([root, middle, crown, arch, tip], plant) => {
    addCurve(root, middle, crown, 24, 0.022, plant, [0.29, 0.43, 0.10, 1]);
    addCurve(crown, arch, tip, 24, 0.012, plant, [0.51, 0.56, 0.17, 1]);
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? 1 : -1;
      blades.push({ position: curve(root, middle, crown, 0.12 + i * 0.17), direction: [side * (0.23 + i * 0.06), 0.95, 0.13 + plant * 0.1], size: [0.13, 1.95 + seed(i + plant * 7) * 0.65, 0.55], plant });
    }
    for (let branch = 0; branch < 12; branch++) {
      const t = 0.12 + branch * 0.074;
      const anchor = curve(crown, arch, tip, t);
      const side = branch % 2 ? 1 : -1;
      const bend: Vector = [anchor[0] - 0.16, anchor[1] - 0.03, anchor[2] + side * 0.15];
      const end: Vector = [anchor[0] - 0.3 - seed(branch * 3 + plant) * 0.25, anchor[1] - 0.25 - seed(branch + plant * 5) * 0.38, anchor[2] + side * 0.26];
      addCurve(anchor, bend, end, 6, 0.006, plant, [0.49, 0.54, 0.19, 1]);
      for (let slot = 0; slot < 4; slot++) for (const grainSide of [-1, 1]) {
        const id = grains.length, point = curve(anchor, bend, end, 0.2 + slot * 0.24);
        const direction: Vector = [grainSide * 0.5 - 0.25, -0.72, side * 0.35];
        const axis = normalize(direction);
        grains.push({ position: [point[0] + axis[0] * 0.085, point[1] + axis[1] * 0.085, point[2] + axis[2] * 0.085], direction, size: [0.038 + seed(id) * 0.009, 0.105 + seed(id + 8) * 0.025, 0.033], color: [0.63 + seed(id + 3) * 0.2, 0.64 + seed(id + 5) * 0.12, 0.24 + seed(id + 2) * 0.12, 1], plant, release: id % 8 === 2 || id % 13 === 5, phase: seed(id + 91) * 10 });
      }
    }
  });
  return { segments, grains, blades };
}

function sway(point: Vector, plant: number, time: number): Vector {
  const height = Math.max(0, point[1] + 3);
  const wind = Math.sin(time * 0.62 + plant * 1.2) * 0.035 + Math.sin(time * 1.1 + plant) * 0.009;
  return [point[0] + wind * height ** 1.35, point[1] + wind * 0.1, point[2] + Math.cos(time * 0.44 + plant) * height * 0.015];
}

export function createHarvestRenderer(canvas: HTMLCanvasElement, sequence?: { once: boolean; onComplete: () => void }): HarvestRenderer | null {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Unable to create harvest shader');
    shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Unable to compile harvest shader');
    return shader;
  };
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    shaders.forEach((shader) => gl.deleteShader(shader)); gl.deleteProgram(program); return null;
  }
  const resources: { vao: WebGLVertexArrayObject; vertex: WebGLBuffer; index: WebGLBuffer; instance: WebGLBuffer; count: number }[] = [];
  const geometry = (mesh: Mesh) => {
    const vao = gl.createVertexArray(), vertex = gl.createBuffer(), index = gl.createBuffer(), instance = gl.createBuffer();
    if (!vao || !vertex || !index || !instance) throw new Error('Unable to allocate harvest geometry');
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex); gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, instance); gl.bufferData(gl.ARRAY_BUFFER, 1024 * 14 * 4, gl.DYNAMIC_DRAW);
    for (const [location, size, offset] of [[2, 3, 0], [3, 3, 12], [4, 4, 24], [5, 4, 40]]) {
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, 56, offset); gl.vertexAttribDivisor(location, 1);
    }
    const result = { vao, vertex, index, instance, count: mesh.indices.length };
    resources.push(result); return result;
  };
  const solid = geometry(sphere()), foliage = geometry(leaf()), stems = geometry(cylinder());
  const uniforms = { projection: gl.getUniformLocation(program, 'u_projection'), view: gl.getUniformLocation(program, 'u_view'), eye: gl.getUniformLocation(program, 'u_eye'), material: gl.getUniformLocation(program, 'u_material') };
  const model = plants(), data = new Float32Array(1024 * 14);
  let frame = 0, running = false, disposed = false, completed = false, elapsed = sequence?.once ? 0 : 2.7, lastTime = 0;
  let pointer: Vector = [0, 0, 0], smoothPointer: Vector = [0, 0, 0];
  const write = (offset: number, position: Vector, size: Vector, rotation: Rotation, color: Color) => {
    data.set(position, offset); data.set(size, offset + 3); data.set(rotation, offset + 6); data.set(color, offset + 10); return offset + 14;
  };
  const drawInstances = (mesh: typeof solid, offset: number, material: number) => {
    gl.bindVertexArray(mesh.vao); gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instance);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, offset));
    gl.uniform1i(uniforms.material, material); gl.drawElementsInstanced(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0, offset / 14);
  };
  const render = () => {
    if (disposed || gl.isContextLost()) return;
    const rect = canvas.getBoundingClientRect(), ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(rect.width * ratio)), height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(program);
    const aspect = width / height, f = 1 / Math.tan(35 * Math.PI / 360), near = 0.1, far = 40;
    gl.uniformMatrix4fv(uniforms.projection, false, new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]));
    smoothPointer = smoothPointer.map((value, i) => mix(value, pointer[i], 0.035)) as Vector;
    const eye: Vector = [smoothPointer[0] * 0.35, 0.05 + smoothPointer[1] * 0.2, Math.max(7.5, 2.7 * f / aspect)];
    const z = normalize(eye), x = normalize(cross([0, 1, 0], z)), y = cross(z, x);
    gl.uniformMatrix4fv(uniforms.view, false, new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]));
    gl.uniform3fv(uniforms.eye, eye);
    let offset = 0;
    for (const segment of model.segments) {
      const a = sway(segment.a, segment.plant, elapsed), b = sway(segment.b, segment.plant, elapsed), direction = subtract(b, a);
      offset = write(offset, a.map((value, i) => (value + b[i]) / 2) as Vector, [segment.radius, Math.hypot(...direction) / 2 + 0.007, segment.radius], align(direction), segment.color);
    }
    drawInstances(stems, offset, 0); offset = 0;
    for (const blade of model.blades) offset = write(offset, sway(blade.position, blade.plant, elapsed), blade.size, multiply(align(blade.direction), euler(0, Math.sin(elapsed * 0.6 + blade.plant) * 0.08, 0)), [0.18, 0.41, 0.075, 1]);
    drawInstances(foliage, offset, 1); offset = 0;
    let falling = 0;
    for (const grain of model.grains) {
      const phase = sequence?.once ? elapsed + 5 - grain.phase * .3 : (elapsed + grain.phase) % 10;
      let position = sway(grain.position, grain.plant, elapsed), rotation = align(grain.direction), size = grain.size, color = grain.color;
      if (grain.release && phase >= 6.2 && phase < 9.1) {
        const t = phase - 6.2, origin = sway(grain.position, grain.plant, elapsed - t);
        position = [origin[0] + Math.sin(grain.phase) * t * 0.23 + Math.sin(t * 2.2) * 0.05, origin[1] + 0.11 * t - 1.05 * t * t, origin[2] + t * 0.32];
        rotation = multiply(rotation, euler(t * (2 + grain.phase * 0.25), t * 1.9, t * Math.sin(grain.phase) * 2.7));
        const polish = Math.min(1, t * 1.7);
        color = [mix(grain.color[0], 0.97, polish), mix(grain.color[1], 0.91, polish), mix(grain.color[2], 0.72, polish), Math.min(1, (2.9 - t) * 2)];
        falling++;
      } else if (grain.release && phase >= 9.1) {
        const growth = sequence?.once ? .001 : Math.max(0.01, (phase - 9.1) / 0.9);
        size = grain.size.map((value) => value * growth) as Vector;
      }
      offset = write(offset, position, size, rotation, color);
    }
    drawInstances(solid, offset, 2);
    canvas.dataset.fallingGrains = String(falling);
    canvas.dataset.sceneTime = elapsed.toFixed(2);
  };
  const tick = (now: number) => {
    if (!running || disposed) return;
    if (lastTime) elapsed += Math.min((now - lastTime) / 1000, 0.05);
    if (sequence?.once) elapsed = Math.min(elapsed, HARVEST_INTRO_SECONDS);
    lastTime = now; render();
    if (sequence?.once && elapsed >= HARVEST_INTRO_SECONDS && !completed) {
      completed = true; running = false; sequence.onComplete(); return;
    }
    frame = window.requestAnimationFrame(tick);
  };
  const observer = new ResizeObserver(() => render()); observer.observe(canvas);
  render();
  return {
    setRunning(value) {
      if (running === value || disposed || completed) return;
      running = value; lastTime = 0;
      if (running) frame = window.requestAnimationFrame(tick);
      else { window.cancelAnimationFrame(frame); frame = 0; }
    },
    setPointer(x, y) { pointer = [x, y, 0]; },
    dispose() {
      disposed = true; running = false; window.cancelAnimationFrame(frame); observer.disconnect();
      resources.forEach(({ vao, vertex, index, instance }) => { gl.deleteVertexArray(vao); gl.deleteBuffer(vertex); gl.deleteBuffer(index); gl.deleteBuffer(instance); });
      shaders.forEach((shader) => gl.deleteShader(shader)); gl.deleteProgram(program);
    },
  };
}
