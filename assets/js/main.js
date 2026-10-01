import { initTabs } from './ui/tabs.js';
import { initTheme } from './ui/theme.js';
import { setupAnimations } from './ui/animations.js';
import { initDropzone } from './features/dropzone.js';
import { initPreview } from './features/preview.js';
import { initClipboard } from './features/clipboard.js';
import { initHistory } from './features/history.js';
import { initResults } from './features/results.js';
import { setupNotifications } from './ui/notifications.js';
import { registerElements } from './utils/dom.js';
import { initStatistics } from './features/statistics.js';
import { initApiSettings } from './features/api-settings.js';

// 页面加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 注册页面元素引用
    registerElements();

    // 初始化UI组件
    initTabs();
    initTheme();
    setupAnimations();
    initClipboard();
    setupNotifications();

    // 初始化功能模块
    initDropzone();
    initPreview();
    initHistory();
    initResults();
    initStatistics();
    initApiSettings();

    // 监听页面粘贴事件
    document.addEventListener('paste', handlePaste);

    // 在窗口加载完成后重新应用一次动画，确保所有元素都已准备好
    window.addEventListener('load', function() {
        // 添加页面加载动画
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.style.opacity = '1';
            setTimeout(() => {
                setupAnimations();
            }, 300);
        }, 100);
    });
});

// 处理粘贴事件
function handlePaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;

    if (clipboardData && clipboardData.items) {
        const items = clipboardData.items;
        const imageFiles = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            // 使用导入的preview模块处理粘贴的图片
            window.app.selectedFiles = [...window.app.selectedFiles, ...imageFiles];
            window.app.modules.preview.updateSelectedFilesUI();
            window.app.elements.uploadFileBtn.disabled = false;
        }
    }
}

// 创建全局应用状态对象
window.app = {
    selectedFiles: [],
    allUploadResults: [],
    selectedPreviewIndices: [],
    elements: {},  // 将在dom.js中填充
    modules: {}    // 将在各模块初始化时填充
};
