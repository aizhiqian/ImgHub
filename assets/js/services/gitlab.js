import { md5Hex } from '../utils/md5.js';

export const GITLAB_CONFIG_STORAGE_KEY = 'imgHubGitLabConfig';

// 默认配置。此项目按需求以明文展示配置。
export const DEFAULT_GITLAB_CONFIG = Object.freeze({
    gitlabUrl: 'https://jihulab.com',
    projectId: '',
    branch: 'main',
    token: '',
    authorEmail: '',
    authorName: '',
    filePathFormat: '{year}/{month}/{day}/{hour}_{minute}_{second}_{fileName}',
    commitMessage: 'Upload {fileName} by ImgHub at {year}-{month}-{day}',
    gitlabVersionUnder13: false
});

const CONFIG_FIELDS = Object.keys(DEFAULT_GITLAB_CONFIG);

function sanitizeConfig(config = {}) {
    const result = {};
    CONFIG_FIELDS.forEach(field => {
        const defaultValue = DEFAULT_GITLAB_CONFIG[field];
        if (field === 'gitlabVersionUnder13') {
            result[field] = config[field] === true || config[field] === 'true';
        } else {
            result[field] = typeof config[field] === 'string' ? config[field].trim() : defaultValue;
        }
    });
    return result;
}

export function getGitLabConfig() {
    try {
        const storedConfig = localStorage.getItem(GITLAB_CONFIG_STORAGE_KEY);
        return storedConfig ? sanitizeConfig(JSON.parse(storedConfig)) : { ...DEFAULT_GITLAB_CONFIG };
    } catch (error) {
        console.warn('无法读取极狐 GitLab 配置，将使用默认配置。', error);
        return { ...DEFAULT_GITLAB_CONFIG };
    }
}

export function saveGitLabConfig(config) {
    const normalizedConfig = sanitizeConfig(config);
    localStorage.setItem(GITLAB_CONFIG_STORAGE_KEY, JSON.stringify(normalizedConfig));
    return normalizedConfig;
}

export function resetGitLabConfig() {
    localStorage.removeItem(GITLAB_CONFIG_STORAGE_KEY);
    return { ...DEFAULT_GITLAB_CONFIG };
}

function getBaseUrl(config) {
    const baseUrl = config.gitlabUrl.replace(/\/+$/, '');
    let parsedUrl;

    try {
        parsedUrl = new URL(baseUrl);
    } catch (error) {
        throw new Error('GitLab 地址不是有效的 URL。');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('GitLab 地址仅支持 HTTP 或 HTTPS。');
    }

    return baseUrl;
}

function requireConfig(config) {
    const requiredFields = [
        ['gitlabUrl', 'GitLab 地址'],
        ['projectId', '项目 ID'],
        ['branch', '分支名称'],
        ['token', '访问令牌'],
        ['filePathFormat', '文件路径格式'],
        ['commitMessage', '提交消息']
    ];
    const emptyField = requiredFields.find(([field]) => !config[field]);

    if (emptyField) {
        throw new Error(`请先填写${emptyField[1]}。`);
    }

    return getBaseUrl(config);
}

function gitLabHeaders(config) {
    return {
        'PRIVATE-TOKEN': config.token
    };
}

async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => '');

    if (!response.ok) {
        const message = typeof body === 'object' && body
            ? body.message || body.error || JSON.stringify(body)
            : body;
        throw new Error(`GitLab 请求失败（HTTP ${response.status}）：${message || response.statusText}`);
    }

    return body;
}

function projectEndpoint(baseUrl, projectId) {
    return `${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}`;
}

/**
 * 在浏览器端校验令牌、项目和目标分支。上传前会再次调用此函数。
 */
