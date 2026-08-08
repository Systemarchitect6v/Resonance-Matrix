'use strict';

const AXES = [
  { key: 'vx',  label: 'X translation', unit: 'm/s' },
  { key: 'vy',  label: 'Y translation', unit: 'm/s' },
  { key: 'vz',  label: 'Z translation', unit: 'm/s' },
  { key: 'wx',  label: 'X angular rate (roll)', unit: 'rad/s' },
  { key: 'wy',  label: 'Y angular rate (pitch)', unit: 'rad/s' },
  { key: 'wz',  label: 'Z angular rate (yaw)', unit: 'rad/s' }
];

const DEFAULT_SCALES = [1, 1, 1, 0.1, 0.1, 0.1];
const DEFAULT_THETA = [1, 1, 1, 1, 1, 1];
const DEMO_V = [12.4, 0.8, -0.2, 0.03, 0.01, -0.05];
const DEMO_U = [12.0, 0.0, 0.0, 0.00, 0.00, 0.00];

let selectedDomain = 'General Navigation / Tracking';
let lastSingleResult = null;
let lastBatchResult = null;

const $ = (id) => document.getElementById(id);

function finiteNumber(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${label} must be a finite number.`);
  return n;
}

function positiveNumber(value, label) {
  const n = finiteNumber(value, label);
  if (!(n > 0)) throw new Error(`${label} must be greater than zero.`);
  return n;
}

function dot(a, b) {
  return a.reduce((sum, x, i) => sum + x * b[i], 0);
}

function norm(a) {
  return Math.sqrt(dot(a, a));
}

function computeSixVector(V, U, scales, theta0, options = {}) {
  if (![V, U, scales, theta0].every(v => Array.isArray(v) && v.length === 6)) {
    throw new Error('V, U, scales, and theta0 must each contain exactly six values.');
  }
  V.forEach((v, i) => finiteNumber(v, `V[${i}]`));
  U.forEach((v, i) => finiteNumber(v, `U[${i}]`));
  scales.forEach((v, i) => positiveNumber(v, `scale[${i}]`));
  theta0.forEach((v, i) => finiteNumber(v, `theta0[${i}]`));

  const epsilon = options.epsilon ?? 1e-12;
  const deltaThreshold = options.deltaThreshold ?? 1e-10;
  const useProjection = options.useProjection ?? true;
  const gains = options.gains ?? [0, 0, 0, 0, 0, 0];

  const deltaV = V.map((v, i) => v - U[i]);
  const delta = deltaV.map((v, i) => v / scales[i]);
  const G = norm(delta);
  const R0 = dot(delta, theta0);

  let theta = [...theta0];
  let projectionApplied = false;

  if (useProjection && G >= deltaThreshold) {
    const denom = dot(delta, delta) + epsilon;
    const factor = dot(delta, theta0) / denom;
    theta = theta0.map((t, i) => t - delta[i] * factor);
    projectionApplied = true;
  }

  const e = delta.map((v, i) => v * theta[i]);
  const R = e.reduce((sum, v) => sum + v, 0);
  const E = norm(e);

  const correction = e.map((value, i) => -gains[i] * value);
  const Sresolved = U.map((value, i) => value + scales[i] * correction[i]);

  return {
    V: [...V],
    U: [...U],
    scales: [...scales],
    theta0: [...theta0],
    deltaV,
    delta,
    theta,
    e,
    R0,
    R,
    E,
    G,
    correction,
    Sresolved,
    epsilon,
    deltaThreshold,
    projectionApplied
  };
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 1e5 || abs < 1e-5) return value.toExponential(6);
  return value.toFixed(8).replace(/\.?0+$/, '');
}

function buildInputRows() {
  const tbody = $('inputRows');
  tbody.innerHTML = '';
  AXES.forEach((axis, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${axis.label}</td>
      <td><input class="v-input" data-i="${i}" type="number" step="any" aria-label="${axis.label} V"></td>
      <td><input class="u-input" data-i="${i}" type="number" step="any" aria-label="${axis.label} U"></td>
      <td><input class="scale-input" data-i="${i}" type="number" step="any" min="1e-15" value="${DEFAULT_SCALES[i]}" aria-label="${axis.label} normalization scale"></td>
      <td><input class="theta-input" data-i="${i}" type="number" step="any" value="${DEFAULT_THETA[i]}" aria-label="${axis.label} theta zero"></td>
      <td>${axis.unit}</td>`;
    tbody.appendChild(tr);
  });

  $('gainInputs').innerHTML = AXES.map((axis, i) => `
    <label><span>K${i + 1} · ${axis.key}</span><input class="gain-input" data-i="${i}" type="number" step="any" value="0"></label>
  `).join('');

  $('batchThetaInputs').innerHTML = AXES.map((axis, i) => `
    <label><span>θ₀ ${axis.key}</span><input class="batch-theta" data-i="${i}" type="number" step="any" value="1"></label>
  `).join('');
}

