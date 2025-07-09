document.addEventListener('DOMContentLoaded', function() {

    const copySuccessToast = document.getElementById('copySuccessToast');
    const toastBodyMessage = document.getElementById('toastBodyMessage');

    document.body.addEventListener('click', async function(event) {
        const clickedButton = event.target.closest('.copy-btn');

        if (clickedButton) {
            const textToCopy = clickedButton.dataset.code;

            if (toastBodyMessage) {
                toastBodyMessage.textContent = `${textToCopy} 複製成功`;
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    $(copySuccessToast).toast('show');
                } catch (err) {
                    console.error('使用 Clipboard API 複製失敗:', err);
                }
            } else {
                console.warn('瀏覽器不支援 Clipboard API, 爛透了');
            }
        }
    });
});