/**
 * 规则层 —— 纯函数，不依赖 DOM
 */
import { alarms } from '../data/index.js';
import { CONFIG } from '../config.js';

/** 获取某电站 active 的告警列表 */
export function getActiveAlarmsByStation(stationId) {
  return alarms.filter(a => a.stationId === stationId && a.status === 'active');
}

/**
 * 判定单站状态（短路判定）
 * 告警(红) → 关注(橙) → 正常(绿)
 */
export function getStationStatus(station) {
  if (!station) return 'normal';
  const active = getActiveAlarmsByStation(station.id);

  const hasUrgent = active.some(a => a.level === 'urgent');
  if (hasUrgent) return 'alarm';

  const hasImportant = active.some(a => a.level === 'important');
  const loadRate = station.currentOutputMW / station.capacityMW;
  if (hasImportant || loadRate < CONFIG.ATTENTION_LOAD_THRESHOLD) return 'attention';

  return 'normal';
}

/** 状态 → 中文名 */
export function statusLabel(s) {
  return s === 'alarm' ? '告警' : s === 'attention' ? '关注' : '正常';
}

/** 状态 → 颜色值 */
export function statusColor(s) {
  return s === 'alarm' ? '#DC2626' : s === 'attention' ? '#F59E0B' : '#16A34A';
}

/** 告警等级 → 中文标签 */
export function levelLabel(level) {
  return level === 'urgent' ? '紧急' : level === 'important' ? '重要' : '一般';
}

/** 按流域筛选电站 */
export function filterStationsByBasin(stations, basin) {
  if (basin === '全部') return stations;
  return stations.filter(s => s.basin === basin);
}

/** 计算汇总指标 */
export function calcMetrics(stationList) {
  let totalCap = 0;
  let totalOut = 0;
  for (const s of stationList) {
    totalCap += s.capacityMW;
    totalOut += s.currentOutputMW;
  }
  const loadRate = totalCap > 0 ? totalOut / totalCap : 0;
  return { totalCapacity: totalCap, totalOutput: totalOut, loadRate };
}

/** 千分位格式 */
export function formatNumber(n) {
  return n.toLocaleString('zh-CN');
}

/** 获取电站名称 */
export function getStationName(stationId, stations) {
  const s = stations.find(s => s.id === stationId);
  return s ? s.name : stationId;
}
