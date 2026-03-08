import React from 'react';

interface LoaderProps {
    color?: string;
    size?: string;
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({
    color = '#ffffff',
    size = '65px',
    className = ''
}) => {
    return (
        <div
            className={`loader ${className}`}
            style={{
                '--loader-color': color,
                width: size,
            } as React.CSSProperties}
        />
    );
};

export default Loader;
