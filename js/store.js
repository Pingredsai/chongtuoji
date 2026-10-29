import { addDaysISO, todayISO, uid } from './utils.js';

export const STORAGE_KEY = 'chongtuoji.state.v1';
export const APP_VERSION = 1;

export function defaultState() {
  return {
    version: APP_VERSION,
    profile: {
      sitterName: '',
      businessName: '',
      phone: ''
    },
    orders: [],
    settings: {
      lastBackupAt: null
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function normalizeState(input) {
  const fallback = defaultState();
  if (!input || typeof input !== 'object') return fallback;
  const state = {
    ...fallback,
    ...input,
    profile: { ...fallback.profile, ...(input.profile || {}) },
    settings: { ...fallback.settings, ...(input.settings || {}) },
    orders: Array.isArray(input.orders) ? input.orders : []
  };
  state.version = APP_VERSION;
  state.orders = state.orders.map((order) => ({
    id: order.id || uid('order'),
    status: order.status || 'active',
    serviceType: order.serviceType || '上门喂养',
    visitTime: order.visitTime || '09:00',
    startDate: order.startDate || todayISO(),
    endDate: order.endDate || order.startDate || todayISO(),
    pet: {
      name: '',
      species: 'cat',
      breed: '',
      age: '',
      weight: '',
      photo: '',
      ...(order.pet || {})
    },
    owner: {
      name: '',
      phone: '',
      address: '',
      emergencyName: '',
      emergencyPhone: '',
      ...(order.owner || {})
    },
    care: {
      feeding: '',
      water: '',
      litter: '',
      medication: '',
      behavior: '',
      access: '',
      restrictions: '',
      ...(order.care || {})
    },
    notes: order.notes || '',
    reports: Array.isArray(order.reports) ? order.reports : [],
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString()
  }));
  return state;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.error('Failed to load local state', error);
    return defaultState();
  }
}

export function saveState(state) {
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      throw new Error('本机存储空间已满，请先导出备份并删除旧照片或旧服务单');
    }
    throw error;
  }
}

export function emptyOrder() {
  const start = todayISO();
  return {
    id: uid('order'),
    status: 'active',
    serviceType: '上门喂养',
    visitTime: '09:00',
    startDate: start,
    endDate: addDaysISO(start, 2),
    pet: { name: '', species: 'cat', breed: '', age: '', weight: '', photo: '' },
    owner: { name: '', phone: '', address: '', emergencyName: '', emergencyPhone: '' },
    care: { feeding: '', water: '', litter: '', medication: '', behavior: '', access: '', restrictions: '' },
    notes: '',
    reports: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function addOrder(state, payload) {
  const now = new Date().toISOString();
  const order = normalizeState({ orders: [{ ...payload, createdAt: now, updatedAt: now }] }).orders[0];
  state.orders.unshift(order);
  saveState(state);
  return order;
}

export function updateOrder(state, orderId, payload) {
  const index = state.orders.findIndex((order) => order.id === orderId);
  if (index < 0) throw new Error('服务单不存在');
  const current = state.orders[index];
  const updated = normalizeState({
    orders: [{
      ...current,
      ...payload,
      pet: { ...current.pet, ...(payload.pet || {}) },
      owner: { ...current.owner, ...(payload.owner || {}) },
      care: { ...current.care, ...(payload.care || {}) },
      updatedAt: new Date().toISOString()
    }]
  }).orders[0];
  state.orders[index] = updated;
  saveState(state);
  return updated;
}

export function deleteOrder(state, orderId) {
  state.orders = state.orders.filter((order) => order.id !== orderId);
  saveState(state);
}

export function setOrderStatus(state, orderId, status) {
  return updateOrder(state, orderId, { status });
}

export function addReport(state, orderId, report) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) throw new Error('服务单不存在');
  const clean = {
    id: uid('report'),
    date: report.date || todayISO(),
    arrivalTime: report.arrivalTime || '',
    meal: report.meal || '吃完',
    water: report.water || '已换水',
    litter: report.litter || '正常',
    medication: report.medication || '不需要',
    mood: report.mood || '精神很好',
    note: String(report.note || '').trim(),
    photos: Array.isArray(report.photos) ? report.photos.slice(0, 3) : [],
    createdAt: new Date().toISOString()
  };
  order.reports.unshift(clean);
  order.reports.sort((a, b) => `${b.date}T${b.arrivalTime || '00:00'}`.localeCompare(`${a.date}T${a.arrivalTime || '00:00'}`));
  order.updatedAt = new Date().toISOString();
  saveState(state);
  return clean;
}

export function deleteReport(state, orderId, reportId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.reports = order.reports.filter((report) => report.id !== reportId);
  order.updatedAt = new Date().toISOString();
  saveState(state);
}

export function updateProfile(state, profile) {
  state.profile = { ...state.profile, ...profile };
  saveState(state);
  return state.profile;
}

export function recordBackup(state) {
  state.settings.lastBackupAt = new Date().toISOString();
  saveState(state);
}

export function importState(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.orders)) {
    throw new Error('备份文件格式不正确');
  }
  return normalizeState(parsed);
}

