// ==UserScript==
// @name         网页图片下载器
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  下载网页中的图片
// @match        https://mp.weixin.qq.com/s/*
// @require     https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(async function() {
    'use strict';

    // 创建按钮和样式
    const btnDownloadImages = createButton('下载图片');
    const btnDownloadPdf = createButton('下载为PDF');
    const qrCodeImg = document.createElement('img');
    qrCodeImg.src = 'https://github.com/etng/user.js/raw/main/appraise.jpg'; // 替换为二维码图片的实际URL
    qrCodeImg.style.width = '100px';
    qrCodeImg.style.height = '100px';
    const downloadBtnContainer = document.createElement('div');

    // 按钮容器的样式设置
    Object.assign(downloadBtnContainer.style, {
        position: 'fixed',
        right: '50px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        color: '#000',
        border: '1px solid #007bff',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        zIndex: '1000',
        display: 'none',
        flexDirection: 'column',
        alignItems: 'center'
    });

    const toggleBtn = document.createElement('div');
    toggleBtn.innerText = '工具';
    Object.assign(toggleBtn.style, {
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: '1px solid #fff',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        zIndex: '1001' // 确保比 downloadBtnContainer 更高的 z-index
    });

    // 将按钮和二维码图片添加到容器
    downloadBtnContainer.appendChild(btnDownloadImages);
    downloadBtnContainer.appendChild(btnDownloadPdf);
    downloadBtnContainer.appendChild(qrCodeImg);

    // 将容器和切换按钮添加到页面
    document.body.appendChild(toggleBtn);
    document.body.appendChild(downloadBtnContainer);

    // 添加切换功能
    toggleBtn.addEventListener('click', () => {
        downloadBtnContainer.style.display = (downloadBtnContainer.style.display === 'none' || !downloadBtnContainer.style.display) ? 'flex' : 'none';
    });

    // 创建基本样式对象
    const baseStyle = {
        position: 'fixed',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        padding: '10px',
        zIndex: '1002', // 确保比 toggleBtn 更高的 z-index
        display: 'none'
    };

    // 错误提示元素
    const errorDiv = document.createElement('div');
    Object.assign(errorDiv.style, baseStyle, { backgroundColor: 'red' });
    document.body.appendChild(errorDiv);

    // 信息提示元素
    const infoDiv = document.createElement('div');
    Object.assign(infoDiv.style, baseStyle, { backgroundColor: 'blue' });
    document.body.appendChild(infoDiv);

    // 显示错误提示
    function showError(message) {
        errorDiv.innerText = message;
        errorDiv.style.display = 'block';
        setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
    }

    // 显示信息提示
    function showInfo(message) {
        infoDiv.innerText = message;
        infoDiv.style.display = 'block';
        setTimeout(() => { infoDiv.style.display = 'none'; }, 5000);
    }

    // 创建按钮的函数
    function createButton(text) {
        const btn = document.createElement('button');
        btn.innerText = text;
        Object.assign(btn.style, {
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'block',
            marginBottom: '10px'
        });
        return btn;
    }

    // 获取当前时间并格式化
    function getFormattedTime() {
        const now = new Date();
        return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}` +
               `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    }

    // 获取活动名称
    function getActivityName() {
        const activityNameNode = document.getElementById('activity-name');
        return activityNameNode ? activityNameNode.innerText.trim() : document.title.trim();
    }

    // 获取图片下载链接
    function getDownloadLinks() {
        const pageContent = document.getElementById('page-content');
        if (!pageContent) {
            showError('找不到 id 为 page-content 的元素');
            return [];
        }

        const images = Array.from(pageContent.querySelectorAll('img'));
        if (images.length === 0) {
            showError('没有找到图片元素');
            return [];
        }

        const downloadLinks = [];
        images.forEach((img) => {
            const src = img.getAttribute('data-src') || img.getAttribute('src');
            if (src) {
                const match = src.match(/\/sz_mmbiz_(\w+)\//);
                if (match && match[1]) {
                    downloadLinks.push({ url: src, extension: match[1] });
                } else {
                    showInfo(`无法从地址提取文件后缀: ${src}`);
                }
            } else {
                showInfo('图片元素缺少有效的 src 或 data-src 属性');
            }
        });

        return downloadLinks;
    }

    // 下载图片的函数
    async function downloadImages() {
        const formattedTime = getFormattedTime();
        const activityName = getActivityName();
        const downloadLinks = getDownloadLinks();

        if (downloadLinks.length === 0) return;

        for (let i = 0; i < downloadLinks.length; i++) {
            setTimeout(async () => {
                try {
                    const response = await fetch(downloadLinks[i].url);
                    if (!response.ok) throw new Error(`网络响应失败: ${response.statusText}`);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${activityName}_${formattedTime}_${i + 1}.${downloadLinks[i].extension}`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showInfo(`下载图片: ${activityName}_${formattedTime}_${i + 1}.${downloadLinks[i].extension}`);
                } catch (error) {
                    showError(`下载图片时发生错误: ${error.message}`);
                }
            }, i * 1000);
        }

        showInfo('图片下载链接已生成并开始下载');
    }

    // 下载PDF的函数
    async function downloadPdf() {
        if (typeof window.jspdf === 'undefined') {
            // 如果 window.jspdf 仍然未定义，动态加载一次脚本
            await loadJsPdfAsync(jsPdfBase64);
        }
        await proceedWithPdfDownload();
    }


    async function proceedWithPdfDownload() {
        const { jsPDF } = window.jspdf;
        const formattedTime = getFormattedTime();
        const activityName = getActivityName();
        const downloadLinks = getDownloadLinks();

        if (downloadLinks.length === 0) return;

        const pdfDoc = new jsPDF();
        let firstPage = true;

        for (let i = 0; i < downloadLinks.length; i++) {
            try {
                const response = await fetch(downloadLinks[i].url);
                if (!response.ok) throw new Error(`网络响应失败: ${response.statusText}`);
                const blob = await response.blob();
                const base64 = await blobToBase64(blob);

                if (!firstPage) {
                    pdfDoc.addPage();
                }

                pdfDoc.addImage(base64, 'JPEG', 10, 10, 190, 0);
                firstPage = false;
                showInfo(`处理图片: ${activityName}_${formattedTime}_${i + 1}.${downloadLinks[i].extension}`);
            } catch (error) {
                showError(`下载图片时发生错误: ${error.message}`);
            }
        }
        pdfDoc.save(`${activityName}_${formattedTime}.pdf`);
        showInfo('图片下载PDF已生成并开始下载');
    }

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // 按钮点击事件处理函数
    btnDownloadImages.addEventListener('click', async () => {
        btnDownloadImages.disabled = true; // 禁用按钮
        await downloadImages();
        btnDownloadImages.disabled = false; // 所有操作完成后重新启用按钮
    });

    btnDownloadPdf.addEventListener('click', async () => {
        btnDownloadPdf.disabled = true; // 禁用按钮
        await downloadPdf();
        btnDownloadPdf.disabled = false; // 所有操作完成后重新启用按钮
    });

})();