import { formatFileSize } from '../utils/format.js';
import { createElement } from '../utils/dom.js';
import { resetDropArea } from './dropzone.js';

/**
 * 初始化图片预览功能
 */
export function initPreview() {
    // 将模块实例保存到全局app对象
    window.app.modules.preview = {
        updateSelectedFilesUI,
        updatePreviewArea
    };
}

/**
 * 更新已选文件UI
 */
export function updateSelectedFilesUI() {
    const { selectedFilesContainer, dropArea, fileInput, uploadFileBtn } = window.app.elements;
    const { selectedFiles } = window.app;

    if (selectedFiles.length > 0) {
        selectedFilesContainer.style.display = 'block';
        selectedFilesContainer.innerHTML = '';

        // 更新预览区域
        updatePreviewArea();

        selectedFiles.forEach((file, index) => {
            const fileItem = createElement('div', { className: 'file-item' });

            const fileName = createElement('div', { className: 'file-name' }, file.name);

            const fileSize = createElement('div', { className: 'file-size' }, formatFileSize(file.size));

            const removeBtn = createElement('button', {
                className: 'remove-file',
                dataset: { index: index }
            }, '', [
                createElement('i', { className: 'fas fa-times' })
            ]);

            removeBtn.addEventListener('click', function() {
                selectedFiles.splice(parseInt(this.dataset.index), 1);
                updateSelectedFilesUI();

                if (selectedFiles.length === 0) {
                    uploadFileBtn.disabled = true;
                    selectedFilesContainer.style.display = 'none';
                    resetDropArea();
                    fileInput.value = '';
                }
            });

            fileItem.appendChild(fileName);
            fileItem.appendChild(fileSize);
            fileItem.appendChild(removeBtn);
            selectedFilesContainer.appendChild(fileItem);
        });

        dropArea.innerHTML = `<i class="fas fa-file-image fa-3x"></i><p>已选择 ${selectedFiles.length} 个文件，点击继续添加</p>`;
    } else {
        selectedFilesContainer.style.display = 'none';
        resetDropArea();
        fileInput.value = '';

        window.app.elements.previewContainer.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-images fa-2x"></i>
                <p>添加图片后将显示预览</p>
            </div>
        `;
    }
}

/**
 * 更新预览区域
 */
export function updatePreviewArea() {
    const { previewContainer } = window.app.elements;
    const { selectedFiles, selectedPreviewIndices } = window.app;

    // 清空预览区域
    previewContainer.innerHTML = '';

    // 为每个选定的文件创建预览
    selectedFiles.forEach((file, index) => {
        const previewItem = createElement('div', {
            className: 'preview-item' + (selectedPreviewIndices.includes(index) ? ' selected' : ''),
            dataset: { index: index }
        });

        // 创建图片预览
        const img = createElement('img');
        const fileUrl = URL.createObjectURL(file);
        img.src = fileUrl;
        img.onload = function() {
            URL.revokeObjectURL(fileUrl);
        };

        // 文件名显示
        const fileName = createElement('div', { className: 'file-name' });

        // 如果文件名过长则截断显示
        if (file.name.length > 15) {
            const extension = file.name.split('.').pop();
            const truncatedName = file.name.substring(0, 12) + '...' + extension;
            fileName.textContent = truncatedName;
            fileName.title = file.name; // 鼠标悬停显示完整文件名
        } else {
            fileName.textContent = file.name;
        }

        previewItem.appendChild(img);
        previewItem.appendChild(fileName);

        // 修改点击事件实现多选功能
        previewItem.addEventListener('click', function() {
            const clickedIndex = parseInt(this.dataset.index);

            // 检查当前索引是否已经在选中列表中
            const selectedIndex = window.app.selectedPreviewIndices.indexOf(clickedIndex);

            if (selectedIndex === -1) {
                // 如果不在选中列表中，则添加
                window.app.selectedPreviewIndices.push(clickedIndex);
                this.classList.add('selected');
            } else {
                // 如果已经在选中列表中，则移除（取消选择）
                window.app.selectedPreviewIndices.splice(selectedIndex, 1);
                this.classList.remove('selected');
            }

            // 更新URL结果显示
            window.app.modules.results.updateUrlResults();

            // 添加点击波纹效果
            this.style.animation = 'none';
            this.offsetHeight; // 触发重绘

            if (this.classList.contains('selected')) {
                this.style.animation = 'select-pulse 0.8s ease';
            }
        });

        previewContainer.appendChild(previewItem);
    });
}
