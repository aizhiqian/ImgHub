import { showNotification } from '../utils/helpers.js';

/**
 * 初始化剪贴板功能
 */
export function initClipboard() {
    // 初始化剪贴板库
    const clipboard = new ClipboardJS('.copy-all-btn');

    // 复制成功事件
    clipboard.on('success', function(e) {
        const button = e.trigger;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> 已复制';
        button.classList.add('success');

        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('success');
        }, 2000);

        showNotification('内容已复制到剪贴板', 'success');
        e.clearSelection();
    });

    // 复制失败事件
    clipboard.on('error', function(e) {
        showNotification('复制失败，请手动复制', 'error');
    });

    // 将模块实例保存到全局app对象
    window.app.modules.clipboard = {
        clipboard,
        initClipboard: () => {
            // 重新初始化剪贴板
            clipboard.destroy();
            return new ClipboardJS('.copy-all-btn');
        }
    };

    return clipboard;
}
