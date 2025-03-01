document.addEventListener('DOMContentLoaded', function() {
    // 页面元素
    const fileForm = document.getElementById('file-form');
    const fileInput = document.getElementById('file-input');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    const dropArea = document.getElementById('drop-area');
    const loading = document.getElementById('loading');
    const selectedFilesContainer = document.getElementById('selected-files');
    const uploadCount = document.getElementById('upload-count');
    const totalCount = document.getElementById('total-count');
    const apiSelect = document.getElementById('api-select');
    const previewContainer = document.getElementById('preview-container');

    // URL结果面板元素
    const urlContent = document.getElementById('url-content');
    const htmlContent = document.getElementById('html-content');
    const mdContent = document.getElementById('md-content');
    const urlTabs = document.querySelectorAll('.url-tab');

    // 保存所有上传结果
    let allUploadResults = [];
    // 修改为数组，存储多个选中的索引
    let selectedPreviewIndices = [];

    // 存储选择的文件
    let selectedFiles = [];

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

    // 监听页面粘贴事件
    document.addEventListener('paste', function(e) {
        const clipboardData = e.clipboardData || window.clipboardData;

        if (clipboardData && clipboardData.items) {
            const items = clipboardData.items;
            const imageFiles = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    if (file) {
                        imageFiles.push(file);
                    }
                }
            }

            if (imageFiles.length > 0) {
                selectedFiles = [...selectedFiles, ...imageFiles];
                updateSelectedFilesUI();
                uploadFileBtn.disabled = false;
            }
        }
    });

    // API 配置
    const apiConfigs = {
        alibaba: {
            name: '阿里巴巴',
            url: 'https://api.ilingku.com/int/v1/image.alibaba',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        jingdong: {
            name: '京东',
            url: 'https://api.xinyew.cn/api/jdtc',
            processResponse: function(data) {
                if (data.errno === 0 && data.data) {
                    return {
                        success: true,
                        url: data.data.url,
                        message: data.message || '上传成功',
                        fileName: data.data.fileName
                    };
                } else {
                    return {
                        success: false,
                        message: data.message || '上传失败'
                    };
                }
            }
        },
        netease: {
            name: '网易严选',
            url: 'https://api.ilingku.com/int/v1/image.you163',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        tc58: {
            name: '58同城',
            url: 'https://api.ilingku.com/int/v1/image.58',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        qh360: {
            name: '奇虎360',
            url: 'https://api.ilingku.com/int/v1/image.360',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        yidianzixun: {
            name: '一点资讯',
            url: 'https://api.ilingku.com/int/v1/image.yidianzixun',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        huaban: {
            name: '花瓣网',
            url: 'https://api.ilingku.com/int/v1/image.huaban',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        sohu: {
            name: '搜狐网',
            url: 'https://api.ilingku.com/int/v1/image.sohu',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        tcl: {
            name: 'TCL集团',
            url: 'https://api.ilingku.com/int/v1/image.tcl',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        huilian: {
            name: '中科汇联',
            url: 'https://api.ilingku.com/int/v1/image.huilian',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        aippt: {
            name: 'AIPPT',
            url: 'https://api.ilingku.com/int/v1/image.aippt',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        qiantu: {
            name: '千图网',
            url: 'https://api.ilingku.com/int/v1/image.58pic',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        psbc: {
            name: '中国邮政',
            url: 'https://api.ilingku.com/int/v1/image.psbc',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        bankcomm: {
            name: '交通银行',
            url: 'https://api.ilingku.com/int/v1/image.bankcomm',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        cbern: {
            name: '智慧教育',
            url: 'https://api.ilingku.com/int/v1/image.cbern',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        xiaoice: {
            name: '召唤小冰',
            url: 'https://api.ilingku.com/int/v1/image.xiaoice',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
        chaoxing: {
            name: '超星数字',
            url: 'https://api.ilingku.com/int/v1/image.chaoxing',
            processResponse: function(data) {
                if (data.code === 200) {
                    return {
                        success: true,
                        url: data.url,
                        message: data.msg || '上传成功'
                    };
                } else {
                    return {
                        success: false,
                        message: data.msg || '上传失败'
                    };
                }
            }
        },
    };

    // 文件选择
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            // 将FileList转换为数组并过滤掉非图片文件
            const newFiles = Array.from(fileInput.files).filter(file => file.type.startsWith('image/'));

            if (newFiles.length > 0) {
                // 添加到已选文件列表
                selectedFiles = [...selectedFiles, ...newFiles];
                updateSelectedFilesUI();
                uploadFileBtn.disabled = false;
            }
        }
    });

    // 更新已选文件UI
    function updateSelectedFilesUI() {
        if (selectedFiles.length > 0) {
            selectedFilesContainer.style.display = 'block';
            selectedFilesContainer.innerHTML = '';

            // 更新预览区域
            updatePreviewArea();

            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';

                const fileName = document.createElement('div');
                fileName.className = 'file-name';
                fileName.textContent = file.name;

                const fileSize = document.createElement('div');
                fileSize.className = 'file-size';
                fileSize.textContent = formatFileSize(file.size);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-file';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.dataset.index = index;
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

            previewContainer.innerHTML = `
                <div class="empty-preview">
                    <i class="fas fa-images fa-2x"></i>
                    <p>添加图片后将显示预览</p>
                </div>
            `;
        }
    }

    // 更新预览区域
    function updatePreviewArea() {
        // 清空预览区域
        previewContainer.innerHTML = '';

        // 为每个选定的文件创建预览
        selectedFiles.forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.dataset.index = index;

            // 如果当前项已被选中，添加selected类
            if (selectedPreviewIndices.includes(index)) {
                previewItem.classList.add('selected');
            }

            // 创建图片预览
            const img = document.createElement('img');
            const fileUrl = URL.createObjectURL(file);
            img.src = fileUrl;
            img.onload = function() {
                URL.revokeObjectURL(fileUrl);
            };

            // 文件名显示
            const fileName = document.createElement('div');
            fileName.className = 'file-name';

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
                const selectedIndex = selectedPreviewIndices.indexOf(clickedIndex);

                if (selectedIndex === -1) {
                    // 如果不在选中列表中，则添加
                    selectedPreviewIndices.push(clickedIndex);
                    this.classList.add('selected');
                } else {
                    // 如果已经在选中列表中，则移除（取消选择）
                    selectedPreviewIndices.splice(selectedIndex, 1);
                    this.classList.remove('selected');
                }

                // 更新URL结果显示
                updateUrlResults();
            });

            previewContainer.appendChild(previewItem);
        });
    }

    // 更新URL结果，根据选中的预览图片
    function updateUrlResults() {
        if (!allUploadResults || allUploadResults.length === 0) {
            return; // 没有上传结果，不做任何处理
        }

        // 清空之前的URL结果
        urlContent.value = '';
        htmlContent.value = '';
        mdContent.value = '';

        // 按照原始文件顺序排序allUploadResults
        const sortedResults = [...allUploadResults].sort((a, b) => a.index - b.index);

        // 如果没有选中任何预览图片，则显示所有结果
        if (selectedPreviewIndices.length === 0) {
            const urlResults = sortedResults.map(result => result.url);
            const htmlResults = sortedResults.map(result =>
                `<img src="${result.url}" alt="${result.fileName}" />`);
            const mdResults = sortedResults.map(result =>
                `![${result.fileName}](${result.url})`);

            urlContent.value = urlResults.join('\n');
            htmlContent.value = htmlResults.join('\n');
            mdContent.value = mdResults.join('\n');
        } else {
            // 只显示选中图片的结果
            const selectedResults = selectedPreviewIndices
                .map(index => allUploadResults.find(result => result.index === index))
                .filter(Boolean);

            if (selectedResults.length > 0) {
                const urlResults = selectedResults.map(result => result.url);
                const htmlResults = selectedResults.map(result =>
                    `<img src="${result.url}" alt="${result.fileName}" />`);
                const mdResults = selectedResults.map(result =>
                    `![${result.fileName}](${result.url})`);

                urlContent.value = urlResults.join('\n');
                htmlContent.value = htmlResults.join('\n');
                mdContent.value = mdResults.join('\n');
            }
        }
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // 拖放文件功能
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            // 过滤出图片文件
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

            if (imageFiles.length > 0) {
                // 添加到已选文件列表
                selectedFiles = [...selectedFiles, ...imageFiles];
                updateSelectedFilesUI();
                uploadFileBtn.disabled = false;
            }
        }
    }

    // 点击拖放区域触发文件选择
    dropArea.addEventListener('click', function() {
        fileInput.click();
    });

    // 重置拖放区域
    function resetDropArea() {
        dropArea.innerHTML = `
            <i class="fas fa-file-image fa-3x"></i>
            <p>拖放文件到这里 或 <label for="file-input">选择文件</label></p>
        `;
    }

    // 文件上传表单提交
    fileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (selectedFiles.length > 0) {
            uploadMultipleImages(selectedFiles);
        }
    });

    // 获取当前选择的API配置
    function getCurrentApi() {
        const apiKey = apiSelect.value;
        return apiConfigs[apiKey];
    }

    // 通过文件上传多个图片
    async function uploadMultipleImages(files) {
        showLoading(files.length);

        // 重置选中的预览索引为空数组
        selectedPreviewIndices = [];

        // 获取当前选择的API
        const api = getCurrentApi();

        // 重置计数器
        let successCount = 0;
        totalCount.textContent = files.length;
        uploadCount.textContent = '0';

        const results = [];
        allUploadResults = []; // 重置上传结果

        // 逐个上传图片，但不等待每个上传完成再开始下一个
        const uploadPromises = files.map(async (file, index) => {
            try {
                const result = await uploadSingleImage(file, api);
                results.push({ file, result, success: true });

                // 添加到全局上传结果集合
                allUploadResults.push({
                    url: result.url,
                    fileName: file.name,
                    index: index
                });

                successCount++;
                uploadCount.textContent = successCount;
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
            updateUrlResults();

            // 重新初始化剪贴板
            new ClipboardJS('.copy-all-btn');

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
                selectedFiles = [];
                updateSelectedFilesUI();
            }
            uploadFileBtn.disabled = true;
        } else {
            alert('所有图片上传失败');
        }
    }

    // 上传单个图片
    function uploadSingleImage(file, api) {
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
                    resolve(processedResponse);
                } else {
                    reject(new Error(processedResponse.message || '上传失败'));
                }
            })
            .catch(error => reject(error));
        });
    }

    // 显示加载中
    function showLoading(total) {
        loading.style.display = 'flex';
        if (total > 1) {
            uploadCount.textContent = '0';
            totalCount.textContent = total;
            document.getElementById('upload-progress').style.display = 'block';
        } else {
            document.getElementById('upload-progress').style.display = 'none';
        }
    }

    // 隐藏加载中
    function hideLoading() {
        loading.style.display = 'none';
    }

    // 为复制按钮添加点击反馈
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.copy-all-btn');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> 已复制';
            button.classList.add('success');

            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('success');
            }, 2000);
        }
    });
});
