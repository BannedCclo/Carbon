import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './LoadingContext.module.css';

interface LoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loadingCount, setLoadingCount] = useState(0);

    const startLoading = () => {
        setLoadingCount(prev => prev + 1);
    };

    const stopLoading = () => {
        setLoadingCount(prev => Math.max(0, prev - 1));
    };

    const isLoading = loadingCount > 0;

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loader}>
                        <div className={styles.spinner}></div>
                        <p>Carregando...</p>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
