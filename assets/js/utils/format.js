/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * 格式化日期
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

/**
 * 数字补零
 * @param {number} num - 需要补零的数字
 * @returns {string} 补零后的字符串
 */
export function padZero(num) {
    return num < 10 ? '0' + num : num;
}
