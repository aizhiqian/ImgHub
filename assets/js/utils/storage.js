// 存储上传历史的最大数量
export const MAX_HISTORY_ITEMS = 100;

/**
 * 获取上传历史
 * @returns {Array} 上传历史记录数组
 */
export function getUploadHistory() {
    const history = localStorage.getItem('uploadHistory');
    return history ? JSON.parse(history) : [];
}

/**
 * 保存上传历史
 * @param {Object} uploadResult - 上传结果对象
 * @param {string} apiId - API标识
 */
export function saveToHistory(uploadResult, apiId) {
    const history = getUploadHistory();

    // 添加新的上传记录
    history.push({
        url: uploadResult.url,
        fileName: uploadResult.fileName || '未命名',
        timestamp: Date.now(),
        apiId: apiId
    });

    // 如果历史记录超过最大数量，删除最旧的记录
    if (history.length > MAX_HISTORY_ITEMS) {
        history.sort((a, b) => a.timestamp - b.timestamp);
        history.splice(0, history.length - MAX_HISTORY_ITEMS);
    }

    localStorage.setItem('uploadHistory', JSON.stringify(history));
}

/**
 * 清空上传历史
 */
export function clearUploadHistory() {
    localStorage.removeItem('uploadHistory');
}

/**
 * 保存主题设置
 * @param {string} theme - 主题名称（'light'|'dark'）
 */
export function saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
}

/**
 * 获取用户主题设置
 * @returns {string} 主题名称（'light'|'dark'）
 */
export function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }

    // 如果没有保存的设置，则检查系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}
