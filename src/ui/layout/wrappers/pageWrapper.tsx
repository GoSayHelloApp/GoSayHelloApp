import React, { ReactNode, useEffect } from 'react';
import ScreenLoader from '../../components/core/screenLoader';


interface FullPageWrapperProps {
    children: ReactNode;
    isLoading: boolean;
}

const PageWrapper: React.FC<FullPageWrapperProps> = ({ children, isLoading }) => {
    if (isLoading) {
        return <ScreenLoader />;
    }
    return <>{children}</>;
};

export default PageWrapper;