function readIndexed(className, label, positive = false) {
  const nodes = [...document.querySelectorAll(`.${className}`)].sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i));
  return nodes.map((node, i) => positive ? positiveNumber(node.value, `${label}[${i}]`) : finiteNumber(node.value, `${label}[${i}]`));
}

function setIndexed(className, values) {
  [...document.querySelectorAll(`.${className}`)].forEach(node => {
    node.value = values[Number(node.dataset.i)];
  });
}

function loadDemo() {
  setIndexed('v-input', DEMO_V);
  setIndexed('u-input', DEMO_U);
  setIndexed('scale-input', DEFAULT_SCALES);
  setIndexed('theta-input', DEFAULT_THETA);
  setIndexed('gain-input', [0, 0, 0, 0, 0, 0]);
  $('epsilon').value = '1e-12';
  $('deltaThreshold').value = '1e-10';
  $('useProjection').checked = true;
  $('enableCorrection').checked = false;
  $('singleError').hidden = true;
}

function clearSingle() {
  setIndexed('v-input', ['', '', '', '', '', '']);
  setIndexed('u-input', ['', '', '', '', '', '']);
  $('singleResults').hidden = true;
  $('singleError').hidden = true;
  lastSingleResult = null;
}

function getMetadata() {
  return {
    domain: selectedDomain,
    testName: $('testName').value.trim(),
    frame: $('frame').value,
    timestamp: $('timestamp').value.trim(),
    generatedAt: new Date().toISOString()
  };
}

function runSingle() {
  try {
    $('singleError').hidden = true;
    const V = readIndexed('v-input', 'V');
    const U = readIndexed('u-input', 'U');
    const scales = readIndexed('scale-input', 'scale', true);
    const theta0 = readIndexed('theta-input', 'theta0');
    const epsilon = finiteNumber($('epsilon').value, 'epsilon');
    const deltaThreshold = finiteNumber($('deltaThreshold').value, 'deltaThreshold');
    if (epsilon < 0 || deltaThreshold < 0) throw new Error('epsilon and deltaThreshold cannot be negative.');

    const gains = $('enableCorrection').checked
      ? readIndexed('gain-input', 'gain')
      : [0, 0, 0, 0, 0, 0];

    const result = computeSixVector(V, U, scales, theta0, {
      epsilon,
      deltaThreshold,
      useProjection: $('useProjection').checked,
      gains
    });

    lastSingleResult = { metadata: getMetadata(), result };
    renderSingle(result);
  } catch (err) {
    $('singleError').textContent = err.message;
    $('singleError').hidden = false;
    $('singleResults').hidden = true;
  }
}

