const ICONS = {
  home: '<path d="M3 10.8 12 3l9 7.8"/><path d="M5.3 9.5V21h13.4V9.5"/><path d="M9.3 21v-6.8h5.4V21"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.2V3h6v1.2M9 9h6M9 13h6M9 17h4"/>',
  settings: '<path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.87 2.87-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.36 1.07V21H9.6v-.1a1.7 1.7 0 0 0-1.05-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06L3.74 16.9l.06-.06A1.7 1.7 0 0 0 4.14 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.07-.36H2.4V9.6h.1A1.7 1.7 0 0 0 4.05 8.55a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.52 3.74l.06.06A1.7 1.7 0 0 0 8.45 4.14a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 9.8 2.47V2.4h4.04v.1a1.7 1.7 0 0 0 1.05 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.87 2.87-.06.06A1.7 1.7 0 0 0 19.4 8.45a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.07.36h.1v4.04h-.1A1.7 1.7 0 0 0 19.4 15Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowLeft: '<path d="m15 18-6-6 6-6"/>',
  arrowRight: '<path d="m9 18 6-6-6-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mapPin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.45 2.1L9 10.7a16 16 0 0 0 4.3 4.3l1.3-1.3a2 2 0 0 1 2.1-.45c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.05Z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z"/><circle cx="12" cy="13" r="4"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 17V5M7 10l5-5 5 5M5 21h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 10v7M14 10v7"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  paw: '<path d="M12 13.4c-3 0-6 2.5-6 5.2 0 1.9 1.3 3.4 3.1 3.4 1.1 0 1.9-.4 2.9-.4s1.8.4 2.9.4c1.8 0 3.1-1.5 3.1-3.4 0-2.7-3-5.2-6-5.2Z"/><ellipse cx="6.4" cy="9.7" rx="2.4" ry="3.1"/><ellipse cx="17.6" cy="9.7" rx="2.4" ry="3.1"/><ellipse cx="10.5" cy="6.7" rx="2.3" ry="3.2"/><ellipse cx="15" cy="6" rx="2.2" ry="3.1"/>',
  bowl: '<path d="M4 11h16l-1.5 8h-13L4 11Z"/><path d="M6 11c0-3.3 2.7-6 6-6s6 2.7 6 6"/>',
  water: '<path d="M12 2.5S5.5 9.7 5.5 14.4a6.5 6.5 0 0 0 13 0C18.5 9.7 12 2.5 12 2.5Z"/>',
  litter: '<path d="M5 6h14l-1 16H6L5 6Z"/><path d="M4 6h16M8 10h8"/>',
  pill: '<path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z"/><path d="m8 8 8 8"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  alert: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v4M12 17h.01"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M15 8l3 3M18 5l2 2"/>',
  sparkle: '<path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
  file: '<path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  homePaw: '<path d="M12 13.4c-3 0-6 2.5-6 5.2 0 1.9 1.3 3.4 3.1 3.4 1.1 0 1.9-.4 2.9-.4s1.8.4 2.9.4c1.8 0 3.1-1.5 3.1-3.4 0-2.7-3-5.2-6-5.2Z"/><ellipse cx="6.4" cy="9.7" rx="2.4" ry="3.1"/><ellipse cx="17.6" cy="9.7" rx="2.4" ry="3.1"/><ellipse cx="10.5" cy="6.7" rx="2.3" ry="3.2"/><ellipse cx="15" cy="6" rx="2.2" ry="3.1"/>'
};

export function icon(name, className = '') {
  const body = ICONS[name] || ICONS.paw;
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    const name = node.dataset.icon;
    if (name) node.innerHTML = icon(name);
  });
}

export function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function uid(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function addDaysISO(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDate(iso, options = {}) {
  if (!iso) return '未设置';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('zh-CN', {
    month: options.long ? 'long' : 'numeric',
    day: 'numeric',
    ...(options.weekday ? { weekday: 'short' } : {}),
    ...(options.year ? { year: 'numeric' } : {})
  }).format(date);
}

export function formatDateRange(start, end) {
  if (!start && !end) return '日期待定';
  if (start === end || !end) return formatDate(start, { long: true });
  if (!start) return `至 ${formatDate(end, { long: true })}`;
  return `${formatDate(start, { long: true })} - ${formatDate(end, { long: true })}`;
}

export function daysBetween(start, end) {
  if (!start || !end) return 1;
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function timeAgo(isoDateTime) {
  if (!isoDateTime) return '';
  const time = new Date(isoDateTime).getTime();
  const diff = Date.now() - time;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  const d = new Date(isoDateTime);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function petEmoji(species = 'cat') {
  if (species === 'dog') return '🐶';
  if (species === 'other') return '🐾';
  return '🐱';
}

export function petAvatarClass(species = 'cat') {
  if (species === 'dog') return 'dog';
  if (species === 'other') return 'other';
  return '';
}

export function speciesLabel(species = 'cat') {
  return ({ cat: '猫咪', dog: '狗狗', other: '其它宠物' })[species] || '宠物';
}

export function statusInfo(order) {
  if (order.status === 'completed') return { key: 'completed', label: '已完成' };
  if (order.status === 'draft') return { key: 'draft', label: '草稿' };
  const today = todayISO();
  if (order.startDate > today) return { key: 'upcoming', label: '待开始' };
  if (order.endDate && order.endDate < today) return { key: 'completed', label: '待归档' };
  return { key: 'active', label: '服务中' };
}

export function reportByDay(order, iso) {
  return (order.reports || []).filter((r) => r.date === iso);
}

export function orderHasReportToday(order) {
  const list = reportByDay(order, todayISO());
  return list.length > 0;
}

export function orderProgress(order) {
  const total = daysBetween(order.startDate, order.endDate);
  const reportDates = new Set((order.reports || []).map((r) => r.date));
  return { total, reported: reportDates.size, percent: Math.min(100, Math.round((reportDates.size / total) * 100)) };
}

export function initials(value = '') {
  const trimmed = String(value).trim();
  return trimmed ? Array.from(trimmed).slice(0, 2).join('').toUpperCase() : '宠';
}

export async function compressImage(file, maxSize = 900, quality = 0.7) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('请选择图片文件');
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text, filename, type = 'text/plain;charset=utf-8') {
  downloadBlob(new Blob([text], { type }), filename);
}

export function debounce(fn, wait = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function parseDateSafe(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function pluralize(value, unit) {
  return `${value} ${unit}`;
}