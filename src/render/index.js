/**
 * 渲染层 —— 视图渲染 + 交互事件
 */
import { stations, alarms } from '../data/index.js';
import { CONFIG } from '../config.js';
import {
  getStationStatus,
  statusLabel,
  statusColor,
  levelLabel,
  filterStationsByBasin,
  calcMetrics,
  formatNumber,
  getStationName
} from '../rules/index.js';

/* ---- 状态 ---- */
let currentBasin = '全部';
let selectedStationId = null;

/* ---- DOM 引用 ---- */
const metricsEl  = document.getElementById('metrics');
const filterEl   = document.getElementById('basinFilter');
const gridEl     = document.getElementById('stationGrid');
const alarmBody  = document.getElementById('alarmBody');
const alarmEmpty = document.getElementById('alarmEmpty');

/* ---- 初始化筛选下拉 ---- */
function initFilter() {
  const basinSet = new Set(stations.map(s => s.basin));
  const basins = ['全部', ...basinSet];

  filterEl.innerHTML = basins.map(b => `<option value="${b}">${b}</option>`).join('');

  filterEl.addEventListener('change', () => {
    currentBasin = filterEl.value;
    // 若选中电站不在新筛选范围内，清空选中
    if (selectedStationId) {
      const list = filterStationsByBasin(stations, currentBasin);
      if (!list.some(s => s.id === selectedStationId)) {
        selectedStationId = null;
      }
    }
    render();
  });
}

/* ---- 渲染汇总指标 ---- */
function renderMetrics(stationList) {
  const m = calcMetrics(stationList);
  metricsEl.innerHTML = `
    <div class="metric-card">
      <div class="label">总装机容量</div>
      <div class="value">${formatNumber(m.totalCapacity)}<span class="unit">MW</span></div>
    </div>
    <div class="metric-card">
      <div class="label">当前总出力</div>
      <div class="value">${formatNumber(m.totalOutput)}<span class="unit">MW</span></div>
    </div>
    <div class="metric-card">
      <div class="label">负荷率</div>
      <div class="value">${(m.loadRate * 100).toFixed(1)}<span class="unit">%</span></div>
    </div>`;
}

/* ---- 渲染电站卡片 ---- */
function renderCards(stationList) {
  if (stationList.length === 0) {
    gridEl.innerHTML = '<div class="empty-state">当前条件下没有匹配的电站</div>';
    return;
  }

  gridEl.innerHTML = stationList.map(s => {
    const status = getStationStatus(s);
    const loadRate = s.capacityMW > 0 ? s.currentOutputMW / s.capacityMW : 0;
    const selClass = selectedStationId === s.id ? ' selected' : '';
    return `
      <div class="station-card status-${status}${selClass}" data-id="${s.id}">
        <div class="status-badge"><span class="dot"></span>${statusLabel(status)}</div>
        <div class="station-name">${s.name}</div>
        <div class="basin-tag">${s.basin}段</div>
        <div class="output-row">
          <span class="num">${formatNumber(s.currentOutputMW)}</span>
          <span class="unit">/ ${formatNumber(s.capacityMW)} MW</span>
        </div>
        <div class="load-rate" style="color:${statusColor(status)}">${(loadRate * 100).toFixed(1)}%</div>
        <div class="load-bar">
          <div class="fill" style="width:${loadRate * 100}%;background:${statusColor(status)}"></div>
        </div>
      </div>`;
  }).join('');

  // 卡片点击事件
  for (const card of gridEl.children) {
    if (card.classList.contains('empty-state')) continue;
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      selectedStationId = selectedStationId === id ? null : id;
      renderAlarms();
      renderCards(filterStationsByBasin(stations, currentBasin));
    });
  }
}

/* ---- 渲染告警列表 ---- */
function renderAlarms() {
  let list = alarms.slice();
  if (selectedStationId) {
    list = list.filter(a => a.stationId === selectedStationId);
  }
  // 排序：active 在前 → 按时间
  list.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return a.startAt.localeCompare(b.startAt);
  });

  if (list.length === 0) {
    alarmBody.innerHTML = '';
    alarmEmpty.style.display = 'block';
    return;
  }
  alarmEmpty.style.display = 'none';

  alarmBody.innerHTML = list.map(a => {
    const name = getStationName(a.stationId, stations);
    const recoveredClass = a.status === 'recovered' ? ' recovered' : '';
    return `
      <tr class="${recoveredClass}">
        <td><span class="level-tag ${a.level}">${levelLabel(a.level)}</span></td>
        <td>${name}</td>
        <td>${a.pointName}</td>
        <td>${a.startAt}</td>
      </tr>`;
  }).join('');
}

/* ---- 全量渲染 ---- */
function render() {
  const filtered = filterStationsByBasin(stations, currentBasin);
  renderMetrics(filtered);
  renderCards(filtered);
  renderAlarms();
}

/* ---- 导出 ---- */
export { initFilter, render };
export function getCurrentBasin() { return currentBasin; }
export function getSelectedStationId() { return selectedStationId; }
