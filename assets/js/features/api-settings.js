import {
    getGitLabConfig,
    getDirectApiConfigs,
    resetGitLabConfig,
    saveGitLabConfig,
    verifyGitLabConfiguration
} from '../services/api-config.js';

const FORM_FIELD_IDS = {
    gitlabUrl: 'gitlab-url',
    projectId: 'gitlab-project-id',
    branch: 'gitlab-branch',
    token: 'gitlab-token',
    authorEmail: 'gitlab-author-email',
    authorName: 'gitlab-author-name',
    filePathFormat: 'gitlab-file-path-format',
    commitMessage: 'gitlab-commit-message',
    gitlabVersionUnder13: 'gitlab-version-under-13'
};

/**
 * 初始化接口配置弹窗。
 */
export function initApiSettings() {
    const { elements } = window.app;
    renderDirectApiConfigs();
    populateForm(getGitLabConfig());

    elements.apiSettingsSwitch.addEventListener('click', openApiSettingsPanel);
    elements.closeApiSettings.addEventListener('click', closeApiSettingsPanel);
    elements.apiSettingsOverlay.addEventListener('click', closeApiSettingsPanel);
    elements.verifyGitLabConfig.addEventListener('click', () => verifyCurrentForm(false));
    elements.resetGitLabConfig.addEventListener('click', restoreDefaultConfig);
    elements.gitLabConfigForm.addEventListener('submit', event => {
        event.preventDefault();
        verifyCurrentForm(true);
    });
    elements.gitLabConfigForm.addEventListener('input', () => {
        setAuthenticationStatus('配置已修改，上传前会重新进行鉴权验证。');
    });
    elements.gitLabConfigForm.addEventListener('change', () => {
        setAuthenticationStatus('配置已修改，上传前会重新进行鉴权验证。');
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && elements.apiSettingsPanel.style.display === 'flex') {
            closeApiSettingsPanel();
        }
    });

    window.app.modules.apiSettings = {
        openApiSettingsPanel,
        closeApiSettingsPanel
    };
}

function renderDirectApiConfigs() {
    const container = window.app.elements.directApiConfigs;
    container.textContent = '';

    getDirectApiConfigs().forEach(config => {
        const card = document.createElement('article');
        card.className = 'direct-api-card';

        const title = document.createElement('h5');
        title.textContent = config.name;

        const endpointLabel = document.createElement('label');
        endpointLabel.textContent = '上传地址（POST）';
        endpointLabel.htmlFor = `direct-api-${config.id}`;

        const endpoint = document.createElement('input');
        endpoint.id = `direct-api-${config.id}`;
        endpoint.type = 'text';
        endpoint.readOnly = true;
        endpoint.value = config.url;
        endpoint.spellcheck = false;

        card.append(title, endpointLabel, endpoint);
        container.appendChild(card);
    });
}

function populateForm(config) {
    Object.entries(FORM_FIELD_IDS).forEach(([field, elementId]) => {
        const element = document.getElementById(elementId);
        if (element.type === 'checkbox') {
            element.checked = Boolean(config[field]);
        } else {
            element.value = config[field] || '';
        }
    });
}

function readFormConfig() {
    const config = {};
    Object.entries(FORM_FIELD_IDS).forEach(([field, elementId]) => {
        const element = document.getElementById(elementId);
        config[field] = element.type === 'checkbox' ? element.checked : element.value;
    });
    return config;
}

function openApiSettingsPanel() {
    const { elements } = window.app;
    populateForm(getGitLabConfig());
    setAuthenticationStatus('尚未验证当前配置。');

    elements.apiSettingsPanel.classList.remove('panel-closing');
    elements.apiSettingsOverlay.classList.remove('overlay-closing');
    elements.apiSettingsPanel.style.display = 'flex';
    elements.apiSettingsOverlay.style.display = 'block';
    elements.apiSettingsOverlay.style.opacity = '0';

    requestAnimationFrame(() => {
        elements.apiSettingsOverlay.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    });
}

export function closeApiSettingsPanel() {
    const { apiSettingsPanel, apiSettingsOverlay } = window.app.elements;
    if (apiSettingsPanel.style.display !== 'flex' || apiSettingsPanel.classList.contains('panel-closing')) return;

    apiSettingsPanel.classList.add('panel-closing');
    apiSettingsOverlay.classList.add('overlay-closing');
    window.setTimeout(() => {
        apiSettingsPanel.style.display = 'none';
        apiSettingsOverlay.style.display = 'none';
        apiSettingsPanel.classList.remove('panel-closing');
        apiSettingsOverlay.classList.remove('overlay-closing');
        document.body.style.overflow = '';
    }, 320);
}

async function verifyCurrentForm(shouldSave) {
    const { gitLabConfigForm, verifyGitLabConfig } = window.app.elements;
    if (!gitLabConfigForm.reportValidity()) return;

    const config = readFormConfig();
    if (shouldSave) {
        saveGitLabConfig(config);
    }

    verifyGitLabConfig.disabled = true;
    setAuthenticationStatus('正在验证访问令牌、项目和分支…', 'pending');

    try {
        const result = await verifyGitLabConfiguration(config);
        const projectName = result.projectPath || config.projectId;
        const saveHint = shouldSave ? '' : ' 如需将此配置用于上传，请点击“保存并验证鉴权”。';
        setAuthenticationStatus(`鉴权成功：${result.user} 可访问 ${projectName} 的 ${result.branch} 分支。${saveHint}`, 'success');
    } catch (error) {
        const prefix = shouldSave ? '配置已保存，但' : '';
        setAuthenticationStatus(`${prefix}鉴权失败：${error.message}`, 'error');
    } finally {
        verifyGitLabConfig.disabled = false;
    }
}

function restoreDefaultConfig() {
    const config = resetGitLabConfig();
    populateForm(config);
    setAuthenticationStatus('已恢复默认配置，尚未验证。');
}

function setAuthenticationStatus(message, type = '') {
    const status = window.app.elements.gitLabAuthStatus;
    status.textContent = message;
    status.className = `gitlab-auth-status${type ? ` ${type}` : ''}`;
}