export function replaceState(state) {
  saveState(state);
  return state;
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function demoState() {
  const state = defaultState();
  const today = todayISO();
  state.profile = {
    sitterName: '小满',
    businessName: '小满上门宠托',
    phone: '138 0000 0000'
  };
  state.orders = [
    {
      id: uid('order'),
      status: 'active',
      serviceType: '上门喂养',
      visitTime: '18:30',
      startDate: addDaysISO(today, -1),
      endDate: addDaysISO(today, 3),
      pet: { name: '团团', species: 'cat', breed: '中华田园猫', age: '3 岁', weight: '4.8 kg', photo: 'assets/pets/cat-tuantuan.jpg' },
      owner: {
        name: '林女士',
        phone: '138 0000 1234',
        address: '示例地址 · 阳光花园 2 栋',
        emergencyName: '林先生',
        emergencyPhone: '139 0000 5678'
      },
      care: {
        feeding: '每天早晚各 1 次。干粮 35g，罐头半罐，分开喂。',
        water: '每次上门更换饮用水，并清洗水碗。',
        litter: '早晚各铲一次，观察尿团和排便。',
        medication: '每天 20:00 喂半片护肝药，拌在少量猫条里。',
        behavior: '怕生，不要强行抱。开门前先确认猫在房间内。',
        access: '门口密码盒，密码见面时已告知。',
        restrictions: '不喂零食，不接触百合花。',
      },
      notes: '主人希望每次服务后发 2-3 张照片和一条日报。',
      reports: [
        {
          id: uid('report'),
          date: addDaysISO(today, -1),
          arrivalTime: '18:30',
          meal: '吃完',
          water: '已换水',
          litter: '正常',
          medication: '按时完成',
          mood: '精神很好',
          note: '团团今天很配合，猫粮吃完了，饮水正常。猫砂盆清理一次，尿团 2 个。',
          photos: [],
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uid('order'),
      status: 'active',
      serviceType: '家庭寄养',
      visitTime: '09:00',
      startDate: addDaysISO(today, 2),
      endDate: addDaysISO(today, 7),
      pet: { name: '豆包', species: 'dog', breed: '金毛', age: '2 岁', weight: '11.2 kg', photo: 'assets/pets/dog-doubao.jpg' },
      owner: {
        name: '陈先生',
        phone: '136 0000 4321',
        address: '示例地址 · 星河湾 6 栋',
        emergencyName: '陈女士',
        emergencyPhone: '135 0000 8765'
      },
      care: {
        feeding: '每天两顿，每顿 90g 犬粮。',
        water: '全天保持饮水充足。',
        litter: '早晚各遛一次，每次 20 分钟。',
        medication: '不需要。',
        behavior: '亲人，但看到电动车会追，必须牵绳。',
        access: '主人交接钥匙。',
        restrictions: '不吃鸡骨头，不喂人食。'
      },
      notes: '',
      reports: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uid('order'),
      status: 'completed',
      serviceType: '上门喂养',
      visitTime: '19:10',
      startDate: addDaysISO(today, -8),
      endDate: addDaysISO(today, -5),
      pet: { name: '奶盖', species: 'cat', breed: '中华田园猫', age: '5 岁', weight: '5.4 kg', photo: 'assets/pets/cat-naigai.jpg' },
      owner: {
        name: '周女士',
        phone: '137 0000 2468',
        address: '示例地址 · 梧桐里 1 栋',
        emergencyName: '周先生',
        emergencyPhone: '136 0000 1357'
      },
      care: {
        feeding: '每天一顿湿粮 85g，干粮自助。',
        water: '每天换水。',
        litter: '每天铲屎一次。',
        medication: '不需要。',
        behavior: '胆小，听到门铃会躲起来。',
        access: '门锁密码由主人提供。',
        restrictions: '只喝过滤水。'
      },
      notes: '服务结束已交接。',
      reports: [
        { id: uid('report'), date: addDaysISO(today, -8), arrivalTime: '19:10', meal: '吃完', water: '已换水', litter: '正常', medication: '不需要', mood: '有点紧张', note: '奶盖一开始躲在沙发下，后来出来吃饭。', photos: [], createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
        { id: uid('report'), date: addDaysISO(today, -7), arrivalTime: '19:00', meal: '吃完', water: '已换水', litter: '正常', medication: '不需要', mood: '正常', note: '今天主动迎接，湿粮吃完，饮水正常。', photos: [], createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
        { id: uid('report'), date: addDaysISO(today, -6), arrivalTime: '18:50', meal: '吃完', water: '已换水', litter: '正常', medication: '不需要', mood: '精神很好', note: '状态稳定，猫砂盆清理完毕。', photos: [], createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
        { id: uid('report'), date: addDaysISO(today, -5), arrivalTime: '19:20', meal: '吃完', water: '已换水', litter: '正常', medication: '不需要', mood: '精神很好', note: '最后一次服务完成，已和主人完成交接。', photos: [], createdAt: new Date(Date.now() - 5 * 86400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  return state;
}

export function stateStats(state) {
  const today = todayISO();
  const active = state.orders.filter((order) => order.status !== 'completed');
  const pendingToday = state.orders.filter((order) => {
    if (order.status === 'completed') return false;
    if (order.startDate > today || order.endDate < today) return false;
    return !(order.reports || []).some((report) => report.date === today);
  });
  const totalReports = state.orders.reduce((sum, order) => sum + (order.reports?.length || 0), 0);
  return {
    activeCount: active.length,
    pendingTodayCount: pendingToday.length,
    totalReports,
    completedCount: state.orders.filter((order) => order.status === 'completed').length
  };
}