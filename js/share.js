import { formatDate, loadImage, petEmoji, speciesLabel } from './utils.js';

const CARE_FIELDS = [
  ['meal', '🍚', '进食'],
  ['water', '💧', '饮水'],
  ['litter', '🪴', '排泄'],
  ['medication', '💊', '用药']
];

function colorSafe(value, fallback = '未记录') {
  return String(value || fallback).trim() || fallback;
}

export function reportShareText(order, report, profile) {
  const pet = order.pet.name || '毛孩子';
  const sitter = profile.businessName || profile.sitterName || '宠托师';
  const lines = [
    `【${pet} · ${formatDate(report.date, { long: true })} 照护日报】`,
    '',
    `🍚 进食：${colorSafe(report.meal)}`,
    `💧 饮水：${colorSafe(report.water)}`,
    `🪴 排泄：${colorSafe(report.litter)}`,
    `💊 用药：${colorSafe(report.medication)}`,
    `🐾 状态：${colorSafe(report.mood)}`
  ];
  if (report.note) lines.push('', `📝 ${report.note}`);
  lines.push('', `服务：${order.serviceType}`, `记录：${sitter}`);
  lines.push('本记录仅用于照护交接，不替代兽医诊断。');
  return lines.join('\n');
}

export function intakeShareText(order) {
  const pet = order.pet.name || '（宠物名）';
  return [
    `【${pet} · 上门照护资料】`,
    '',
    `服务日期：${formatDate(order.startDate, { long: true })} - ${formatDate(order.endDate, { long: true })}`,
    `服务内容：${order.serviceType}`,
    '',
    '请补充或确认：',
    '1. 每次喂多少、喂什么、哪些不能吃；',
    '2. 饮用水和猫砂/遛狗安排；',
    '3. 药品名称、剂量、时间和喂法；',
    '4. 性格、躲藏位置和开门注意事项；',
    '5. 门禁方式、紧急联系人和常去医院；',
    '6. 需要我每次重点拍什么或观察什么。',
    '',
    '我会在每次服务后发送图文日报，服务结束提供完整交接记录。'
  ].join('\n');
}

export function handoverShareText(order, profile) {
  const pet = order.pet.name || '毛孩子';
  const reports = [...(order.reports || [])].sort((a, b) => `${a.date}T${a.arrivalTime}`.localeCompare(`${b.date}T${b.arrivalTime}`));
  const dates = new Set(reports.map((report) => report.date));
  const abnormal = reports.filter((report) => ['没吃', '吃了一半', '偏少', '软便', '呕吐', '未完成', '有点紧张', '需关注'].includes(report.meal) || ['偏少', '软便', '呕吐', '未完成', '需关注'].includes(report.water) || ['偏少', '软便', '呕吐', '未完成', '需关注'].includes(report.litter) || ['未完成', '需关注'].includes(report.medication) || ['有点紧张', '需关注'].includes(report.mood));
  const sitter = profile.businessName || profile.sitterName || '宠托师';
  const lines = [
    `【${pet} · 宠托服务交接】`,
    '',
    `服务类型：${order.serviceType}`,
    `服务日期：${formatDate(order.startDate, { long: true })} - ${formatDate(order.endDate, { long: true })}`,
    `完成日报：${reports.length} 次（${dates.size} 天）`,
    ''
  ];
  if (reports.length) {
    const latest = reports[reports.length - 1];
    lines.push(
      '最近一次记录：',
      `- ${formatDate(latest.date, { long: true })} ${latest.arrivalTime || ''}`,
      `- 进食 ${colorSafe(latest.meal)}；饮水 ${colorSafe(latest.water)}；排泄 ${colorSafe(latest.litter)}；用药 ${colorSafe(latest.medication)}`,
      `- 状态：${colorSafe(latest.mood)}`,
      latest.note ? `- 备注：${latest.note}` : ''
    );
  } else {
    lines.push('暂无日报记录。');
  }
  lines.push('', abnormal.length ? `需要关注：服务期间共有 ${abnormal.length} 次记录包含异常或需关注状态，请查看对应日报。` : '需要关注：服务期间记录均正常，无特别异常。');
  if (order.notes) lines.push('', `交接备注：${order.notes}`);
  lines.push('', `记录人：${sitter}`, '本记录仅用于照护交接，不替代兽医诊断。');
  return lines.filter((line) => line !== '').join('\n').replace('\n\n\n', '\n\n');
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  roundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const chars = Array.from(String(text || ''));
  let line = '';
  let lines = 0;
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = char;
      lines += 1;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) {
    let output = line;
    if (lines === maxLines - 1 && chars.length && ctx.measureText(output).width > maxWidth) output = output.slice(0, -1) + '…';
    ctx.fillText(output, x, y + lines * lineHeight);
    lines += 1;
  }
  return lines * lineHeight;
}

