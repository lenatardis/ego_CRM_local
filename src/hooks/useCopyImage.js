import { useEffect, useState } from "react";

export const useCopyImage = (imgUrl) => {
    const [isImageCopying, setIsImageCopying] = useState(false);
    const [imgData, setImgData] = useState(null);

    const copyImageToClipboard = async () => {
        if (isImageCopying) return;
        try {
            await navigator.clipboard.write(imgData);
        } catch (error) {
            alert(error);
        }
    }

    const fetchImage = async (imgUrl) => {
        try {
            if (!navigator.clipboard || !window.ClipboardItem) {
                console.error('Clipboard API or ClipboardItem is not supported in this browser.');
                return;
            }
            setIsImageCopying(true);
            const response = await fetch(imgUrl);
            if (!response.ok) {
                console.error('Failed to fetch the image:', response.statusText);
                setIsImageCopying(true);
                return;
            }
            const contentType = response.headers.get('Content-Type');
            const blob = await response.blob();

            if (contentType.startsWith('image')) {
                if (contentType !== 'image/png') {
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);

                    img.onload = async () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);

                        canvas.toBlob(async (pngBlob) => {
                            if (!pngBlob) {
                                console.error('Failed to create PNG blob');
                                return;
                            }

                            const data = [new ClipboardItem({ 'image/png': pngBlob })];
                            setImgData(data);
                        }, 'image/png');
                    };

                    img.onerror = () => {
                        console.error('Failed to load image for conversion.');
                    };
                } else {
                    const data = [new ClipboardItem({ [contentType]: blob })];
                    setImgData(data);
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsImageCopying(false);
        }
    }

    useEffect(() => {
        if (imgUrl) {
            fetchImage(imgUrl);
        }
    }, [imgUrl]);

    return { isImageCopying, copyImageToClipboard };
}
