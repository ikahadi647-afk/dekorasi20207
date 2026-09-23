import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface DocumentPdfViewerProps {
    pdfBlob: Blob;
}

export const DocumentPdfViewer: React.FC<DocumentPdfViewerProps> = ({ pdfBlob }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [numPages, setNumPages] = useState<number>(0);

    useEffect(() => {
        const loadPdf = async () => {
            const url = URL.createObjectURL(pdfBlob);
            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            setNumPages(pdf.numPages);

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context!,
                    viewport: viewport,
                };
                await page.render(renderContext).promise;
                
                // Append canvas to container
                if (canvasRef.current) {
                    canvasRef.current.parentElement?.appendChild(canvas);
                }
            }
        };

        loadPdf();
        return () => {
            // Cleanup
        };
    }, [pdfBlob]);

    return (
        <div className="flex flex-col items-center p-4">
            <div ref={canvasRef} className="shadow-lg" />
        </div>
    );
};
