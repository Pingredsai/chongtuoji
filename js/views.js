import {
  escapeHTML, formatDate, formatDateRange, icon, orderHasReportToday,
  orderProgress, petAvatarClass, speciesLabel, statusInfo,
  timeAgo, todayISO
} from './utils.js';
import { stateStats } from './store.js';

function careValue(value) {
  return value ? escapeHTML(value) : '<span class="masked">未填写</span>';
}

function emptyState({ title, description, primary = '', secondary = '' }) {
  return `
    <div class="empty-state">
      <div class="empty-illustration" data-icon="paw"></div>
      <h2>${escapeHTML(title)}</h2>
      <p>${escapeHTML(description)}</p>
      <div class="empty-actions">${primary}${secondary}</div>
    </div>`;
}

function petPhotoMarkup(order, className = 'pet-photo') {
  if (order.pet.photo) {
    return `<img class="${className}" src="${escapeHTML(order.pet.photo)}" alt="${escapeHTML(order.pet.name || '宠物')}" loading="lazy">`;
  }
  return `<div class="${className} pet-photo-fallback ${petAvatarClass(order.pet.species)}">${escapeHTML((order.pet.name || '宠').slice(0, 1))}</div>`;
}

function nextVisitText(order) {
  const status = statusInfo(order);
  const time = order.visitTime ? ` ${order.visitTime}` : '';
  if (status.key === 'active') return `今天${time}`;
  if (status.key === 'upcoming') return `${formatDate(order.startDate, { long: true })}${time}`;
  if (status.key === 'completed') return `已完成 · ${formatDate(order.endDate, { long: true })}`;
  return '日期待定';
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function todayLabel() {
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
}

export function orderCard(order) {
  const status = statusInfo(order);
  const progress = orderProgress(order);
  return `
    <article class="service-card ${status.key}" data-action="open-order" data-order-id="${escapeHTML(order.id)}" tabindex="0" role="button" aria-label="查看 ${escapeHTML(order.pet.name || '宠物')} 的服务单">
      <div class="service-card-media">${petPhotoMarkup(order, 'service-photo')}</div>
      <div class="service-card-body">
        <div class="service-card-top">
          <div>
            <h3>${escapeHTML(order.pet.name || '未命名宠物')}</h3>
            <p>${speciesLabel(order.pet.species)}${order.pet.breed ? ` · ${escapeHTML(order.pet.breed)}` : ''}</p>
          </div>
          <span class="status-pill ${status.key}">${status.label}</span>
        </div>
        <div class="service-card-details">
          <div><span>下次服务</span><strong>${nextVisitText(order)}</strong></div>
          <div><span>主人</span><strong>${escapeHTML(order.owner.name || '未填写')}</strong></div>
        </div>
        <div class="service-card-footer">
          <span class="record-progress"><i style="--progress:${progress.percent}%"></i>${progress.reported}/${progress.total} 天有记录</span>
          <span class="card-link">查看服务单 ${icon('arrowRight')}</span>
        </div>
      </div>
    </article>`;
}

export function homeView(state) {
  const stats = stateStats(state);
  const name = state.profile.sitterName || state.profile.businessName || '宠托师';
  const today = todayISO();
  const todayOrders = state.orders
    .filter((order) => order.status !== 'completed' && order.startDate <= today && order.endDate >= today)
    .sort((a, b) => (a.visitTime || '09:00').localeCompare(b.visitTime || '09:00'));
  const activeOrders = state.orders
    .filter((order) => statusInfo(order).key !== 'completed')
    .sort((a, b) => {
      const rank = { active: 0, upcoming: 1, draft: 2 };
      return (rank[statusInfo(a).key] ?? 9) - (rank[statusInfo(b).key] ?? 9) || a.startDate.localeCompare(b.startDate);
    });
  const scheduleOrders = todayOrders.length ? todayOrders : activeOrders.slice(0, 3);
  const recentReports = state.orders
    .flatMap((order) => (order.reports || []).map((report) => ({ order, report })))
    .sort((a, b) => b.report.createdAt.localeCompare(a.report.createdAt))
    .slice(0, 5);

  if (!state.orders.length) {
    return `
      <section class="page dashboard-page">
        <div class="dashboard-heading">
          <div><div class="date-line">${todayLabel()}</div><h1>${greeting()}，${escapeHTML(name)}</h1><p>今天还没有安排。先建一张服务单，或载入示例体验完整流程。</p></div>
          <div class="head-actions"><button class="btn btn-primary" data-action="new-order">${icon('plus')}新建服务单</button></div>
        </div>
        <div class="welcome-panel">
          <div class="welcome-copy">
            <span class="section-kicker">宠托师工作台</span>
            <h2>把每次上门，<br>记录成让主人安心的服务。</h2>
            <p>统一保存照护说明、上门记录和交接信息。每次服务后生成一张适合微信发送的图文日报。</p>
            <div class="welcome-actions"><button class="btn btn-primary" data-action="new-order">${icon('plus')}创建第一张服务单</button><button class="btn btn-ghost" data-action="load-demo">查看示例工作台</button></div>
            <div class="welcome-proof"><span>${icon('shield')}数据保存在本机</span><span>${icon('share')}日报不包含联系方式</span></div>
          </div>
          <div class="welcome-visual"><img class="welcome-main-photo" src="assets/pets/cat-naigai.jpg" alt="宠物照护示例照片"><img class="welcome-thumb dog" src="assets/pets/dog-doubao.jpg" alt="狗狗示例照片"><img class="welcome-thumb cat" src="assets/pets/cat-tuantuan.jpg" alt="猫咪示例照片"><div class="photo-caption"><span>今日照护</span><strong>示例 · 已完成</strong></div></div>
        </div>
        <div class="metric-strip">
          <div class="metric-item"><span>服务中</span><strong>0</strong><small>当前没有进行中的服务</small></div>
          <div class="metric-item"><span>今日待记录</span><strong>0</strong><small>每次服务后生成日报</small></div>
          <div class="metric-item"><span>累计日报</span><strong>0</strong><small>可导出备份</small></div>
        </div>
      </section>`;
  }

  return `
    <section class="page dashboard-page">
      <div class="dashboard-heading">
        <div><div class="date-line">${todayLabel()}</div><h1>${greeting()}，${escapeHTML(name)}</h1><p>今天有 ${scheduleOrders.length} 项服务安排，${stats.pendingTodayCount} 份日报待记录。</p></div>
        <div class="head-actions"><button class="btn btn-ghost" data-action="go-orders">${icon('clipboard')}全部服务单</button><button class="btn btn-primary" data-action="new-order">${icon('plus')}新建服务单</button></div>
      </div>

      <div class="metric-strip">
        <div class="metric-item"><span>服务中</span><strong>${stats.activeCount}</strong><small>包含待开始服务单</small></div>
        <div class="metric-item attention"><span>今日待记录</span><strong>${stats.pendingTodayCount}</strong><small>服务完成后及时填写</small></div>
        <div class="metric-item"><span>累计日报</span><strong>${stats.totalReports}</strong><small>已归档 ${stats.completedCount} 单</small></div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-main">
          <section class="content-panel schedule-panel">
            <div class="panel-heading"><div><h2>今日安排</h2><p>${todayLabel()}</p></div><button class="text-btn" data-action="go-orders">查看全部 ${icon('arrowRight')}</button></div>
            <div class="schedule-list">
              ${scheduleOrders.map((order) => {
                const hasReport = orderHasReportToday(order);
                return `<article class="schedule-row" data-action="open-order" data-order-id="${order.id}" tabindex="0">
                  <time>${escapeHTML(order.visitTime || '09:00')}</time>
                  ${petPhotoMarkup(order, 'schedule-photo')}
                  <div class="schedule-info"><h3>${escapeHTML(order.pet.name)}</h3><p>${escapeHTML(order.owner.name || '未填写主人')} · ${escapeHTML(order.serviceType)}</p></div>
                  <span class="schedule-state ${hasReport ? 'done' : ''}">${hasReport ? '日报已记录' : '待记录日报'}</span>
                  <button class="btn btn-sm ${hasReport ? 'btn-ghost' : 'btn-coral'}" data-action="${hasReport ? 'open-order' : 'new-report'}" data-order-id="${order.id}">${hasReport ? '查看' : '写日报'}</button>
                </article>`;
              }).join('')}
            </div>
          </section>

          <section class="content-panel">
            <div class="panel-heading"><div><h2>正在服务</h2><p>持续中的服务单和下一步安排</p></div></div>
            <div class="service-list">${activeOrders.slice(0, 3).map(orderCard).join('')}</div>
          </section>
        </div>

        <aside class="dashboard-side">
          <section class="todo-panel">
            <div class="todo-panel-top"><span>今日待办</span><strong>${stats.pendingTodayCount}</strong></div>
            <h2>${stats.pendingTodayCount ? '还有日报等待发送' : '今天的记录已完成'}</h2>
            <p>${stats.pendingTodayCount ? '完成服务后记录进食、饮水、排泄、用药和状态，生成日报发给主人。' : '可以提前整理下一单资料，或者查看最近的服务记录。'}</p>
            <button class="btn btn-light" data-action="${stats.pendingTodayCount ? 'go-orders' : 'new-order'}">${stats.pendingTodayCount ? '处理待办' : '安排下一单'}</button>
          </section>

          <section class="content-panel activity-panel">
            <div class="panel-heading"><div><h2>最近日报</h2><p>最新发送记录</p></div></div>
            ${recentReports.length ? `<div class="activity-list">${recentReports.slice(0, 4).map(({ order, report }) => `
              <button class="activity-row" data-action="share-report" data-order-id="${order.id}" data-report-id="${report.id}">
                ${petPhotoMarkup(order, 'activity-photo')}
                <span class="activity-copy"><strong>${escapeHTML(order.pet.name)}</strong><small>${formatDate(report.date, { long: true })} · ${escapeHTML(report.mood)}</small></span>
                ${icon('arrowRight')}
              </button>`).join('')}</div>` : '<div class="panel-empty">还没有日报记录</div>'}
          </section>
        </aside>
      </div>
    </section>`;
}

export function ordersView(state, filter = 'all') {
  const filters = [['all', '全部'], ['active', '服务中'], ['upcoming', '待开始'], ['completed', '已完成']];
  const orders = [...state.orders]
    .filter((order) => filter === 'all' || statusInfo(order).key === filter || (filter === 'completed' && order.status === 'completed'))
    .sort((a, b) => {
      const rank = { active: 0, upcoming: 1, draft: 2, completed: 3 };
      return (rank[statusInfo(a).key] ?? 9) - (rank[statusInfo(b).key] ?? 9) || a.startDate.localeCompare(b.startDate);
    });
  return `
    <section class="page">
      <div class="dashboard-heading">
        <div><div class="date-line">服务管理</div><h1>服务单</h1><p>宠物资料、照护说明、日报和交接记录集中管理。</p></div>
        <div class="head-actions"><button class="btn btn-primary" data-action="new-order">${icon('plus')}新建服务单</button></div>
      </div>
      <div class="list-toolbar"><div class="filter-row">${filters.map(([key, label]) => `<button class="chip ${filter === key ? 'active' : ''}" data-action="filter-orders" data-filter="${key}">${label}</button>`).join('')}</div><span class="result-count">${orders.length} 张服务单</span></div>
      ${orders.length ? `<div class="service-grid">${orders.map(orderCard).join('')}</div>` : emptyState({
        title: filter === 'all' ? '还没有服务单' : '这个分类下暂时没有服务单',
        description: filter === 'all' ? '新建一单，开始记录第一次上门照护。' : '切换到全部服务单，或新建一单。',
        primary: `<button class="btn btn-primary" data-action="new-order">${icon('plus')}新建服务单</button>`,
        secondary: state.orders.length ? '' : `<button class="btn btn-ghost" data-action="load-demo">查看示例</button>`
      })}
    </section>`;
}

function reportHTML(order, report) {
  const attention = ['没吃', '吃了一半', '偏少', '软便', '呕吐', '未完成', '需关注', '有点紧张'].includes(report.meal) || ['未完成', '需关注'].includes(report.medication) || ['需关注', '有点紧张'].includes(report.mood) || ['偏少', '软便', '呕吐'].includes(report.litter) || ['偏少'].includes(report.water);
  return `
    <article class="report-entry ${attention ? 'attention' : ''}">
      <div class="report-entry-head"><div><time>${formatDate(report.date, { long: true })} · ${escapeHTML(report.arrivalTime || '')}</time><h3>${escapeHTML(report.mood || '照护日报')}</h3></div><span class="report-state ${attention ? 'attention' : 'normal'}">${attention ? '需关注' : '状态正常'}</span></div>
      <div class="report-status-grid">
        <div><span>进食</span><strong>${escapeHTML(report.meal)}</strong></div>
        <div><span>饮水</span><strong>${escapeHTML(report.water)}</strong></div>
        <div><span>排泄</span><strong>${escapeHTML(report.litter)}</strong></div>
        <div><span>用药</span><strong>${escapeHTML(report.medication)}</strong></div>
      </div>
      ${report.note ? `<p class="report-note">${escapeHTML(report.note)}</p>` : ''}
      ${report.photos?.length ? `<div class="report-photos">${report.photos.map((photo, index) => `<img src="${photo}" alt="${escapeHTML(order.pet.name)} 的服务照片 ${index + 1}">`).join('')}</div>` : ''}
      <div class="report-actions">
        <button class="btn btn-sm btn-primary" data-action="share-report" data-order-id="${order.id}" data-report-id="${report.id}">${icon('share')}分享日报</button>
        <button class="btn btn-sm btn-ghost" data-action="copy-report" data-order-id="${order.id}" data-report-id="${report.id}">${icon('copy')}复制文字</button>
        <button class="btn btn-sm btn-ghost" data-action="delete-report" data-order-id="${order.id}" data-report-id="${report.id}">删除</button>
      </div>
    </article>`;
}

export function orderDetailView(state, orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return ordersView(state);
  const status = statusInfo(order);
  const progress = orderProgress(order);
  const reports = [...(order.reports || [])].sort((a, b) => `${b.date}T${b.arrivalTime || '00:00'}`.localeCompare(`${a.date}T${a.arrivalTime || '00:00'}`));
  return `
    <section class="page">
      <div class="detail-breadcrumb"><button class="text-btn" data-action="go-orders">${icon('arrowLeft')}服务单</button><span>/</span><span>${escapeHTML(order.pet.name || '未命名宠物')}</span></div>
      <div class="service-detail-head">
        ${petPhotoMarkup(order, 'detail-photo')}
        <div class="detail-title"><div class="detail-title-row"><span class="status-pill ${status.key}">${status.label}</span><span class="detail-service-type">${escapeHTML(order.serviceType)}</span></div><h1>${escapeHTML(order.pet.name || '未命名宠物')}</h1><p>${speciesLabel(order.pet.species)}${order.pet.breed ? ` · ${escapeHTML(order.pet.breed)}` : ''}${order.pet.age ? ` · ${escapeHTML(order.pet.age)}` : ''}${order.pet.weight ? ` · ${escapeHTML(order.pet.weight)}` : ''}</p><div class="detail-meta"><span>${icon('calendar')}${formatDateRange(order.startDate, order.endDate)}</span><span>${icon('clock')}每天 ${escapeHTML(order.visitTime || '09:00')}</span><span>${icon('user')}${escapeHTML(order.owner.name || '未填写主人')}</span></div></div>
        <div class="detail-head-actions"><button class="btn btn-ghost" data-action="edit-order" data-order-id="${order.id}">${icon('edit')}编辑</button>${status.key === 'completed' ? `<button class="btn btn-ghost" data-action="reopen-order" data-order-id="${order.id}">重新开启</button>` : `<button class="btn btn-coral" data-action="new-report" data-order-id="${order.id}">${icon('plus')}写日报</button>`}</div>
      </div>

      <div class="detail-progress"><div><span>服务进度</span><strong>${progress.reported} / ${progress.total} 天已记录</strong></div><div class="progress-track"><i style="width:${progress.percent}%"></i></div><span>${progress.percent}%</span></div>

      <div class="detail-layout">
        <div class="detail-main">
          <section class="content-panel">
            <div class="panel-heading"><div><h2>照护说明</h2><p>服务前和每次上门时查看</p></div><div class="inline-actions"><button class="btn btn-sm btn-ghost" data-action="copy-intake" data-order-id="${order.id}">${icon('copy')}资料清单</button><button class="btn btn-sm btn-ghost" data-action="handover" data-order-id="${order.id}">${icon('file')}交接记录</button></div></div>
            <div class="care-detail-grid">
              <div><span>喂食</span><p>${careValue(order.care.feeding)}</p></div>
              <div><span>饮水</span><p>${careValue(order.care.water)}</p></div>
              <div><span>排泄 / 遛狗</span><p>${careValue(order.care.litter)}</p></div>
              <div><span>用药</span><p>${careValue(order.care.medication)}</p></div>
              <div><span>性格与安全</span><p>${careValue(order.care.behavior)}</p></div>
              <div><span>禁忌</span><p>${careValue(order.care.restrictions)}</p></div>
              <div class="wide"><span>门禁方式</span><p>${careValue(order.care.access)}</p></div>
              <div class="wide"><span>其他备注</span><p>${careValue(order.notes)}</p></div>
            </div>
          </section>

          <section class="content-panel reports-panel">
            <div class="panel-heading"><div><h2>服务日报</h2><p>共 ${reports.length} 条记录</p></div>${status.key !== 'completed' ? `<button class="btn btn-sm btn-primary" data-action="new-report" data-order-id="${order.id}">${icon('plus')}记录一次服务</button>` : ''}</div>
            ${reports.length ? `<div class="report-list">${reports.map((report) => reportHTML(order, report)).join('')}</div>` : '<div class="panel-empty">还没有日报。完成一次服务后，记录现场情况。</div>'}
          </section>
        </div>

        <aside class="detail-side">
          <section class="content-panel contact-panel">
            <div class="panel-heading"><div><h2>主人信息</h2><p>仅保存在本机</p></div></div>
            <dl class="contact-list">
              <div><dt>主人</dt><dd>${escapeHTML(order.owner.name || '未填写')}</dd></div>
              <div><dt>电话</dt><dd><span class="private-value"><span class="masked" data-phone="${escapeHTML(order.owner.phone || '')}">${order.owner.phone ? '点击显示' : '未填写'}</span>${order.owner.phone ? `<button class="text-btn" data-action="reveal-phone">显示</button>` : ''}</span></dd></div>
              <div><dt>地址</dt><dd>${escapeHTML(order.owner.address || '未填写')}</dd></div>
              <div><dt>紧急联系人</dt><dd>${escapeHTML(order.owner.emergencyName || '未填写')}<br>${escapeHTML(order.owner.emergencyPhone || '')}</dd></div>
            </dl>
          </section>
          <section class="next-visit-card">
            <span>下一次服务</span>
            <strong>${nextVisitText(order)}</strong>
            <p>${status.key === 'completed' ? '服务已经结束，可以生成交接记录。' : '完成照护后及时写日报，主人会收到更清晰的反馈。'}</p>
            ${status.key === 'completed' ? `<button class="btn btn-light" data-action="handover" data-order-id="${order.id}">生成交接记录</button>` : `<button class="btn btn-light" data-action="new-report" data-order-id="${order.id}">记录本次服务</button><button class="text-btn light-link" data-action="complete-order" data-order-id="${order.id}">标记服务完成</button>`}
          </section>
          <section class="content-panel data-note"><span>${icon('shield')}</span><div><strong>分享时保护隐私</strong><p>生成的日报图片不包含电话、地址、门禁和紧急联系人。</p></div></section>
        </aside>
      </div>
    </section>`;
}

function lastBackupLabel(iso) {
  if (!iso) return '还没有导出过备份';
  const date = new Date(iso);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function settingsView(state) {
  const profile = state.profile;
  return `
    <section class="page">
      <div class="page-head"><div><div class="eyebrow">账户与应用</div><h1>设置与备份</h1><p>设置会显示在日报图片上。第一版不上传云端，请定期导出备份。</p></div></div>
      <div class="settings-grid">
        <form class="form-card" id="profileForm">
          <h2>宠托师资料</h2><p>日报底部会显示这里的名称</p>
          <div class="profile-preview"><div class="avatar">${escapeHTML((profile.sitterName || profile.businessName || '宠').slice(0, 1))}</div><div><strong>${escapeHTML(profile.businessName || profile.sitterName || '还没有填写名称')}</strong><small>${escapeHTML(profile.phone || '未填写联系电话')}</small></div></div>
          <div class="field-grid">
            <div class="field"><label for="sitterName">你的名字</label><input class="input" id="sitterName" name="sitterName" value="${escapeHTML(profile.sitterName)}" placeholder="例如：小满" maxlength="30"></div>
            <div class="field"><label for="businessName">服务名称 <span class="optional">选填</span></label><input class="input" id="businessName" name="businessName" value="${escapeHTML(profile.businessName)}" placeholder="例如：小满上门宠托" maxlength="40"></div>
            <div class="field full"><label for="profilePhone">联系电话 <span class="optional">选填</span></label><input class="input" id="profilePhone" name="phone" type="tel" value="${escapeHTML(profile.phone)}" placeholder="只保存在本机" maxlength="30"></div>
          </div>
          <div class="form-actions"><button class="btn btn-primary" type="submit">保存设置</button></div>
        </form>

        <div class="form-card">
          <h2>数据备份</h2><p>换设备或清理浏览器前，先导出 JSON 备份。</p>
          <div class="backup-note"><strong>最近备份：</strong>${escapeHTML(lastBackupLabel(state.settings.lastBackupAt))}<br>当前有 ${state.orders.length} 张服务单、${state.orders.reduce((sum, order) => sum + (order.reports?.length || 0), 0)} 条日报。照片以压缩后的形式保存在本机。</div>
          <div class="settings-actions" style="margin-top:18px">
            <button class="btn btn-primary" data-action="export-data">${icon('download')}导出备份</button>
            <button class="btn btn-ghost" data-action="import-data">${icon('upload')}导入备份</button>
            <input id="importFile" class="photo-input" type="file" accept="application/json,.json">
          </div>
          <div class="divider"></div>
          <h2>关于第一版</h2>
          <div class="info-list">
            <div class="info-row"><dt>产品版本</dt><dd>宠托记 MVP 0.1</dd></div>
            <div class="info-row"><dt>数据方式</dt><dd>浏览器本机存储，不上传服务器</dd></div>
            <div class="info-row"><dt>当前限制</dt><dd>一个设备独立使用；跨设备请通过备份文件迁移</dd></div>
            <div class="info-row"><dt>隐私</dt><dd>日报分享图不包含电话、地址和门禁信息</dd></div>
          </div>
        </div>

        <div class="form-card danger-zone">
          <h2>清空本机数据</h2><p>删除所有服务单、日报和照片。此操作不可撤销，建议先导出备份。</p>
          <button class="btn btn-danger" data-action="clear-data">${icon('trash')}清空全部数据</button>
        </div>
      </div>
    </section>`;
}

function inputField({ name, label, value = '', type = 'text', placeholder = '', required = false, full = false, maxlength = 120, readonly = false }) {
  return `<div class="field ${full ? 'full' : ''}"><label for="field-${name}">${label}${required ? ' *' : ''}</label><input class="input" id="field-${name}" name="${name}" type="${type}" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" ${required ? 'required' : ''} maxlength="${maxlength}" ${readonly ? 'readonly' : ''}></div>`;
}

function textareaField({ name, label, value = '', placeholder = '', full = true, optional = false }) {
  return `<div class="field ${full ? 'full' : ''}"><label for="field-${name}">${label}${optional ? ' <span class="optional">选填</span>' : ''}</label><textarea class="textarea" id="field-${name}" name="${name}" placeholder="${escapeHTML(placeholder)}" maxlength="1200">${escapeHTML(value)}</textarea></div>`;
}

export function orderFormContent(order, isEdit = false) {
  const o = order || {};
  const pet = o.pet || {};
  const owner = o.owner || {};
  const care = o.care || {};
  return `
    <div class="modal-head"><div><h2>${isEdit ? '编辑服务单' : '新建服务单'}</h2><p>先填必要信息，之后可以随时补充</p></div><button class="modal-close" data-action="close-modal" aria-label="关闭">${icon('x')}</button></div>
    <div class="modal-body">
      <form id="orderForm" data-order-id="${isEdit ? escapeHTML(o.id) : ''}">
        <div class="pet-photo-editor">
          <div class="order-photo-preview" id="orderPetPhotoPreview"></div>
          <div class="pet-photo-copy"><strong>宠物照片</strong><p>用于服务单和日报，建议使用清晰的正面照。</p><div class="quick-templates"><label class="btn btn-sm btn-ghost" for="orderPetPhoto">${icon('camera')}上传照片</label><input class="photo-input" id="orderPetPhoto" type="file" accept="image/*"><button class="chip" type="button" data-action="apply-template" data-template="cat">猫咪模板</button><button class="chip" type="button" data-action="apply-template" data-template="dog">狗狗模板</button></div></div>
        </div>
        <div class="form-section">
          <div class="form-section-title"><span>1</span>宠物与主人</div>
          <div class="field-grid">
            ${inputField({ name: 'petName', label: '宠物名字', value: pet.name, placeholder: '例如：团团', required: true, maxlength: 30 })}
            <div class="field"><label for="field-species">宠物类型</label><select class="select" id="field-species" name="species"><option value="cat" ${pet.species === 'cat' ? 'selected' : ''}>猫咪</option><option value="dog" ${pet.species === 'dog' ? 'selected' : ''}>狗狗</option><option value="other" ${pet.species === 'other' ? 'selected' : ''}>其它宠物</option></select></div>
            ${inputField({ name: 'breed', label: '品种', value: pet.breed, placeholder: '例如：英短蓝猫', maxlength: 40 })}
            ${inputField({ name: 'age', label: '年龄', value: pet.age, placeholder: '例如：3 岁', maxlength: 30 })}
            ${inputField({ name: 'weight', label: '体重', value: pet.weight, placeholder: '例如：4.8 kg', maxlength: 30 })}
            ${inputField({ name: 'ownerName', label: '主人称呼', value: owner.name, placeholder: '例如：林女士', required: true, maxlength: 40 })}
            ${inputField({ name: 'ownerPhone', label: '主人电话', value: owner.phone, placeholder: '只保存在本机', type: 'tel', maxlength: 30 })}
            ${inputField({ name: 'address', label: '服务地址', value: owner.address, placeholder: '楼栋和注意事项', full: true, maxlength: 160 })}
            ${inputField({ name: 'emergencyName', label: '紧急联系人', value: owner.emergencyName, placeholder: '姓名或关系', maxlength: 40 })}
            ${inputField({ name: 'emergencyPhone', label: '紧急联系电话', value: owner.emergencyPhone, placeholder: '只保存在本机', type: 'tel', maxlength: 30 })}
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title"><span>2</span>服务安排</div>
          <div class="field-grid">
            <div class="field"><label for="field-serviceType">服务类型</label><select class="select" id="field-serviceType" name="serviceType">${['上门喂养', '家庭寄养', '上门遛狗', '日托照护', '其他服务'].map((value) => `<option value="${value}" ${o.serviceType === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
            ${inputField({ name: 'visitTime', label: '每日上门时间', value: o.visitTime || '09:00', type: 'time', required: true })}
            ${inputField({ name: 'startDate', label: '开始日期', value: o.startDate || todayISO(), type: 'date', required: true })}
            ${inputField({ name: 'endDate', label: '结束日期', value: o.endDate || todayISO(), type: 'date', required: true })}
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title"><span>3</span>照护说明</div>
          <div class="field-grid">
            ${textareaField({ name: 'feeding', label: '喂食', value: care.feeding, placeholder: '吃多少、吃什么、频率、不能吃什么' })}
            ${textareaField({ name: 'water', label: '饮水', value: care.water, placeholder: '换水频率、水碗清洗等' })}
            ${textareaField({ name: 'litter', label: '排泄 / 遛狗', value: care.litter, placeholder: '猫砂清理、排便观察、遛狗时间和路线' })}
            ${textareaField({ name: 'medication', label: '用药', value: care.medication, placeholder: '药名、剂量、时间、喂法；没有就写不需要' })}
            ${textareaField({ name: 'behavior', label: '性格与安全注意', value: care.behavior, placeholder: '是否怕生、是否护食、开门时注意什么' })}
            ${textareaField({ name: 'access', label: '门禁方式', value: care.access, placeholder: '钥匙、密码盒、门禁码；不要写进分享日报', optional: true })}
            ${textareaField({ name: 'restrictions', label: '禁忌与限制', value: care.restrictions, placeholder: '不能吃的食物、不能进的房间等' })}
            ${textareaField({ name: 'notes', label: '其他备注', value: o.notes, placeholder: '主人希望重点拍摄或汇报的内容', optional: true })}
          </div>
        </div>

        <div class="form-actions">${isEdit ? `<button class="btn btn-danger" type="button" data-action="delete-order" data-order-id="${escapeHTML(o.id)}">删除</button>` : ''}<button class="btn btn-ghost" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="submit">${isEdit ? '保存修改' : '创建服务单'}</button></div>
      </form>
    </div>`;
}

function pillOptions(name, values, selected) {
  return `<div class="option-row">${values.map((value) => `<label class="option-pill"><input type="radio" name="${name}" value="${escapeHTML(value)}" ${selected === value ? 'checked' : ''}><span>${escapeHTML(value)}</span></label>`).join('')}</div>`;
}

export function reportFormContent(order) {
  return `
    <div class="modal-head"><div><h2>记录 ${escapeHTML(order.pet.name || '本次服务')}</h2><p>保存后立即生成可分享的日报图片</p></div><button class="modal-close" data-action="close-modal" aria-label="关闭">${icon('x')}</button></div>
    <div class="modal-body">
      <form id="reportForm" data-order-id="${escapeHTML(order.id)}">
        <div class="form-section">
          <div class="form-section-title"><span>1</span>本次服务</div>
          <div class="field-grid">
            ${inputField({ name: 'date', label: '日期', value: todayISO(), type: 'date', required: true })}
            ${inputField({ name: 'arrivalTime', label: '上门时间', value: '', type: 'time', required: true })}
          </div>
        </div>
        <div class="form-section">
          <div class="form-section-title"><span>2</span>照护状态</div>
          <div class="field" style="margin-bottom:12px"><label>进食</label>${pillOptions('meal', ['吃完', '吃了一半', '没吃', '不适用'], '吃完')}</div>
          <div class="field" style="margin-bottom:12px"><label>饮水</label>${pillOptions('water', ['已换水', '正常', '偏少', '不适用'], '已换水')}</div>
          <div class="field" style="margin-bottom:12px"><label>排泄 / 遛狗</label>${pillOptions('litter', ['正常', '软便', '呕吐', '未排便', '不适用'], '正常')}</div>
          <div class="field" style="margin-bottom:12px"><label>用药</label>${pillOptions('medication', ['不需要', '按时完成', '未完成', '需关注'], '不需要')}</div>
          <div class="field"><label>整体状态</label>${pillOptions('mood', ['精神很好', '正常', '有点紧张', '需关注'], '正常')}</div>
        </div>
        <div class="form-section">
          <div class="form-section-title"><span>3</span>照片与备注</div>
          <div class="field"><label for="reportPhotos">服务照片 <span class="optional">最多 3 张</span></label><div class="photo-picker"><label class="btn btn-ghost" for="reportPhotos">${icon('camera')}添加照片</label><input class="photo-input" id="reportPhotos" type="file" accept="image/*" multiple><div class="photo-tiles" id="photoTiles"></div></div><p class="help">照片会在本机压缩后保存，不会上传服务器。</p></div>
          ${textareaField({ name: 'note', label: '照护备注', value: '', placeholder: '例如：今天食欲很好，猫砂盆清理一次，尿团 2 个。', optional: true })}
        </div>
        <div class="form-actions"><button class="btn btn-ghost" type="button" data-action="close-modal">取消</button><button class="btn btn-coral" type="submit">${icon('sparkle')}保存并生成日报</button></div>
      </form>
    </div>`;
}

export function handoverContent(order, text) {
  return `
    <div class="modal-head"><div><h2>${escapeHTML(order.pet.name)} · 服务交接</h2><p>复制发给主人，或下载留档</p></div><button class="modal-close" data-action="close-modal" aria-label="关闭">${icon('x')}</button></div>
    <div class="modal-body">
      <div class="copy-box" id="handoverText">${escapeHTML(text)}</div>
      <div class="share-actions sticky-actions"><button class="btn btn-primary" data-action="copy-handover">${icon('copy')}复制交接文字</button><button class="btn btn-ghost" data-action="download-handover" data-order-id="${order.id}">${icon('download')}下载 TXT</button></div>
      <div class="inline-message" style="margin-top:18px">交接记录只用于照护信息整理，不替代兽医诊断。</div>
    </div>`;
}

export function shareModalContent(order, report) {
  return `
    <div class="modal-head"><div><h2>${escapeHTML(order.pet.name)} · 日报分享图</h2><p>${formatDate(report.date, { long: true })} · 已隐藏电话、地址和门禁信息</p></div><button class="modal-close" data-action="close-modal" aria-label="关闭">${icon('x')}</button></div>
    <div class="modal-body">
      <div class="preview-canvas-wrap"><canvas id="shareCanvas" aria-label="日报分享图预览"></canvas></div>
      <div class="share-actions sticky-actions"><button class="btn btn-primary" data-action="share-card" data-order-id="${order.id}" data-report-id="${report.id}">${icon('share')}分享 / 保存图片</button><button class="btn btn-ghost" data-action="copy-report" data-order-id="${order.id}" data-report-id="${report.id}">${icon('copy')}复制文字版</button></div>
      <div class="inline-message info" style="margin-top:16px">如果手机不支持直接分享图片，会下载 PNG 到本地，再从微信发送给主人。</div>
    </div>`;
}