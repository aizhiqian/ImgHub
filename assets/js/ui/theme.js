import { getThemePreference, saveThemePreference } from '../utils/storage.js';
import { initThemeSwitcher } from './theme-switcher.js';

/**
 * 初始化主题切换功能
 */
export function initTheme() {
    const { themeSwitch } = window.app.elements;

    // 初始化主题切换器
    initThemeSwitcher();

    // 将模块实例存储到全局app对象中
    window.app.modules.theme = {
        // 保持兼容原有调用方式
        applyTheme: (mode) => {
            const color = window.app.modules.themeSwitcher.getCurrentThemeColor();
            window.app.modules.themeSwitcher.applyTheme(color, mode);
        }
    };
}

/**
 * 应用主题设置
 * @param {string} theme - 主题名称（'light'|'dark'）
 */
export function applyTheme(theme) {
    const themeSwitchIcon = window.app.elements.themeSwitch.querySelector('i');

    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitchIcon.classList.remove('fa-moon');
        themeSwitchIcon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('dark-mode');
        themeSwitchIcon.classList.remove('fa-sun');
        themeSwitchIcon.classList.add('fa-moon');
    }
    saveThemePreference(theme);
}
