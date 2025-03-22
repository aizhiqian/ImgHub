/**
 * 初始化标签页功能
 */
export function initTabs() {
    const { urlTabs } = window.app.elements;

    // 初始化标签页切换
    urlTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签和面板的active类
            document.querySelectorAll('.url-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.url-panel').forEach(p => p.classList.remove('active'));

            // 添加当前标签和对应面板的active类
            this.classList.add('active');
            const targetPanel = document.getElementById(this.dataset.target);
            targetPanel.classList.add('active');
        });
    });

    // 将模块实例保存到全局app对象
    window.app.modules.tabs = {
        switchTab: (tabId) => {
            const tab = document.querySelector(`.url-tab[data-target="${tabId}"]`);
            if (tab) tab.click();
        }
    };
}