export async function verifyGitLabConfiguration(inputConfig = getGitLabConfig()) {
    const config = sanitizeConfig(inputConfig);
    const baseUrl = requireConfig(config);

    let user;
    try {
        const userResponse = await fetch(`${baseUrl}/api/v4/user`, {
            headers: gitLabHeaders(config)
        });
        user = await parseResponse(userResponse);
    } catch (error) {
        throw new Error(`令牌鉴权未通过：${error.message}`);
    }

    let project;
    try {
        const projectResponse = await fetch(projectEndpoint(baseUrl, config.projectId), {
            headers: gitLabHeaders(config)
        });
        project = await parseResponse(projectResponse);
    } catch (error) {
        throw new Error(`项目访问校验未通过：${error.message}`);
    }

    try {
        const branchResponse = await fetch(
            `${projectEndpoint(baseUrl, config.projectId)}/repository/branches/${encodeURIComponent(config.branch)}`,
            { headers: gitLabHeaders(config) }
        );
        await parseResponse(branchResponse);
    } catch (error) {
        throw new Error(`分支访问校验未通过：${error.message}`);
    }

    return {
        config,
        baseUrl,
        user: user?.name || user?.username || '已验证用户',
        project,
        projectPath: project?.path_with_namespace || '',
        branch: config.branch
    };
}

function fileNameParts(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
        return { name: fileName, extension: '' };
    }
    return {
        name: fileName.slice(0, lastDotIndex),
        extension: fileName.slice(lastDotIndex + 1)
    };
}

function replaceVariables(template, values) {
    return template.replace(/\{(year|month|day|hour|minute|second|fileName|hash16|hash32)\}/g, (match, name) => {
        return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match;
    });
}

async function encodeFileAsBase64(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const chunkSize = 0x8000;
    let binary = '';

    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }

    return btoa(binary);
}

function createUploadMetadata(file, base64Content, config) {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const { name, extension } = fileNameParts(file.name);
    const hash32 = md5Hex(base64Content);
    const values = {
        year: String(now.getFullYear()),
        month: pad(now.getMonth() + 1),
        day: pad(now.getDate()),
        hour: pad(now.getHours()),
        minute: pad(now.getMinutes()),
        second: pad(now.getSeconds()),
        fileName: name,
        hash16: hash32.slice(0, 16),
        hash32
    };
    const pathWithoutExtension = replaceVariables(config.filePathFormat, values).replace(/^\/+/, '');
    const uploadPath = extension ? `${pathWithoutExtension}.${extension}` : pathWithoutExtension;
    const commitMessage = replaceVariables(config.commitMessage, values);

    if (!uploadPath) {
        throw new Error('文件路径格式生成了空路径。');
    }

    return { uploadPath, commitMessage };
}

function encodeRawPath(path) {
    return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

/**
 * 使用 GitLab Repository Files API 创建文件，并返回可直接访问的原图地址。
 */
export async function uploadToGitLab(file, authentication) {
    const verified = authentication || await verifyGitLabConfiguration();
    const { config, baseUrl, projectPath } = verified;
    const base64Content = await encodeFileAsBase64(file);
    const { uploadPath, commitMessage } = createUploadMetadata(file, base64Content, config);
    const requestBody = {
        branch: config.branch,
        encoding: 'base64',
        commit_message: commitMessage,
        content: base64Content
    };

    if (config.authorEmail) requestBody.author_email = config.authorEmail;
    if (config.authorName) requestBody.author_name = config.authorName;

    const response = await fetch(
        `${projectEndpoint(baseUrl, config.projectId)}/repository/files/${encodeURIComponent(uploadPath)}`,
        {
            method: 'POST',
            headers: {
                ...gitLabHeaders(config),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }
    );
    await parseResponse(response);

    if (!projectPath) {
        throw new Error('GitLab 未返回项目路径，无法生成图片访问链接。');
    }

    const rawRoute = config.gitlabVersionUnder13 ? 'raw' : '-/raw';
    return {
        success: true,
        url: `${baseUrl}/${encodeRawPath(projectPath)}/${rawRoute}/${encodeURIComponent(config.branch)}/${encodeRawPath(uploadPath)}`,
        message: '上传成功',
        fileName: file.name
    };
}
