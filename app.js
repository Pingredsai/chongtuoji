import {
  compressImage, copyText, downloadBlob, downloadText, formatDate,
  hydrateIcons, icon, initials, nowTime, statusInfo, todayISO
} from './js/utils.js';
import {
  addOrder, addReport, clearState, deleteOrder, deleteReport, demoState,
  emptyOrder, importState, loadState, recordBackup, replaceState, saveState,
  setOrderStatus, stateStats, updateOrder, updateProfile
} from './js/store.js';
import {
  handoverContent, homeView, orderDetailView, orderFormContent,
  ordersView, reportFormContent, settingsView, shareModalContent
} from './js/views.js';
import {
  buildReportCard, handoverShareText, intakeShareText, reportShareText,
  shareReportMedia
} from './js/share.js';

const main = document.getElementById('mainContent');
const modalRoot = document.getElementById('modalRoot');
const toastRoot = document.getElementById('toastRoot');

let state = loadState();
let currentRoute = { view: 'home', orderId: null };
let ordersFilter = 'all';
let reportDraftPhotos = [];
let orderPhotoDraft = '';
let modalOpen = false;

const viewTitles = {
  home: '工作台 · 宠托记',
  orders: '服务单 · 宠托记',
  settings: '设置与备份 · 宠托记'
};

function parseHash() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (!hash) return { view: 'home', orderId: null };
  if (hash.startsWith('order/')) return { view: 'order', orderId: decodeURIComponent(hash.slice(6)) };
  if (['home', 'orders', 'settings'].includes(hash)) return { view: hash, orderId: null };
  return { view: 'home', orderId: null };
}

function navigate(view, orderId = null, replace = false) {
  const hash = view === 'order' && orderId ? `#order/${encodeURIComponent(orderId)}` : `#${view}`;
  if (location.hash === hash) {
    currentRoute = { view, orderId };
    render();
    return;
  }
  if (replace) history.replaceState(null, '', hash);
  else location.hash = hash;
}

function setNavActive() {
  const active = currentRoute.view === 'order' ? 'orders' : currentRoute.view;
  document.querySelectorAll('[data-view]').forEach((node) => {
    node.classList.toggle('active', node.dataset.view === active && (node.classList.contains('nav-item') || node.classList.contains('bottom-nav-item')));
  });
}

function updateTopbar() {
  const context = document.getElementById('topbarContext');
  const date = document.getElementById('topbarDate');
  const avatar = document.getElementById('topbarAvatar');
  const mobileAvatar = document.getElementById('mobileAvatar');
  const name = document.getElementById('topbarName');
  const currentOrder = currentRoute.view === 'order' ? state.orders.find((order) => order.id === currentRoute.orderId) : null;
  const labels = { home: '工作台', orders: '服务单', settings: '设置与备份' };
  if (context) context.textContent = currentOrder?.pet?.name || labels[currentRoute.view] || '工作台';
  if (date) date.textContent = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
  const displayName = state.profile.sitterName || state.profile.businessName || '宠托师';
  if (name) name.textContent = displayName;
  const initial = initials(state.profile.sitterName || state.profile.businessName || '宠');
  if (avatar) avatar.textContent = initial;
  if (mobileAvatar) mobileAvatar.textContent = initial;
}