function renderSingle(result) {
  $('metricR0').textContent = formatNumber(result.R0);
  $('metricR').textContent = formatNumber(result.R);
  $('metricE').textContent = formatNumber(result.E);
  $('metricG').textContent = formatNumber(result.G);

  $('resultRows').innerHTML = AXES.map((axis, i) => `
    <tr>
      <td>${axis.label}</td>
      <td>${formatNumber(result.deltaV[i])}</td>
      <td>${formatNumber(result.delta[i])}</td>
      <td>${formatNumber(result.theta0[i])}</td>
      <td>${formatNumber(result.theta[i])}</td>
      <td>${formatNumber(result.e[i])}</td>
      <td>${formatNumber(result.correction[i])}</td>
      <td>${formatNumber(result.Sresolved[i])}</td>
    </tr>
  `).join('');
  $('singleResults').hidden = false;
  $('singleResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadBlob(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copySingleJson() {
  if (!lastSingleResult) return;
  const text = JSON.stringify(lastSingleResult, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    $('copyJson').textContent = 'Copied';
    setTimeout(() => $('copyJson').textContent = 'Copy JSON', 1200);
  } catch {
    downloadBlob('six-vector-result.json', text);
  }
}

function downloadSingleJson() {
  if (!lastSingleResult) return;
  downloadBlob('six-vector-result.json', JSON.stringify(lastSingleResult, null, 2));
}

/* Minimal CSV parser supporting quoted fields and doubled quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else {
      if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(field.trim()); field = ''; }
      else if (ch === '\n') {
        row.push(field.trim()); field = '';
        if (row.some(v => v !== '')) rows.push(row);
        row = [];
      } else if (ch !== '\r') field += ch;
    }
  }
  row.push(field.trim());
  if (row.some(v => v !== '')) rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/[\s\-]+/g, '_');
}

const HEADER_ALIASES = {
  time: ['time', 'timestamp', 't', 'sample'],
  vx: ['vx', 'v_x', 'obs_vx', 'observed_vx'],
  vy: ['vy', 'v_y', 'obs_vy', 'observed_vy'],
  vz: ['vz', 'v_z', 'obs_vz', 'observed_vz'],
  wx: ['wx', 'omega_x', 'roll_rate', 'rollrate'],
  wy: ['wy', 'omega_y', 'pitch_rate', 'pitchrate'],
  wz: ['wz', 'omega_z', 'yaw_rate', 'yawrate'],
  ux: ['ux', 'u_x', 'cmd_vx', 'command_vx'],
  uy: ['uy', 'u_y', 'cmd_vy', 'command_vy'],
  uz: ['uz', 'u_z', 'cmd_vz', 'command_vz'],
  uwx: ['uwx', 'u_wx', 'cmd_wx', 'cmd_roll', 'cmd_roll_rate'],
  uwy: ['uwy', 'u_wy', 'cmd_wy', 'cmd_pitch', 'cmd_pitch_rate'],
  uwz: ['uwz', 'u_wz', 'cmd_wz', 'cmd_yaw', 'cmd_yaw_rate']
};

function resolveHeaders(headers) {
  const normalized = headers.map(normalizeHeader);
  const map = {};
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = normalized.findIndex(h => aliases.includes(h));
    if (idx >= 0) map[canonical] = idx;
  }
  const required = ['vx','vy','vz','wx','wy','wz','ux','uy','uz','uwx','uwy','uwz'];
  const missing = required.filter(k => map[k] === undefined);
  if (missing.length) throw new Error(`CSV is missing required columns: ${missing.join(', ')}`);
  return map;
}

function csvNumber(row, idx, name, rowNumber) {
  if (idx === undefined) return '';
  const n = Number(row[idx]);
  if (!Number.isFinite(n)) throw new Error(`Row ${rowNumber}: ${name} is not a finite number.`);
  return n;
}

function sampleCsv() {
  return `time,vx,vy,vz,wx,wy,wz,ux,uy,uz,uwx,uwy,uwz
0.00,12.00,0.00,0.00,0.000,0.000,0.000,12.00,0.00,0.00,0.000,0.000,0.000
0.10,12.08,0.10,-0.01,0.006,0.002,-0.004,12.00,0.00,0.00,0.000,0.000,0.000
0.20,12.18,0.25,-0.03,0.012,0.004,-0.010,12.00,0.00,0.00,0.000,0.000,0.000
0.30,12.30,0.45,-0.07,0.020,0.006,-0.019,12.00,0.00,0.00,0.000,0.000,0.000
0.40,12.42,0.70,-0.12,0.029,0.009,-0.031,12.00,0.00,0.00,0.000,0.000,0.000
0.50,12.50,0.90,-0.18,0.038,0.012,-0.044,12.00,0.00,0.00,0.000,0.000,0.000
0.60,12.43,0.75,-0.13,0.031,0.010,-0.035,12.00,0.00,0.00,0.000,0.000,0.000
0.70,12.29,0.50,-0.08,0.022,0.007,-0.023,12.00,0.00,0.00,0.000,0.000,0.000
0.80,12.16,0.28,-0.04,0.014,0.004,-0.012,12.00,0.00,0.00,0.000,0.000,0.000
0.90,12.06,0.10,-0.01,0.005,0.001,-0.004,12.00,0.00,0.00,0.000,0.000,0.000`;
}

function runBatch() {
  try {
    $('batchError').hidden = true;
    const text = $('csvPaste').value.trim();
    if (!text) throw new Error('Paste or upload CSV telemetry first.');

    const rows = parseCsv(text);
    if (rows.length < 2) throw new Error('CSV must contain a header and at least one data row.');

    const headerMap = resolveHeaders(rows[0]);
    const scales = readIndexed('batch-scale', 'batch scale', true);
    const theta0 = readIndexed('batch-theta', 'batch theta0');
    const epsilon = finiteNumber($('epsilon').value, 'epsilon');
    const deltaThreshold = finiteNumber($('deltaThreshold').value, 'deltaThreshold');
    const useProjection = $('useProjection').checked;

    const results = rows.slice(1).map((row, rowIdx) => {
      const rowNumber = rowIdx + 2;
      const V = [
        csvNumber(row, headerMap.vx, 'vx', rowNumber),
        csvNumber(row, headerMap.vy, 'vy', rowNumber),
        csvNumber(row, headerMap.vz, 'vz', rowNumber),
        csvNumber(row, headerMap.wx, 'wx', rowNumber),
        csvNumber(row, headerMap.wy, 'wy', rowNumber),
        csvNumber(row, headerMap.wz, 'wz', rowNumber)
      ];
      const U = [
        csvNumber(row, headerMap.ux, 'ux', rowNumber),
        csvNumber(row, headerMap.uy, 'uy', rowNumber),
        csvNumber(row, headerMap.uz, 'uz', rowNumber),
        csvNumber(row, headerMap.uwx, 'uwx', rowNumber),
        csvNumber(row, headerMap.uwy, 'uwy', rowNumber),
        csvNumber(row, headerMap.uwz, 'uwz', rowNumber)
      ];
      const time = headerMap.time === undefined ? String(rowIdx) : row[headerMap.time];
      return { time, ...computeSixVector(V, U, scales, theta0, { epsilon, deltaThreshold, useProjection }) };
    });

    lastBatchResult = { metadata: getMetadata(), scales, theta0, results };
    renderBatch(results);
    $('downloadBatch').disabled = false;
  } catch (err) {
    $('batchError').textContent = err.message;
    $('batchError').hidden = false;
    $('batchResults').hidden = true;
    $('downloadBatch').disabled = true;
  }
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function renderBatch(results) {
  const gs = results.map(r => r.G);
  const es = results.map(r => r.E);
  $('batchCount').textContent = results.length;
  $('batchMeanG').textContent = formatNumber(mean(gs));
  $('batchMaxG').textContent = formatNumber(Math.max(...gs));
  $('batchMeanE').textContent = formatNumber(mean(es));

  $('batchRows').innerHTML = results.slice(0, 200).map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(String(r.time))}</td>
      <td>${formatNumber(r.R0)}</td>
      <td>${formatNumber(r.R)}</td>
      <td>${formatNumber(r.E)}</td>
      <td>${formatNumber(r.G)}</td>
    </tr>`).join('');

  drawChart(results);
  $('batchResults').hidden = false;
  $('batchResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function drawChart(results) {
  const canvas = $('batchChart');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#07131c';
  ctx.fillRect(0, 0, w, h);

  const pad = 42;
  const all = results.flatMap(r => [r.G, r.E]);
  const maxY = Math.max(...all, 1e-12);

  ctx.strokeStyle = '#263746';
  ctx.lineWidth = 1;
  for (let j = 0; j <= 4; j++) {
    const y = pad + (h - 2 * pad) * j / 4;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
  }

  function plot(values, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    values.forEach((value, i) => {
      const x = results.length === 1 ? pad : pad + (w - 2 * pad) * i / (results.length - 1);
      const y = h - pad - (h - 2 * pad) * value / maxY;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  plot(results.map(r => r.G), '#54d2c8');
  plot(results.map(r => r.E), '#80aaff');

  ctx.fillStyle = '#9bb0c1';
  ctx.font = '18px ui-monospace, monospace';
  ctx.fillText(`0`, 10, h - pad + 6);
  ctx.fillText(formatNumber(maxY), 8, pad + 6);
}

function batchToCsv(batch) {
  const header = [
    'time','R0','R','E','G',
    ...AXES.map(a => `deltaV_${a.key}`),
    ...AXES.map(a => `delta_${a.key}`),
    ...AXES.map(a => `theta_${a.key}`),
    ...AXES.map(a => `e_${a.key}`)
  ];
  const lines = [header.join(',')];
  batch.results.forEach(r => {
    const cells = [
      csvEscape(String(r.time)), r.R0, r.R, r.E, r.G,
      ...r.deltaV, ...r.delta, ...r.theta, ...r.e
    ];
    lines.push(cells.join(','));
  });
  return lines.join('\n');
}

function csvEscape(value) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function switchMode(mode) {
  const single = mode === 'single';
  $('singleMode').hidden = !single;
  $('batchMode').hidden = single;
  $('singleTab').classList.toggle('active', single);
  $('batchTab').classList.toggle('active', !single);
  $('singleTab').setAttribute('aria-selected', String(single));
  $('batchTab').setAttribute('aria-selected', String(!single));
}

function bindEvents() {
  document.querySelectorAll('.domain-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.domain-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDomain = btn.dataset.domain;
    });
  });

  $('singleTab').addEventListener('click', () => switchMode('single'));
  $('batchTab').addEventListener('click', () => switchMode('batch'));
  $('loadDemo').addEventListener('click', loadDemo);
  $('runSingle').addEventListener('click', runSingle);
  $('clearSingle').addEventListener('click', clearSingle);
  $('copyJson').addEventListener('click', copySingleJson);
  $('downloadJson').addEventListener('click', downloadSingleJson);
  $('loadSampleCsv').addEventListener('click', () => { $('csvPaste').value = sampleCsv(); });
  $('runBatch').addEventListener('click', runBatch);
  $('downloadBatch').addEventListener('click', () => {
    if (lastBatchResult) downloadBlob('six-vector-batch-results.csv', batchToCsv(lastBatchResult), 'text/csv');
  });
  $('enableCorrection').addEventListener('change', () => {
    $('correctionDetails').open = $('enableCorrection').checked;
  });
  $('csvFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    $('csvPaste').value = await file.text();
  });
}

buildInputRows();
bindEvents();
loadDemo();
