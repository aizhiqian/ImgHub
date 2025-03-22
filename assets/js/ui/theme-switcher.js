import { getThemePreference, saveThemePreference } from '../utils/storage.js';

/**
 * 可用的主题配置
 */
const THEMES = {
    red: {
        name: '红色主题',
        className: '',  // 默认主题无需额外类名
        color: 'red'
    },
    blue: {
        name: '蓝色主题',
        className: 'blue-theme',
        color: 'blue'
    },
    green: {
        name: '绿色主题',
        className: 'green-theme',
        color: 'green'
    },
    purple: {
        name: '紫色主题',
        className: 'purple-theme',
        color: 'purple'
    },
    orange: {
        name: '橙色主题',
        className: 'orange-theme',
        color: 'orange'
    },
    pink: {
        name: '粉色主题',
        className: 'pink-theme',
        color: 'pink'
    }
};

/**
 * 初始化主题切换器
 */
export function initThemeSwitcher() {
    // 创建主题切换面板
    createThemeSwitcherPanel();

    const { themeSwitch } = window.app.elements;

    // 应用初始主题设置
    const savedTheme = getThemePreference();
    const themeParts = savedTheme.split('-');

    // 应用主题颜色和模式
    const color = themeParts[0] || 'red';
    const mode = themeParts[1] || 'light';

    applyTheme(color, mode);
    updateThemeSwitcherUI(color, mode);

    // 切换主题按钮点击事件
    themeSwitch.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleThemeSwitcherPanel();
    });

    // 点击其他区域关闭面板
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.theme-switcher-panel') &&
            !e.target.closest('#theme-switch')) {
            closeThemeSwitcherPanel();
        }
    });

    // 添加ESC键关闭面板
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeThemeSwitcherPanel();
        }
    });

    // 监听系统主题变化
    if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (colorSchemeQuery.addEventListener) {
            colorSchemeQuery.addEventListener('change', function(e) {
                // 仅当用户未手动设置过主题时，才跟随系统
                if (!localStorage.getItem('theme')) {
                    const currentColor = getCurrentThemeColor();
                    applyTheme(currentColor, e.matches ? 'dark' : 'light');
                    updateThemeSwitcherUI(currentColor, e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // 将模块实例存储到全局app对象中
    window.app.modules.themeSwitcher = {
        applyTheme,
        toggleThemeSwitcherPanel,
        closeThemeSwitcherPanel,
        getCurrentThemeColor,
        getCurrentThemeMode
    };
}

/**
 * 创建主题切换面板
 */
function createThemeSwitcherPanel() {
    const panel = document.createElement('div');
    panel.className = 'theme-switcher-panel';
    panel.id = 'theme-switcher-panel';

    let themeOptionsHTML = '';

    // 创建颜色选项
    Object.entries(THEMES).forEach(([id, theme]) => {
        themeOptionsHTML += `
            <div class="theme-option" data-theme="${id}">
                <div class="theme-color theme-color-${id}"></div>
                <div class="theme-name">${theme.name}</div>
            </div>
        `;
    });

    panel.innerHTML = `
        <div class="theme-switcher-title">选择主题风格</div>
        <div class="theme-options">
            ${themeOptionsHTML}
        </div>
        <div class="mode-switch">
            <span class="mode-label"><i class="fas fa-sun"></i></span>
            <label class="mode-toggle">
                <input type="checkbox" id="mode-toggle">
                <span class="mode-slider"></span>
            </label>
            <span class="mode-label"><i class="fas fa-moon"></i></span>
        </div>
    `;

    document.body.appendChild(panel);

    // 绑定事件
    const themeOptions = panel.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const themeColor = this.dataset.theme;
            const themeMode = getCurrentThemeMode();
            applyTheme(themeColor, themeMode);
            updateThemeSwitcherUI(themeColor, themeMode);
        });
    });

    // 模式切换开关
    const modeToggle = document.getElementById('mode-toggle');
    modeToggle.addEventListener('change', function() {
        const themeColor = getCurrentThemeColor();
        const themeMode = this.checked ? 'dark' : 'light';
        applyTheme(themeColor, themeMode);
    });
}

/**
 * 切换主题面板显示状态
 */
function toggleThemeSwitcherPanel() {
    const panel = document.getElementById('theme-switcher-panel');
    panel.classList.toggle('active');
}

/**
 * 关闭主题切换面板
 */
function closeThemeSwitcherPanel() {
    const panel = document.getElementById('theme-switcher-panel');
    panel.classList.remove('active');
}

/**
 * 应用主题
 * @param {string} color - 主题颜色 ('red'|'blue'|'green'|'purple'|'orange'|'pink')
 * @param {string} mode - 主题模式 ('light'|'dark')
 */
function applyTheme(color, mode) {
    // 移除所有主题类
    document.body.classList.remove('dark-mode', 'blue-theme', 'green-theme', 'purple-theme', 'orange-theme', 'pink-theme');

    // 应用主题颜色
    if (color && color !== 'red') {
        const theme = THEMES[color];
        if (theme && theme.className) {
            document.body.classList.add(theme.className);
        }
    }

    // 应用主题模式
    if (mode === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // 更新主题切换按钮图标
    const themeSwitchIcon = window.app.elements.themeSwitch.querySelector('i');
    if (mode === 'dark') {
        themeSwitchIcon.classList.remove('fa-moon');
        themeSwitchIcon.classList.add('fa-sun');
    } else {
        themeSwitchIcon.classList.remove('fa-sun');
        themeSwitchIcon.classList.add('fa-moon');
    }

    // 保存设置
    saveThemePreference(`${color}-${mode}`);
}

/**
 * 更新主题切换器UI
 * @param {string} color - 主题颜色
 * @param {string} mode - 主题模式
 */
function updateThemeSwitcherUI(color, mode) {
    // 更新颜色选项
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.dataset.theme === color) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // 更新模式开关
    const modeToggle = document.getElementById('mode-toggle');
    modeToggle.checked = mode === 'dark';
}

/**
 * 获取当前主题颜色
 * @returns {string} 主题颜色
 */
function getCurrentThemeColor() {
    for (const [id, theme] of Object.entries(THEMES)) {
        if (id === 'red' && !document.body.classList.contains('blue-theme') &&
            !document.body.classList.contains('green-theme') &&
            !document.body.classList.contains('purple-theme') &&
            !document.body.classList.contains('orange-theme') &&
            !document.body.classList.contains('pink-theme')) {
            return 'red';
        } else if (id !== 'red' && document.body.classList.contains(theme.className)) {
            return id;
        }
    }
    return 'red'; // 默认返回红色主题
}

/**
 * 获取当前主题模式
 * @returns {string} 主题模式 ('light'|'dark')
 */
function getCurrentThemeMode() {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
}
