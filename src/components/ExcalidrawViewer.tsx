import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import React, { useEffect, useState, Suspense, useRef } from 'react';
import './ExcalidrawViewer.css';

const ExcalidrawViewer: React.FC<{ src: string }> = ({ src }) => {
    const [isActive, setIsActive] = useState(false);
    const [Excalidraw, setExcalidraw] = useState(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [svgContent, setSvgContent] = useState('');
    const [darkMode, setDarkMode] = useState(true);

    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        setDarkMode(mediaQuery.matches);

        const handleColorSchemeChange = (e: MediaQueryListEvent) => {
            setDarkMode(e.matches);
        };

        mediaQuery.addEventListener('change', handleColorSchemeChange);

        return () => mediaQuery.removeEventListener('change', handleColorSchemeChange);
    }, []);

    useEffect(() => {
        const fetchSvg = async () => {
            try {
                const response = await fetch(src);
                let svgText = await response.text();
                svgText = updateSVGFontPath(svgText);
                setSvgContent(svgText);
            } catch (error) {
                console.error('Error fetching SVG:', error);
            }
        };

        fetchSvg();
    }, [src]);

    useEffect(() => {
        const loadScene = async () => {
            if (isActive && svgContent && excalidrawAPI) {
                try {
                    const api = excalidrawAPI as ExcalidrawImperativeAPI;

                    
                    const blob = new Blob([svgContent], {type: 'image/svg+xml'})
                    const loadFromBlob = (await import('@excalidraw/excalidraw')).loadFromBlob;

                    const state = api.getAppState();
                    const scene = await loadFromBlob(blob, state, null);
                    api.updateScene(scene);
                } catch (error) {
                    console.error('Error loading image into Excalidraw:', error);
                }
            }
        };

        const load = async () => {
            if (isActive) {
                const excalidraw = await import('@excalidraw/excalidraw');
                setExcalidraw(() => excalidraw.Excalidraw);
                await loadScene();
            }
        }
        load();
    }, [isActive, excalidrawAPI]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentRect.width && entry.contentRect.height) {
                    setImageDimensions({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height
                    });
                }
            }
        });

        if (imageRef.current) {
            resizeObserver.observe(imageRef.current);
        }

        return () => {
            if (imageRef.current) {
                resizeObserver.unobserve(imageRef.current);
            }
        };
    }, [imageRef]);

    const handleImageClick = () => {
        setIsActive(true);
    };

    const containerStyle = {
        width: '100%',
        height: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };


    const excalidrawStyle = isActive ? {
        width: imageDimensions.width,
        height: imageDimensions.height
    } : {};

    const updateSVGFontPath = (svgContent: string) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(svgContent, "image/svg+xml");

        const styleElement = xmlDoc.querySelector(".style-fonts");
        if (styleElement && styleElement.textContent != null) {
            styleElement.textContent = styleElement.textContent.replace(
                /font-family: "Virgil";\s*src: url\("https:\/\/file%2B\.vscode-resource\.vscode-cdn\.net\/[^\)]+"\)/,
                'font-family: "Virgil"; src: url("/fonts/Virgil.woff2")'
            );

            styleElement.textContent = styleElement.textContent.replace(
                /font-family: "Cascadia";\s*src: url\("https:\/\/file%2B\.vscode-resource\.vscode-cdn\.net\/[^\)]+"\)/,
                'font-family: "Cascadia"; src: url("/fonts/Cascadia.woff2")'
            );
        }


        // Set SVG dimensions to 100%
        const svgElement = xmlDoc.querySelector('svg');
        if (svgElement) {
            svgElement.setAttribute('width', '100%');
        }

        return new XMLSerializer().serializeToString(xmlDoc);
    };


    return (
        <>
            {isActive && Excalidraw && src ? (
                <Suspense fallback={
                    <div
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                        className="svg"
                        style={containerStyle}
                        ref={imageRef}
                    />
                }>
                    <div style={excalidrawStyle} className="custom" >
                        <Excalidraw
                            theme={darkMode ? 'dark' : 'light'}
                            excalidrawAPI={(api: React.SetStateAction<null>) => setExcalidrawAPI(api)}
                        />
                    </div>
                </Suspense>
            ) : (
                <div
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    className="svg"
                    style={containerStyle}
                    ref={imageRef}
                    onClick={handleImageClick}
                />
            )}
        </>
    );
};

export default ExcalidrawViewer;