function drawPaw(ctx, x, y, scale, color, rotate = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 10, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [cx, cy, rx, ry, angle] of [[-19, -8, 7, 10, -.35], [19, -8, 7, 10, .35], [-8, -20, 7, 10, -.1], [8, -20, 7, 10, .1]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawImageCover(ctx, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

export async function buildReportCard(order, report, profile) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const navy = '#151515';
  const ink = '#1d1d1b';
  const muted = '#888882';
  const line = '#e2e2dd';
  const paper = '#f5f5f2';
  const white = '#ffffff';
  const coral = '#2b2b29';
  const teal = '#777772';
  const sun = '#c8c8c2';

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  const heroHeight = 590;
  ctx.fillStyle = navy;
  ctx.fillRect(0, 0, W, heroHeight);
  if (order.pet?.photo) {
    try {
      const image = await loadImage(order.pet.photo);
      drawImageCover(ctx, image, 0, 0, W, heroHeight);
      const overlay = ctx.createLinearGradient(0, 80, 0, heroHeight);
      overlay.addColorStop(0, 'rgba(20,31,46,.18)');
      overlay.addColorStop(.48, 'rgba(20,31,46,.28)');
      overlay.addColorStop(1, 'rgba(20,31,46,.88)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, heroHeight);
    } catch (error) {
      console.warn('Could not draw pet hero image', error);
    }
  }

  ctx.fillStyle = white;
  ctx.font = '750 26px "Microsoft YaHei", sans-serif';
  ctx.fillText('宠托记', 64, 70);
  ctx.fillStyle = 'rgba(255,255,255,.64)';
  ctx.font = '400 17px "Microsoft YaHei", sans-serif';
  ctx.fillText('照护服务记录', 160, 70);

  const dateText = formatDate(report.date, { long: true, weekday: true });
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  ctx.font = '500 19px "Microsoft YaHei", sans-serif';
  ctx.fillText(dateText, W - 64, 70);
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(255,255,255,.66)';
  ctx.font = '600 18px "Microsoft YaHei", sans-serif';
  ctx.fillText('上门服务记录', 64, 410);
  ctx.fillStyle = white;
  ctx.font = '750 68px "Microsoft YaHei", sans-serif';
  ctx.fillText('照护日报', 64, 490);
  ctx.font = '700 34px "Microsoft YaHei", sans-serif';
  ctx.fillText(order.pet.name || '毛孩子', 64, 548);
  const petMeta = `${speciesLabel(order.pet.species)}${order.pet.breed ? ` · ${order.pet.breed}` : ''} · ${order.serviceType} · ${report.arrivalTime || ''}`;
  ctx.fillStyle = 'rgba(255,255,255,.68)';
  ctx.font = '400 19px "Microsoft YaHei", sans-serif';
  ctx.fillText(petMeta, 250, 548);

  const stripeY = heroHeight;
  const stripeWidths = [W * .26, W * .22, W * .24, W * .28];
  const stripeColors = [teal, sun, coral, navy];
  let stripeX = 0;
  stripeColors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(stripeX, stripeY, stripeWidths[index], 10);
    stripeX += stripeWidths[index];
  });
  const bodyTop = heroHeight + 48;
  ctx.fillStyle = ink;
  ctx.font = '750 25px "Microsoft YaHei", sans-serif';
  ctx.fillText('本次照护', 64, bodyTop);
  ctx.fillStyle = muted;
  ctx.font = '400 17px "Microsoft YaHei", sans-serif';
  const completionText = report.note || '本次服务已完成';
  ctx.textAlign = 'right';
  ctx.fillText(completionText.length > 28 ? '服务已记录' : '服务已记录', W - 64, bodyTop);
  ctx.textAlign = 'left';

  const gridX = 64;
  const gridY = bodyTop + 34;
  const gridW = 952;
  const cellW = gridW / 2;
  const cellH = 118;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.strokeRect(gridX, gridY, gridW, cellH * 2);
  ctx.beginPath();
  ctx.moveTo(gridX + cellW, gridY);
  ctx.lineTo(gridX + cellW, gridY + cellH * 2);
  ctx.moveTo(gridX, gridY + cellH);
  ctx.lineTo(gridX + gridW, gridY + cellH);
  ctx.stroke();

  CARE_FIELDS.forEach(([key, , label], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = gridX + col * cellW + 28;
    const y = gridY + row * cellH + 34;
    ctx.fillStyle = muted;
    ctx.font = '600 16px "Microsoft YaHei", sans-serif';
    ctx.fillText(label, x, y);
    ctx.fillStyle = ink;
    ctx.font = '700 27px "Microsoft YaHei", sans-serif';
    ctx.fillText(colorSafe(report[key]), x, y + 45);
  });

  const moodY = gridY + cellH * 2 + 20;
  ctx.fillStyle = '#efefeb';
  ctx.fillRect(gridX, moodY, gridW, 76);
  ctx.fillStyle = coral;
  ctx.font = '600 16px "Microsoft YaHei", sans-serif';
  ctx.fillText('整体状态', gridX + 28, moodY + 30);
  ctx.textAlign = 'right';
  ctx.fillStyle = ink;
  ctx.font = '700 24px "Microsoft YaHei", sans-serif';
  ctx.fillText(colorSafe(report.mood), gridX + gridW - 28, moodY + 44);
  ctx.textAlign = 'left';

  const noteY = moodY + 104;
  ctx.fillStyle = muted;
  ctx.font = '600 16px "Microsoft YaHei", sans-serif';
  ctx.fillText('照护备注', 64, noteY);
  ctx.fillStyle = ink;
  ctx.font = '400 22px "Microsoft YaHei", sans-serif';
  const noteLines = wrapText(ctx, report.note || '本次服务已完成，暂无额外备注。', 64, noteY + 38, 952, 35, report.photos?.length ? 2 : 3);
  const extraY = Math.max(1180, noteY + 38 + noteLines + 24);

  if (report.photos?.length) {
    const photoY = extraY;
    const gap = 14;
    const count = Math.min(2, report.photos.length);
    const photoW = (952 - gap * (count - 1)) / count;
    for (let index = 0; index < count; index += 1) {
      try {
        const image = await loadImage(report.photos[index]);
        const x = 64 + index * (photoW + gap);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, photoY, photoW, 128);
        ctx.clip();
        drawImageCover(ctx, image, x, photoY, photoW, 128);
        ctx.restore();
      } catch (error) {
        console.warn('Could not draw report photo', error);
      }
    }
  } else {
    ctx.fillStyle = '#ededE9';
    ctx.fillRect(64, extraY, 952, 96);
    const summary = [
      ['服务日期', formatDate(report.date, { long: true })],
      ['上门时间', report.arrivalTime || '未记录'],
      ['服务类型', order.serviceType]
    ];
    summary.forEach(([label, value], index) => {
      const x = 88 + index * 316;
      if (index > 0) {
        ctx.strokeStyle = '#d9dfe6';
        ctx.beginPath();
        ctx.moveTo(x - 24, extraY + 20);
        ctx.lineTo(x - 24, extraY + 76);
        ctx.stroke();
      }
      ctx.fillStyle = muted;
      ctx.font = '500 14px "Microsoft YaHei", sans-serif';
      ctx.fillText(label, x, extraY + 32);
      ctx.fillStyle = ink;
      ctx.font = '650 18px "Microsoft YaHei", sans-serif';
      ctx.fillText(value, x, extraY + 64);
    });
  }

  ctx.strokeStyle = line;
  ctx.beginPath();
  ctx.moveTo(64, 1372);
  ctx.lineTo(1016, 1372);
  ctx.stroke();
  const sitter = profile.businessName || profile.sitterName || '宠托师';
  ctx.fillStyle = ink;
  ctx.font = '700 19px "Microsoft YaHei", sans-serif';
  ctx.fillText(sitter, 64, 1407);
  ctx.textAlign = 'right';
  ctx.fillStyle = muted;
  ctx.font = '400 15px "Microsoft YaHei", sans-serif';
  ctx.fillText('仅用于照护交接，不替代兽医诊断', 1016, 1407);
  ctx.textAlign = 'left';

  return canvas;
}

export async function shareReportMedia(canvas, filename, text) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
  if (!blob) throw new Error('日报图片生成失败');
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
      console.warn('Native share failed, falling back to download', error);
    }
  }
  return { blob, file };
}