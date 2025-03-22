import { getCurrentApi } from './api-config.js';
import { saveToHistory } from '../utils/storage.js';
import { showNotification } from '../utils/helpers.js';

/**
 * 上传单个图片
 * @param {File} file - 文件对象
 * @param {Object} api - API配置对象
 * @returns {Promise} 上传结果的Promise
 */
export function uploadSingleImage(file, api) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        fetch(api.url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const processedResponse = api.processResponse(data);

            if (processedResponse.success) {
                // 如果API响应中没有文件名，则使用原始文件名
                if (!processedResponse.fileName) {
                    processedResponse.fileName = file.name;
                }

                // 添加到历史记录
                saveToHistory(processedResponse, window.app.elements.apiSelect.value);

                // 记录统计数据
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
        })
        .catch(error => reject(error));
    });
}

/**
 * 上传多个图片
 * @param {File[]} files - 文件数组
 */
export async function uploadMultipleImages(files) {
    const { elements } = window.app;

    showLoading(files.length);

    // 重置选中的预览索引为空数组
    window.app.selectedPreviewIndices = [];

    // 获取当前选择的API
    const api = getCurrentApi();

    // 重置计数器
    let successCount = 0;
    elements.totalCount.textContent = files.length;
    elements.uploadCount.textContent = '0';

    const results = [];
    window.app.allUploadResults = []; // 重置上传结果

    // 逐个上传图片，但不等待每个上传完成再开始下一个
    const uploadPromises = files.map(async (file, index) => {
        try {
            const result = await uploadSingleImage(file, api);
            results.push({ file, result, success: true });

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
            results.push({ file, error: error.message, success: false });
            return null;
        }
    });

    // 等待所有上传完成
    await Promise.all(uploadPromises);

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
