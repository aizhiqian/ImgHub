import { uploadToGitLab, verifyGitLabConfiguration } from './gitlab.js';

export {
    getGitLabConfig,
    resetGitLabConfig,
    saveGitLabConfig,
    verifyGitLabConfiguration
} from './gitlab.js';

/**
 * API配置对象，包含各上传接口的配置信息。
 */
export const apiConfigs = {
    gitlab: {
        name: '极狐 GitLab',
        requiresAuthentication: true,
        sequential: true,
        authenticate: verifyGitLabConfiguration,
        upload: uploadToGitLab
    },
    360: {
        name: '360',
        url: 'https://api.xinyew.cn/api/360tc',
        processResponse: function(data) {
            if (data.errno === 0 && data.data && data.data.url) {
                return {
                    success: true,
                    url: data.data.url,
                    message: data.error || '上传成功',
                    fileName: data.data.imgFile
                };
            } else {
                return {
                    success: false,
                    message: data.error || '上传失败'
                };
            }
        }
    },
    sogo: {
        name: '搜狗',
        url: 'https://api.xinyew.cn/api/sogotc',
        processResponse: function(data) {
            if (data.errno === 0 && data.data && data.data.url) {
                return {
                    success: true,
                    url: data.data.url,
                    message: data.error || '上传成功',
                    fileName: data.data.fileName
                };
            } else {
                return {
                    success: false,
                    message: data.error || '上传失败'
                };
            }
        }
    },
    psbc: {
        name: '中国邮政',
        url: 'https://api.xinyew.cn/api/psbctc',
        processResponse: function(data) {
            if (data.errno === 0 && data.data && data.data.url) {
                return {
                    success: true,
                    url: data.data.url,
                    message: data.message || '上传成功',
                    fileName: data.data.imgFile
                };
            } else {
                return {
                    success: false,
                    message: data.message || '上传失败'
                };
            }
        }
    }
};

export function getDirectApiConfigs() {
    return Object.entries(apiConfigs)
        .filter(([, config]) => config.url)
        .map(([id, config]) => ({ id, name: config.name, url: config.url }));
}

/**
 * 获取当前选择的API配置
 * @returns {Object} 当前API配置对象
 */
export function getCurrentApi() {
    const apiKey = window.app.elements.apiSelect.value;
    return apiConfigs[apiKey];
}

/**
 * 根据API ID获取API名称
 * @param {string} apiId - API ID
 * @returns {string} API名称
 */
export function getApiNameById(apiId) {
    if (apiConfigs[apiId]) {
        return apiConfigs[apiId].name;
    }
    return '未知来源';
}
