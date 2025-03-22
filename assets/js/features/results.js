/**
 * 初始化结果展示功能
 */
export function initResults() {
    // 将模块实例保存到全局app对象
    window.app.modules.results = {
        updateUrlResults
    };
}

/**
 * 更新URL结果，根据选中的预览图片
 */
export function updateUrlResults() {
    const { urlContent, htmlContent, mdContent } = window.app.elements;
    const { allUploadResults, selectedPreviewIndices } = window.app;

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
