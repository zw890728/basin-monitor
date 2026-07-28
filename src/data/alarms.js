/** 数据层 —— 告警数据 */
export const alarms = [
  { id: "AL-01", stationId: "ST-03", pointName: "3号机组轴承温度", level: "urgent",    startAt: "09:20", status: "active" },
  { id: "AL-02", stationId: "ST-03", pointName: "3号机组振动",     level: "important", startAt: "09:25", status: "active" },
  { id: "AL-03", stationId: "ST-01", pointName: "1号机组油压",     level: "general",   startAt: "08:10", status: "active" },
  { id: "AL-04", stationId: "ST-04", pointName: "2号机组温升",     level: "important", startAt: "10:05", status: "recovered" },
  { id: "AL-05", stationId: "ST-05", pointName: "闸门开度反馈",     level: "general",   startAt: "07:40", status: "active" },
  { id: "AL-06", stationId: "ST-06", pointName: "厂用电切换",       level: "general",   startAt: "06:55", status: "recovered" },
  { id: "AL-07", stationId: "ST-02", pointName: "4号机组冷却水",   level: "important", startAt: "11:15", status: "recovered" },
  { id: "AL-08", stationId: "ST-05", pointName: "1号机组导叶",     level: "general",   startAt: "11:40", status: "active" }
];
