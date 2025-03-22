import { formatFileSize } from '../utils/format.js';
import { getApiNameById } from '../services/api-config.js';

// 统计数据的存储键
const STATS_STORAGE_KEY = 'imgHubStats';

/**
 * 初始化统计功能
 */
export function initStatistics() {
    const { statsSwitch, statsPanel, statsOverlay, closeStats } = window.app.elements;

    // 打开统计面板
    statsSwitch.addEventListener('click', function() {
        statsPanel.classList.remove('panel-closing');
        statsOverlay.classList.remove('overlay-closing');

        // 加载数据并显示面板
        loadStatistics();
        renderCharts();
        statsPanel.style.display = 'block';
        statsOverlay.style.display = 'block';
        statsOverlay.style.opacity = '0';

        // 平滑淡入
        setTimeout(() => {
            statsOverlay.style.opacity = '1';
            document.body.style.overflow = 'hidden';
        }, 10);
    });

    // 关闭统计面板
    closeStats.addEventListener('click', closeStatsPanel);
    statsOverlay.addEventListener('click', closeStatsPanel);

    statsPanel.addEventListener('transitionend', function(e) {
        // 仅处理关闭动画结束事件
        if (statsPanel.classList.contains('panel-closing')) {
            statsPanel.style.display = 'none';
            statsOverlay.style.display = 'none';
            document.body.style.overflow = '';

            // 重置样式
            statsPanel.classList.remove('panel-closing');
            statsOverlay.classList.remove('overlay-closing');
        }
    });

    // 将模块实例保存到全局app对象
    window.app.modules.statistics = {
        recordUpload,
        getStatistics,
        closeStatsPanel
    };
}

/**
 * 关闭统计面板
 */
export function closeStatsPanel() {
    const { statsPanel, statsOverlay } = window.app.elements;

    // 防止多次点击造成的问题
    if (statsPanel.classList.contains('panel-closing')) return;

    // 使用CSS类来控制动画
    statsPanel.classList.add('panel-closing');
    statsOverlay.classList.add('overlay-closing');

    // 添加备用关闭机制，以防transitionend未被触发
    setTimeout(() => {
        if (statsPanel.classList.contains('panel-closing')) {
            statsPanel.style.display = 'none';
            statsOverlay.style.display = 'none';
            document.body.style.overflow = '';
            statsPanel.classList.remove('panel-closing');
            statsOverlay.classList.remove('overlay-closing');
        }
    }, 400); // 略长于动画时间
}

/**
 * 记录上传数据
 * @param {Object} uploadData - 上传数据对象，包含文件大小和API ID
 */
export function recordUpload(uploadData) {
    const stats = getStatistics();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式

    // 更新总上传次数
    stats.totalUploads = (stats.totalUploads || 0) + 1;

    // 更新总流量
    stats.totalSize = (stats.totalSize || 0) + uploadData.fileSize;

    // 更新API使用次数
    stats.apiUsage = stats.apiUsage || {};
    stats.apiUsage[uploadData.apiId] = (stats.apiUsage[uploadData.apiId] || 0) + 1;

    // 更新每日上传记录
    stats.dailyUploads = stats.dailyUploads || {};
    stats.dailyUploads[today] = (stats.dailyUploads[today] || 0) + 1;

    // 保存更新后的统计数据
    saveStatistics(stats);
}

/**
 * 获取所有统计数据
 * @returns {Object} 统计数据对象
 */
export function getStatistics() {
    const statsJson = localStorage.getItem(STATS_STORAGE_KEY);
    return statsJson ? JSON.parse(statsJson) : {};
}

/**
 * 保存统计数据
 * @param {Object} stats - 统计数据对象
 */
function saveStatistics(stats) {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
}

/**
 * 加载并显示统计数据
 */
function loadStatistics() {
    const stats = getStatistics();
    const today = new Date().toISOString().split('T')[0];

    // 更新总上传数
    document.getElementById('total-uploads').textContent = stats.totalUploads || 0;

    // 更新今日上传数
    document.getElementById('today-uploads').textContent = stats.dailyUploads?.[today] || 0;

    // 更新总流量
    document.getElementById('total-size').textContent = formatFileSize(stats.totalSize || 0);
}

/**
 * 渲染统计图表
 */
function renderCharts() {
    const stats = getStatistics();

    // 渲染平台分布图表
    renderPlatformChart(stats.apiUsage || {});

    // 渲染每日上传图表
    renderDailyChart(stats.dailyUploads || {});
}

/**
 * 渲染平台分布图表
 * @param {Object} apiUsage - API使用数据
 */
function renderPlatformChart(apiUsage) {
    const platformChartEl = document.getElementById('platform-chart');
    platformChartEl.innerHTML = '';

    // 排序API使用数据（按使用次数降序）
    const sortedData = Object.entries(apiUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // 只显示前5个平台

    // 获取最大值，用于计算百分比
    const maxValue = sortedData.length > 0 ? sortedData[0][1] : 0;

    // 创建图表
    sortedData.forEach(([apiId, count]) => {
        const apiName = getApiNameById(apiId);
        const percentage = maxValue ? Math.floor((count / maxValue) * 100) : 0;

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';

        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = apiName;

        const bar = document.createElement('div');
        bar.className = 'bar';

        const barFill = document.createElement('div');
        barFill.className = 'bar-fill';
        barFill.style.width = `${percentage}%`;
        barFill.textContent = count;

        bar.appendChild(barFill);
        barContainer.appendChild(label);
        barContainer.appendChild(bar);
        platformChartEl.appendChild(barContainer);
    });

    // 如果没有数据，显示提示信息
    if (sortedData.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-chart';
        emptyMsg.textContent = '暂无数据';
        platformChartEl.appendChild(emptyMsg);
    }
}

/**
 * 渲染每日上传图表
 * @param {Object} dailyUploads - 每日上传数据
 */
function renderDailyChart(dailyUploads) {
    const dailyChartEl = document.getElementById('daily-chart');
    dailyChartEl.innerHTML = '';

    // 获取最近7天的日期
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        dates.push(dateStr);
    }

    // 获取最大值，用于计算百分比
    const values = dates.map(date => dailyUploads[date] || 0);
    const maxValue = Math.max(...values, 1); // 确保最大值至少为1

    // 创建图表
    dates.forEach((date, index) => {
        const count = dailyUploads[date] || 0;
        const percentage = Math.floor((count / maxValue) * 100);

        const columnContainer = document.createElement('div');
        columnContainer.className = 'column-container';

        const column = document.createElement('div');
        column.className = 'column';

        const columnFill = document.createElement('div');
        columnFill.className = 'column-fill';
        columnFill.style.height = `${percentage}%`;
        columnFill.setAttribute('data-value', count);

        const dateLabel = document.createElement('div');
        dateLabel.className = 'column-label';
        dateLabel.textContent = formatDateLabel(date);

        column.appendChild(columnFill);
        columnContainer.appendChild(column);
        columnContainer.appendChild(dateLabel);
        dailyChartEl.appendChild(columnContainer);
    });
}

/**
 * 格式化日期标签
 * @param {string} dateStr - YYYY-MM-DD格式的日期字符串
 * @returns {string} 格式化后的日期标签
 */
function formatDateLabel(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
        return '今天';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
        return '昨天';
    } else {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
}
