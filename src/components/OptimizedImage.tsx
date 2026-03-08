import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    loading?: "lazy" | "eager";
    width?: string | number;
    height?: string | number;
}

export default function OptimizedImage({ src, alt, className, ...props }: OptimizedImageProps) {
    // Helper to convert images to webp natively if they come from CDNs like Unsplash
    let webpSrc = src;

    if (src && src.includes('unsplash.com')) {
        webpSrc = src.includes('?') ? `${src}&fm=webp&q=80` : `${src}?fm=webp&q=80`;
    }

    return (
        <picture className="w-full h-full block">
            {webpSrc !== src && <source srcSet={webpSrc} type="image/webp" />}
            <img
                src={src}
                alt={alt}
                className={className}
                loading="lazy"
                decoding="async"
                {...props}
            />
        </picture>
    );
}
