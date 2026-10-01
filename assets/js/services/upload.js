import { getCurrentApi } from './api-config.js';
import { saveToHistory } from '../utils/storage.js';

/**
 * 上传单个图片
 * @param {File} file - 文件对象
 * @param {Object} api - API配置对象
 * @returns {Promise} 上传结果的Promise
 */
export function uploadSingleImage(file, api, authentication) {
    return new Promise((resolve, reject) => {
        if (api.upload) {
            api.upload(file, authentication)
                .then(processedResponse => finalizeUpload(processedResponse, file, resolve, reject))
                .catch(reject);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        fetch(api.url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const processedResponse = api.processResponse(data);

            finalizeUpload(processedResponse, file, resolve, reject);
        })
        .catch(error => reject(error));
    });
}

function finalizeUpload(processedResponse, file, resolve, reject) {
    if (processedResponse.success) {
        if (!processedResponse.fileName) {
            processedResponse.fileName = file.name;
        }

        saveToHistory(processedResponse, window.app.elements.apiSelect.value);

        if (window.app.modules.statistics) {
            window.app.modules.statistics.recordUpload({
                fileSize: file.size,
                apiId: window.app.elements.apiSelect.value
            });
        }

        resolve(processedResponse);
    } else {
        reject(new Error(processedResponse.message || '上传失败'));
    }
}

/**
 * 上传多个图片
 * @param {File[]} files - 文件数组
 */
export async function uploadMultipleImages(files) {
    const { elements } = window.app;
    const api = getCurrentApi();
    let authentication;

    if (api.requiresAuthentication) {
        try {
            elements.uploadFileBtn.disabled = true;
            authentication = await api.authenticate();
        } catch (error) {
            alert(`极狐 GitLab 鉴权失败：${error.message}`);
            elements.uploadFileBtn.disabled = false;
            return;
        }
    }

    showLoading(files.length);

    // 重置选中的预览索引为空数组
    window.app.selectedPreviewIndices = [];

    // 重置计数器
    let successCount = 0;
    elements.totalCount.textContent = files.length;
    elements.uploadCount.textContent = '0';

    const results = [];
    window.app.allUploadResults = []; // 重置上传结果

    // 统一处理单个文件的上传结果。
    const uploadFile = async (file, index) => {
        try {
            const result = await uploadSingleImage(file, api, authentication);
            results[index] = { file, result, success: true };

            // 添加到全局上传结果集合
            window.app.allUploadResults.push({
                url: result.url,
                fileName: file.name,
                index: index
            });

            successCount++;
            elements.uploadCount.textContent = successCount;
            return result;
        } catch (error) {
            results[index] = { file, error: error.message, success: false };
            return null;
        }
    };

    // GitLab Repository Files API 会为每个文件创建一次提交；串行提交可避免同一分支并发更新冲突。
    if (api.sequential) {
        for (let index = 0; index < files.length; index++) {
            await uploadFile(files[index], index);
        }
    } else {
        await Promise.all(files.map(uploadFile));
    }

    // 所有上传完成后，显示结果
    hideLoading();

    // 显示成功数量
    if (successCount > 0) {
        // 更新URL结果显示
        window.app.modules.results.updateUrlResults();

        // 重新初始化剪贴板
        window.app.modules.clipboard.initClipboard();

        // 重置文件选择但保留预览
        const previewItems = document.querySelectorAll('.preview-item');
        if (previewItems.length > 0) {
            // 给预览项添加上传成功标记
            previewItems.forEach((item, index) => {
                if (results[index] && results[index].success) {
                    const successIcon = document.createElement('div');
                    successIcon.className = 'success-icon';
                    successIcon.innerHTML = '<i class="fas fa-check"></i>';
                    item.appendChild(successIcon);

                    // 添加上传成功的视觉提示
                    item.classList.add('uploaded');
                }
            });
        } else {
            // 如果没有预览，正常重置
            window.app.selectedFiles = [];
            window.app.modules.preview.updateSelectedFilesUI();
        }
        elements.uploadFileBtn.disabled = true;
    } else {
        alert('所有图片上传失败');
    }
}

/**
 * 显示加载中
 * @param {number} total - 总文件数
 */
function showLoading(total) {
    const { elements } = window.app;
    elements.loading.style.display = 'flex';
    if (total > 1) {
        elements.uploadCount.textContent = '0';
        elements.totalCount.textContent = total;
        document.getElementById('upload-progress').style.display = 'block';
    } else {
        document.getElementById('upload-progress').style.display = 'none';
    }
}

/**
 * 隐藏加载中
 */
function hideLoading() {
    window.app.elements.loading.style.display = 'none';
}
