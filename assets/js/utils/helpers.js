/**
 * 显示通知
 * @param {string} message - 通知信息
 * @param {string} type - 通知类型（'success'|'error'|'info'）
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    // 2秒后自动消失
    setTimeout(() => {
        notification.classList.add('fadeout');
        setTimeout(() => {
            notification.remove();
        }, 400); // 与CSS动画时长匹配
    }, 2000);
}

/**
 * 防止默认事件
 * @param {Event} e - 事件对象
 */
export function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}
