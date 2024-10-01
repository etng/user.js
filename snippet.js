
    // jsPDF base64 源代码
    const jsPdfBase64 = ` `.trim();

    // 动态加载 jsPDF
    if (typeof window.jspdf === 'undefined') {
        await loadJsPdfAsync(jsPdfBase64);
    }
    async function loadJsPdfAsync(base64Code) {
        return new Promise((resolve, reject) => {
            const jsPdfCode = atob(base64Code);
            const blob = new Blob([jsPdfCode], { type: 'application/javascript' });
            const script = document.createElement('script');
            script.src = URL.createObjectURL(blob);
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
