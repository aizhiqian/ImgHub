import { preventDefaults } from '../utils/helpers.js';
import { uploadMultipleImages } from '../services/upload.js';

/**
 * 初始化文件拖放功能
 */
export function initDropzone() {
    const { dropArea, fileInput, fileForm, uploadFileBtn } = window.app.elements;

    // 拖放文件功能
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    // 点击拖放区域触发文件选择
    dropArea.addEventListener('click', function() {
        fileInput.click();
    });

    // 文件选择
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            // 将FileList转换为数组并过滤掉非图片文件
            const newFiles = Array.from(fileInput.files).filter(file => file.type.startsWith('image/'));

            if (newFiles.length > 0) {
                // 添加到已选文件列表
                window.app.selectedFiles = [...window.app.selectedFiles, ...newFiles];
                window.app.modules.preview.updateSelectedFilesUI();
                uploadFileBtn.disabled = false;
            }
        }
    });

    // 文件上传表单提交
    fileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (window.app.selectedFiles.length > 0) {
            uploadMultipleImages(window.app.selectedFiles);
        }
    });

    // 将模块实例保存到全局app对象
    window.app.modules.dropzone = {
        resetDropArea,
        handleDrop
    };
}

/**
 * 高亮拖放区域
 */
function highlight() {
    const { dropArea } = window.app.elements;
    dropArea.classList.add('highlight');

    // 添加动画效果
    dropArea.style.animation = 'none';
    dropArea.offsetHeight; // 触发重绘
    dropArea.style.animation = 'pulse 1.5s infinite';
}

/**
 * 取消高亮拖放区域
 */
function unhighlight() {
    const { dropArea } = window.app.elements;
    dropArea.classList.remove('highlight');
}

/**
 * 处理拖放文件
 * @param {DragEvent} e - 拖放事件对象
 */
function handleDrop(e) {
    unhighlight();

    // 添加落下动画效果
    const { dropArea } = window.app.elements;
    dropArea.classList.add('dropped');
    setTimeout(() => {
        dropArea.classList.remove('dropped');
    }, 300);

    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        // 过滤出图片文件
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

        if (imageFiles.length > 0) {
            // 添加到已选文件列表
            window.app.selectedFiles = [...window.app.selectedFiles, ...imageFiles];
            window.app.modules.preview.updateSelectedFilesUI();
            window.app.elements.uploadFileBtn.disabled = false;
        }
    }
}

/**
 * 重置拖放区域
 */
export function resetDropArea() {
    const { dropArea } = window.app.elements;
    dropArea.innerHTML = `
        <i class="fas fa-file-image fa-3x"></i>
        <p>拖放文件到这里 或 <label for="file-input">选择文件</label></p>
    `;
}
