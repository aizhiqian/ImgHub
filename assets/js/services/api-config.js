/**
 * API配置对象，包含各上传接口的配置信息
 */
export const apiConfigs = {
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
