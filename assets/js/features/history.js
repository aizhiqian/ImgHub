import { getUploadHistory, clearUploadHistory } from '../utils/storage.js';
import { getApiNameById } from '../services/api-config.js';
import { formatDate } from '../utils/format.js';
import { createElement } from '../utils/dom.js';
import { showNotification } from '../utils/helpers.js';

/**
 * 初始化历史记录功能
 */
export function initHistory() {
    const {
        historySwitch,
        historyPanel,
        historyOverlay,
        closeHistory,
        clearHistory
    } = window.app.elements;

    // 打开历史面板
    historySwitch.addEventListener('click', function() {
        historyPanel.classList.remove('panel-closing');
        historyOverlay.classList.remove('overlay-closing');

        // 加载数据并显示面板
        loadHistory();
        historyPanel.style.display = 'flex';
        historyOverlay.style.display = 'block';
        historyOverlay.style.opacity = '0';

        // 平滑淡入
        setTimeout(() => {
            historyOverlay.style.opacity = '1';
            document.body.style.overflow = 'hidden';
        }, 10);
    });

    // 关闭历史面板
    closeHistory.addEventListener('click', closeHistoryPanel);
    historyOverlay.addEventListener('click', closeHistoryPanel);

    // 监听面板关闭动画结束
    historyPanel.addEventListener('transitionend', function(e) {
        // 仅处理关闭动画结束事件
        if (historyPanel.classList.contains('panel-closing')) {
            // 确保面板完全隐藏并重置状态
            historyPanel.style.display = 'none';
            historyOverlay.style.display = 'none';
            document.body.style.overflow = '';

            // 重置样式
            historyPanel.classList.remove('panel-closing');
            historyOverlay.classList.remove('overlay-closing');
        }
    });

    // 清空历史记录
    clearHistory.addEventListener('click', function() {
        if (confirm('确定要清空所有上传历史吗？此操作不可恢复。')) {
            clearUploadHistory();
            loadHistory(); // 重新加载（空）历史
        }
    });

    // 将模块实例保存到全局app对象
    window.app.modules.history = {
        loadHistory,
        closeHistoryPanel
    };
}

/**
 * 加载历史记录
 */
export function loadHistory() {
    const { historyItems, historyEmpty } = window.app.elements;
    const history = getUploadHistory();
    historyItems.innerHTML = '';

    if (history.length === 0) {
        historyEmpty.style.display = 'flex';
        return;
    }

    historyEmpty.style.display = 'none';

    // 按时间倒序排列
    history.sort((a, b) => b.timestamp - a.timestamp);

    history.forEach(item => {
        const historyItem = createElement('div', { className: 'history-item' });

        // 创建图片元素
        const img = createElement('img', {
            src: item.url,
            alt: item.fileName || '上传的图片'
        });

        img.onerror = function() {
            // 如果图片加载失败，显示占位符
            this.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 80 60\'%3e%3cpath fill=\'%23eee\' d=\'M0 0h80v60H0z\'/%3e%3cpath fill=\'%23999\' d=\'M36 31h2v2h-2zm0-12h2v10h-2z\'/%3e%3ccircle fill=\'none\' stroke=\'%23999\' stroke-width=\'2\' cx=\'40\' cy=\'30\' r=\'20\'/%3e%3c/svg%3e';
            this.style.objectFit = 'contain';
            this.style.backgroundColor = '#f5f5f5';
        };

        // 创建信息区域
        const info = createElement('div', { className: 'history-info' });

        // 文件名信息
        const fileName = createElement('div', { className: 'history-filename' }, item.fileName || '未知文件名');

        // 日期信息
        const date = createElement('div', { className: 'history-date' }, formatDate(item.timestamp));

        // API信息
        const api = createElement('div', { className: 'history-api' }, getApiNameById(item.apiId));

        info.appendChild(fileName);
        info.appendChild(date);
        info.appendChild(api);

        historyItem.appendChild(img);
        historyItem.appendChild(info);

        // 点击历史项复制URL
        historyItem.addEventListener('click', function() {
            navigator.clipboard.writeText(item.url)
                .then(() => {
                    showNotification('图片链接已复制到剪贴板', 'success');
                })
                .catch(err => {
                    showNotification('复制失败: ' + err, 'error');
                });
        });

        historyItems.appendChild(historyItem);
    });
}

/**
 * 关闭历史面板
 */
export function closeHistoryPanel() {
    const { historyPanel, historyOverlay } = window.app.elements;

    // 防止多次点击造成的问题
    if (historyPanel.classList.contains('panel-closing')) return;

    // 使用CSS类来控制动画
    historyPanel.classList.add('panel-closing');
    historyOverlay.classList.add('overlay-closing');

    // 添加备用关闭机制，以防transitionend未被触发
    setTimeout(() => {
        if (historyPanel.classList.contains('panel-closing')) {
            historyPanel.style.display = 'none';
            historyOverlay.style.display = 'none';
            document.body.style.overflow = '';
            historyPanel.classList.remove('panel-closing');
            historyOverlay.classList.remove('overlay-closing');
        }
    }, 400); // 略长于动画时间
}
