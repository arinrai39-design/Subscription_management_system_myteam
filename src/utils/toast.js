import { icons } from './icons.js';

export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconSvg = icons.bell;
  if (type === 'success') iconSvg = icons.check;
  if (type === 'error') iconSvg = icons.alertCircle;
  if (type === 'warning') iconSvg = icons.alertCircle;

  toast.innerHTML = `
    <div style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#0284c7'}; display:flex; align-items:center;">
      ${iconSvg}
    </div>
    <div style="flex: 1; font-weight: 500;">${message}</div>
    <button class="toast-close" style="color: #94a3b8; font-size: 1.1rem; padding: 2px;">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }
  }, duration);
}
