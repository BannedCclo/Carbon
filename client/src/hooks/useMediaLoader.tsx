import { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';

export const useMediaLoader = (imageUrls: string[] = [], videoUrls: string[] = []) => {
    const { startLoading, stopLoading } = useLoading();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Only run if there's actually media to load
        if (imageUrls.length === 0 && videoUrls.length === 0) {
            setIsLoaded(true);
            return;
        }

        let isMounted = true;
        startLoading();

        const loadImages = imageUrls.map(url => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve();
                img.onerror = () => {
                    console.warn(`Failed to preload image: ${url}`);
                    resolve(); // Resolve anyway to not block the whole page
                };
            });
        });

        const loadVideos = videoUrls.map(url => {
            return new Promise<void>((resolve) => {
                const video = document.createElement('video');
                video.preload = 'auto';
                video.src = url;

                // For videos, 'canplaythrough' means it has downloaded enough to play to the end without stopping
                // We also add a timeout just in case it takes too long so the user isn't stuck natively forever
                let timeoutId: NodeJS.Timeout;

                const handleLoaded = () => {
                    clearTimeout(timeoutId);
                    resolve();
                };

                const handleError = () => {
                    clearTimeout(timeoutId);
                    console.warn(`Failed to preload video: ${url}`);
                    resolve(); // Resolve anyway
                };

                video.addEventListener('canplaythrough', handleLoaded, { once: true });
                video.addEventListener('error', handleError, { once: true });

                // Force load
                video.load();

                // 15 seconds timeout fallback
                timeoutId = setTimeout(() => {
                    console.warn(`Video load timeout: ${url}`);
                    video.removeEventListener('canplaythrough', handleLoaded);
                    video.removeEventListener('error', handleError);
                    resolve();
                }, 15000);
            });
        });

        Promise.all([...loadImages, ...loadVideos])
            .then(() => {
                if (isMounted) {
                    setIsLoaded(true);
                    stopLoading();
                }
            })
            .catch(() => {
                // Failsafe
                if (isMounted) {
                    setIsLoaded(true);
                    stopLoading();
                }
            });

        return () => {
            isMounted = false;
            // We want to stop loading if the component unmounts before loading finishes
            if (!isLoaded) {
                stopLoading();
            }
        };
        // Exclude stopLoading and startLoading since they shouldn't trigger re-runs, and we only want to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageUrls.join(','), videoUrls.join(',')]);

    return isLoaded;
};