function render() {
  currentRoute = parseHash();
  let html = '';
  if (currentRoute.view === 'orders') html = ordersView(state, ordersFilter);
  else if (currentRoute.view === 'settings') html = settingsView(state);
  else if (currentRoute.view === 'order') {
    const order = state.orders.find((item) => item.id === currentRoute.orderId);
    if (!order) {
      navigate('orders', null, true);
      return;
    }
    html = orderDetailView(state, currentRoute.orderId);
  } else html = homeView(state);

  main.innerHTML = html;
  hydrateIcons(main);
  setNavActive();
  updateTopbar();
  document.title = currentRoute.view === 'order'
    ? `${state.orders.find((order) => order.id === currentRoute.orderId)?.pet?.name || '服务单'} · 宠托记`
    : (viewTitles[currentRoute.view] || '宠托记');
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function showToast(message, type = 'success', duration = 2100) {
  toastRoot.replaceChildren();
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = message;
  toastRoot.appendChild(node);
  setTimeout(() => {
    node.style.opacity = '0';
    node.style.transform = 'translateY(6px)';
    setTimeout(() => node.remove(), 180);
  }, duration);
}

function openModal(content, className = '') {
  toastRoot.replaceChildren();
  modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-backdrop><section class="modal ${className}" role="dialog" aria-modal="true">${content}</section></div>`;
  modalOpen = true;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    const focusable = modalRoot.querySelector('input:not([type="hidden"]), textarea, select, button');
    focusable?.focus({ preventScroll: true });
  });
}

function closeModal() {
  modalRoot.innerHTML = '';
  modalOpen = false;
  document.body.style.overflow = '';
  reportDraftPhotos = [];
}

function refreshModalOrderForm(order, isEdit) {
  openModal(orderFormContent(order, isEdit), 'wide');
}

function readOrderForm(form) {
  const data = new FormData(form);
  const value = (name) => String(data.get(name) || '').trim();
  return {
    serviceType: value('serviceType'),
    visitTime: value('visitTime'),
    startDate: value('startDate'),
    endDate: value('endDate'),
    pet: {
      name: value('petName'),
      species: value('species'),
      breed: value('breed'),
      age: value('age'),
      weight: value('weight'),
      photo: orderPhotoDraft
    },
    owner: {
      name: value('ownerName'),
      phone: value('ownerPhone'),
      address: value('address'),
      emergencyName: value('emergencyName'),
      emergencyPhone: value('emergencyPhone')
    },
    care: {
      feeding: value('feeding'),
      water: value('water'),
      litter: value('litter'),
      medication: value('medication'),
      behavior: value('behavior'),
      access: value('access'),
      restrictions: value('restrictions')
    },
    notes: value('notes')
  };
}

function openOrderForm(orderId = null) {
  const existing = orderId ? state.orders.find((order) => order.id === orderId) : null;
  const order = existing || emptyOrder();
  orderPhotoDraft = order.pet?.photo || '';
  refreshModalOrderForm(order, Boolean(existing));
  renderOrderPhotoPreview(order);
}

function renderOrderPhotoPreview(order) {
  const container = document.getElementById('orderPetPhotoPreview');
  if (!container) return;
  container.innerHTML = orderPhotoDraft
    ? `<img src="${orderPhotoDraft}" alt="${order?.pet?.name || '宠物'}照片"><button class="photo-remove" type="button" data-action="remove-order-photo" aria-label="删除宠物照片">×</button>`
    : `<span class="photo-placeholder">${order?.pet?.species === 'dog' ? '狗' : order?.pet?.species === 'other' ? '宠' : '猫'}</span>`;
}

function applyOrderTemplate(type) {
  const form = document.getElementById('orderForm');
  if (!form) return;
  const templates = {
    cat: {
      feeding: '每天早晚各 1 次。干粮 35g，湿粮半罐，分开喂。',
      water: '每次上门更换饮用水，并清洗水碗。',
      litter: '每天铲屎 1 次，观察尿团、软便和呕吐情况。',
      medication: '不需要。',
      behavior: '怕生，不要强行抱。进门先确认宠物位置，避免跑出门。',
      access: '',
      restrictions: '不喂人食和零食。'
    },
    dog: {
      feeding: '每天早晚各 1 次，每顿 90g 犬粮。',
      water: '保持饮水充足，每次上门清洗水碗。',
      litter: '早晚各遛 1 次，每次 20 分钟，全程牵绳。',
      medication: '不需要。',
      behavior: '出门前先戴好牵引绳，注意电动车和其他狗。',
      access: '',
      restrictions: '不吃鸡骨头，不喂人食。'
    }
  };
  const template = templates[type];
  if (!template) return;
  for (const [name, text] of Object.entries(template)) {
    const field = form.elements.namedItem(name);
    if (field && !String(field.value || '').trim()) field.value = text;
  }
  const species = form.elements.namedItem('species');
  if (species) species.value = type;
  renderOrderPhotoPreview(getOrder(form.dataset.orderId) || { pet: { species: type } });
  showToast(type === 'cat' ? '已填入猫咪照护模板' : '已填入狗狗照护模板');
}

function openReportForm(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  reportDraftPhotos = [];
  openModal(reportFormContent(order));
  const timeInput = document.querySelector('#reportForm [name="arrivalTime"]');
  if (timeInput && !timeInput.value) timeInput.value = nowTime();
  renderPhotoTiles();
}

function renderPhotoTiles() {
  const container = document.getElementById('photoTiles');
  if (!container) return;
  container.innerHTML = reportDraftPhotos.map((photo, index) => `
    <div class="photo-tile"><img src="${photo}" alt="服务照片 ${index + 1}"><button class="photo-remove" type="button" data-action="remove-report-photo" data-index="${index}" aria-label="删除照片">×</button></div>
  `).join('');
}

async function handleReportPhotos(files) {
  const remaining = Math.max(0, 3 - reportDraftPhotos.length);
  if (!remaining) {
    showToast('每条日报最多添加 3 张照片', 'error');
    return;
  }
  const selected = Array.from(files || []).slice(0, remaining);
  for (const file of selected) {
    try {
      const compressed = await compressImage(file, 900, 0.68);
      reportDraftPhotos.push(compressed);
    } catch (error) {
      showToast(error.message || '图片处理失败', 'error');
    }
  }
  renderPhotoTiles();
  const input = document.getElementById('reportPhotos');
  if (input) input.value = '';
}

async function handleOrderPetPhoto(file) {
  if (!file) return;
  try {
    orderPhotoDraft = await compressImage(file, 900, 0.72);
    renderOrderPhotoPreview(getOrder(document.getElementById('orderForm')?.dataset.orderId));
  } catch (error) {
    showToast(error.message || '宠物照片处理失败', 'error');
  }
}

function getOrder(orderId) {
  return state.orders.find((order) => order.id === orderId);
}

function getReport(orderId, reportId) {
  return getOrder(orderId)?.reports?.find((report) => report.id === reportId);
}

async function openShareReport(orderId, reportId) {
  const order = getOrder(orderId);
  const report = getReport(orderId, reportId);
  if (!order || !report) return;
  openModal(shareModalContent(order, report), 'narrow');
  try {
    const generated = await buildReportCard(order, report, state.profile);
    generated.id = 'shareCanvas';
    const current = modalRoot.querySelector('#shareCanvas');
    if (current) current.replaceWith(generated);
    else closeModal();
  } catch (error) {
    console.error(error);
    closeModal();
    showToast('日报图片生成失败，请重试', 'error');
  }
}

async function copyReportText(orderId, reportId) {
  const order = getOrder(orderId);
  const report = getReport(orderId, reportId);
  if (!order || !report) return;
  const ok = await copyText(reportShareText(order, report, state.profile));
  showToast(ok ? '日报文字已复制，可以粘贴到微信' : '复制失败，请手动选择文字', ok ? 'success' : 'error');
}

function openHandover(orderId) {
  const order = getOrder(orderId);
  if (!order) return;
  const text = handoverShareText(order, state.profile);
  openModal(handoverContent(order, text), 'narrow');
}

function safeFilename(value) {
  return String(value || '宠物').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-').slice(0, 30);
}

function exportBackup() {
  const filename = `chongtuoji-backup-${todayISO()}.json`;
  downloadText(JSON.stringify(state, null, 2), filename, 'application/json;charset=utf-8');
  recordBackup(state);
  render();
  showToast('备份文件已导出');
}

async function importBackup(file) {
  if (!file) return;
  try {
    const text = await file.text();
    if (state.orders.length && !confirm('导入备份会替换当前所有服务单，是否继续？')) return;
    const imported = importState(text);
    replaceState(imported);
    state = loadState();
    closeModal();
    ordersFilter = 'all';
    navigate('home');
    render();
    showToast('备份导入成功');
  } catch (error) {
    console.error(error);
    showToast(error.message || '备份导入失败', 'error', 4000);
  }
}

function clearAllData() {
  if (!confirm('确定删除全部服务单、日报和照片吗？此操作不可撤销。')) return;
  clearState();
  state = loadState();
  closeModal();
  ordersFilter = 'all';
  navigate('home');
  render();
  showToast('本机数据已清空');
}

function completeOrder(orderId) {
  try {
    const order = getOrder(orderId);
    if (!order) return;
    if (!confirm('确认这单服务已经结束吗？结束后仍可重新开启。')) return;
    setOrderStatus(state, orderId, 'completed');
    render();
    showToast('服务单已完成');
  } catch (error) {
    showToast(error.message || '操作失败', 'error');
  }
}

function reopenOrder(orderId) {
  try {
    setOrderStatus(state, orderId, 'active');
    render();
    showToast('服务单已重新开启');
  } catch (error) {
    showToast(error.message || '操作失败', 'error');
  }
}

function deleteOrderWithConfirm(orderId) {
  const order = getOrder(orderId);
  if (!order) return;
  if (!confirm(`确定删除 ${order.pet.name || '这张'} 的服务单及全部日报吗？`)) return;
  deleteOrder(state, orderId);
  navigate('orders', null, true);
  render();
  showToast('服务单已删除');
}

async function shareCard(orderId, reportId) {
  const order = getOrder(orderId);
  const report = getReport(orderId, reportId);
  const canvas = document.getElementById('shareCanvas');
  if (!order || !report || !canvas) return;
  const filename = `宠托日报-${safeFilename(order.pet.name)}-${report.date}.png`;
  const text = reportShareText(order, report, state.profile);
  try {
    const result = await shareReportMedia(canvas, filename, text);
    if (result === 'shared' || result === 'cancelled') return;
    if (result?.blob) {
      downloadBlob(result.blob, filename);
      showToast('日报图片已保存，可以从相册发送给主人');
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || '分享失败', 'error');
  }
}

function revealPhone(button) {
  const wrapper = button.closest('.private-value');
  const value = wrapper?.querySelector('[data-phone]');
  if (!value) return;
  const phone = value.dataset.phone || '';
  const revealed = value.dataset.revealed === 'true';
  if (revealed) {
    value.textContent = '点击显示';
    value.dataset.revealed = 'false';
    button.textContent = '显示';
  } else {
    value.textContent = phone || '未填写';
    value.dataset.revealed = 'true';
    button.textContent = '隐藏';
  }
}

document.addEventListener('click', async (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    event.preventDefault();
    const view = viewButton.dataset.view;
    if (['home', 'orders', 'settings'].includes(view)) navigate(view);
    return;
  }

  const actionElement = event.target.closest('[data-action]');
  if (!actionElement) return;
  const action = actionElement.dataset.action;
  const orderId = actionElement.dataset.orderId;
  const reportId = actionElement.dataset.reportId;

  if (action === 'close-modal') { closeModal(); return; }
  if (action === 'new-order') { openOrderForm(); return; }
  if (action === 'load-demo') {
    if (state.orders.length && !confirm('载入示例会替换当前数据，是否继续？')) return;
    state = demoState();
    saveState(state);
    ordersFilter = 'all';
    navigate('home');
    render();
    showToast('示例数据已载入');
    return;
  }
  if (action === 'go-orders') { navigate('orders'); return; }
  if (action === 'open-order') { if (orderId) navigate('order', orderId); return; }
  if (action === 'edit-order') { openOrderForm(orderId); return; }
  if (action === 'new-report') { openReportForm(orderId); return; }
  if (action === 'share-report') { await openShareReport(orderId, reportId); return; }
  if (action === 'copy-report') { await copyReportText(orderId, reportId); return; }
  if (action === 'share-card') { await shareCard(orderId, reportId); return; }
  if (action === 'delete-report') {
    if (!confirm('确定删除这条日报吗？')) return;
    deleteReport(state, orderId, reportId);
    render();
    showToast('日报已删除');
    return;
  }
  if (action === 'complete-order') { completeOrder(orderId); return; }
  if (action === 'reopen-order') { reopenOrder(orderId); return; }
  if (action === 'delete-order') { deleteOrderWithConfirm(orderId); return; }
  if (action === 'copy-intake') {
    const order = getOrder(orderId);
    if (!order) return;
    const ok = await copyText(intakeShareText(order));
    showToast(ok ? '资料清单已复制，可以发给主人' : '复制失败', ok ? 'success' : 'error');
    return;
  }
  if (action === 'handover') { openHandover(orderId); return; }
  if (action === 'copy-handover') {
    const text = document.getElementById('handoverText')?.textContent || '';
    const ok = await copyText(text);
    showToast(ok ? '交接文字已复制' : '复制失败', ok ? 'success' : 'error');
    return;
  }
  if (action === 'download-handover') {
    const order = getOrder(orderId);
    if (!order) return;
    const text = handoverShareText(order, state.profile);
    downloadText(text, `宠托交接-${safeFilename(order.pet.name)}-${order.endDate}.txt`);
    showToast('交接记录已下载');
    return;
  }
  if (action === 'export-data') { exportBackup(); return; }
  if (action === 'import-data') { document.getElementById('importFile')?.click(); return; }
  if (action === 'clear-data') { clearAllData(); return; }
  if (action === 'filter-orders') {
    ordersFilter = actionElement.dataset.filter || 'all';
    render();
    return;
  }
  if (action === 'reveal-phone') { revealPhone(actionElement); return; }
  if (action === 'apply-template') { applyOrderTemplate(actionElement.dataset.template); return; }
  if (action === 'remove-report-photo') {
    const index = Number(actionElement.dataset.index);
    reportDraftPhotos.splice(index, 1);
    renderPhotoTiles();
    return;
  }
  if (action === 'remove-order-photo') {
    orderPhotoDraft = '';
    renderOrderPhotoPreview(getOrder(document.getElementById('orderForm')?.dataset.orderId));
    return;
  }
});

modalRoot.addEventListener('click', (event) => {
  if (event.target.matches('[data-modal-backdrop]')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modalOpen) closeModal();
  const card = event.target.closest?.('[data-action="open-order"][role="button"]');
  if (card && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    navigate('order', card.dataset.orderId);
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form.id === 'orderForm') {
    event.preventDefault();
    const payload = readOrderForm(form);
    if (!payload.pet.name) { showToast('请填写宠物名字', 'error'); return; }
    if (!payload.owner.name) { showToast('请填写主人称呼', 'error'); return; }
    if (!payload.startDate || !payload.endDate) { showToast('请选择服务日期', 'error'); return; }
    if (payload.endDate < payload.startDate) { showToast('结束日期不能早于开始日期', 'error'); return; }
    try {
      const editingId = form.dataset.orderId;
      if (editingId) {
        updateOrder(state, editingId, payload);
        closeModal();
        render();
        showToast('服务单已保存');
      } else {
        const order = addOrder(state, payload);
        closeModal();
        navigate('order', order.id);
        render();
        showToast('服务单已创建');
      }
    } catch (error) {
      showToast(error.message || '保存失败', 'error', 4000);
    }
    return;
  }

  if (form.id === 'reportForm') {
    event.preventDefault();
    const orderId = form.dataset.orderId;
    const data = new FormData(form);
    const value = (name) => String(data.get(name) || '').trim();
    try {
      const report = addReport(state, orderId, {
        date: value('date'),
        arrivalTime: value('arrivalTime'),
        meal: value('meal'),
        water: value('water'),
        litter: value('litter'),
        medication: value('medication'),
        mood: value('mood'),
        note: value('note'),
        photos: reportDraftPhotos
      });
      closeModal();
      render();
      await openShareReport(orderId, report.id);
    } catch (error) {
      showToast(error.message || '日报保存失败', 'error', 4000);
    }
    return;
  }

  if (form.id === 'profileForm') {
    event.preventDefault();
    const data = new FormData(form);
    updateProfile(state, {
      sitterName: String(data.get('sitterName') || '').trim(),
      businessName: String(data.get('businessName') || '').trim(),
      phone: String(data.get('phone') || '').trim()
    });
    render();
    showToast('设置已保存');
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'reportPhotos') handleReportPhotos(event.target.files);
  if (event.target.id === 'orderPetPhoto') handleOrderPetPhoto(event.target.files?.[0]);
  if (event.target.id === 'field-species' && !orderPhotoDraft) renderOrderPhotoPreview({ pet: { species: event.target.value } });
  if (event.target.id === 'importFile') importBackup(event.target.files?.[0]);
});

document.getElementById('mobileNewOrder')?.addEventListener('click', () => openOrderForm());

window.addEventListener('hashchange', () => {
  render();
  requestAnimationFrame(() => main.focus({ preventScroll: true }));
});

render();
hydrateIcons(document);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Service worker registration failed', error));
}

// Expose a small read-only hook for automated smoke tests.
window.__CHONGTUOJI__ = {
  getState: () => JSON.parse(JSON.stringify(state)),
  getRoute: () => ({ ...currentRoute }),
  version: '0.1.0'
};