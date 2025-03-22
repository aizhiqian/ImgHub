/**
 * 注册页面元素引用
 */
export function registerElements() {
    const elements = {
        fileForm: document.getElementById('file-form'),
        fileInput: document.getElementById('file-input'),
        uploadFileBtn: document.getElementById('upload-file-btn'),
        dropArea: document.getElementById('drop-area'),
        loading: document.getElementById('loading'),
        selectedFilesContainer: document.getElementById('selected-files'),
        uploadCount: document.getElementById('upload-count'),
        totalCount: document.getElementById('total-count'),
        apiSelect: document.getElementById('api-select'),
        previewContainer: document.getElementById('preview-container'),
        urlContent: document.getElementById('url-content'),
        htmlContent: document.getElementById('html-content'),
        mdContent: document.getElementById('md-content'),
        urlTabs: document.querySelectorAll('.url-tab'),
        themeSwitch: document.getElementById('theme-switch'),
        historySwitch: document.getElementById('history-switch'),
        historyPanel: document.getElementById('history-panel'),
        historyOverlay: document.getElementById('history-overlay'),
        closeHistory: document.getElementById('close-history'),
        clearHistory: document.getElementById('clear-history'),
        historyItems: document.getElementById('history-items'),
        historyEmpty: document.getElementById('history-empty'),
        statsSwitch: document.getElementById('stats-switch'),
        statsPanel: document.getElementById('stats-panel'),
        statsOverlay: document.getElementById('stats-overlay'),
        closeStats: document.getElementById('close-stats')
    };

    // 存储元素引用到全局app对象中
    window.app.elements = elements;
    return elements;
}

/**
 * 创建指定类型的元素并设置属性
 * @param {string} tag - 元素标签名
 * @param {Object} attributes - 属性对象
 * @param {string} textContent - 文本内容
 * @param {HTMLElement[]} children - 子元素数组
 * @returns {HTMLElement} 创建的元素
 */
export function createElement(tag, attributes = {}, textContent = '', children = []) {
    const element = document.createElement(tag);

    // 设置属性
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });

    // 设置文本内容
    if (textContent) {
        element.textContent = textContent;
    }

    // 添加子元素
    children.forEach(child => {
        element.appendChild(child);
    });

    return element;
}
