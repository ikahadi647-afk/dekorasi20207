export interface PDFBlobOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    pagebreak?: any;
    windowWidth?: number;
    scale?: number;
}

export const generatePDFBlob = async (
    elementId: string,
    filename: string,
    options?: PDFBlobOptions
): Promise<Blob> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id ${elementId} not found`);
    }

    const opt: any = {
        // Sensible default margins for A4
        margin: options?.margin !== undefined ? options.margin : [6, 8, 6, 8],
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
            // html2canvas scale: balance quality and performance
            scale: options?.scale || 1.5,
            useCORS: true,
            logging: false,
            // html2canvas window width for rendering (closer to A4 at 1024)
            windowWidth: options?.windowWidth || 1024,
            onclone: (clonedDoc: any) => {
                const el = clonedDoc.getElementById(elementId);
                if (el) {
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                    el.style.transform = 'none';
                    el.style.width = '100%';
                    el.style.maxWidth = '100%';
                    el.style.minWidth = '0';
                    el.style.margin = '0';
                    el.style.boxSizing = 'border-box';
                    el.style.boxShadow = 'none';
                    el.classList.add('force-desktop');
                    
                    const parent = el.parentElement;
                    if (parent) {
                        parent.style.opacity = '1';
                        parent.style.visibility = 'visible';
                    }
                }
                // Make sure modal wrappers or other ancestors that limit height/overflow
                // are relaxed in the cloned document so the whole document can be
                // measured and paginated by html2pdf/html2canvas.
                try {
                    clonedDoc.body.style.height = 'auto';
                    clonedDoc.body.style.overflow = 'visible';
                } catch (e) {}

                const wrappers = clonedDoc.querySelectorAll('.pdf-page-wrapper, .modal-content-area, [class*="max-h-"]');
                wrappers.forEach((w: HTMLElement) => {
                    try {
                        w.style.maxHeight = 'none';
                        w.style.height = 'auto';
                        w.style.overflow = 'visible';
                        w.style.boxShadow = 'none';
                    } catch (e) {}
                });
                const container = clonedDoc.querySelector('.html2pdf__container');
                if (container) {
                    container.style.boxSizing = 'border-box';
                    container.style.overflow = 'visible';
                }
                // Inject print helper CSS into cloned document to improve page-break behavior
                try {
                    const style = clonedDoc.createElement('style');
                    style.type = 'text/css';
                    style.appendChild(clonedDoc.createTextNode(`
                        .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
                        .section-title { page-break-after: avoid; page-break-inside: avoid; break-after: avoid; break-inside: avoid; }
                        .contract-document { width: 100% !important; max-width: 100% !important; }
                        .html2pdf__container { overflow: visible !important; }
                        p, li { orphans: 2; widows: 2; }
                    `));
                    clonedDoc.head.appendChild(style);
                } catch (e) {}
                const padDivs = clonedDoc.querySelectorAll('tbody > div');
                padDivs.forEach((div: HTMLElement) => {
                    const tr = clonedDoc.createElement('tr');
                    tr.className = 'html2pdf-pad-row';
                    tr.style.border = 'none';
                    tr.style.background = 'transparent';
                    const td = clonedDoc.createElement('td');
                    td.colSpan = 10;
                    td.style.height = div.style.height || `${div.offsetHeight}px`;
                    td.style.border = 'none';
                    td.style.padding = '0';
                    td.style.margin = '0';
                    td.style.background = 'transparent';
                    tr.appendChild(td);
                    if (div.parentNode) {
                        div.parentNode.replaceChild(tr, div);
                    }
                });
            }
        },
        // Try legacy page-break algorithm which can handle complex layouts better
        // and instruct a 'before' break for section titles so headings do not get orphaned.
        pagebreak: options?.pagebreak || { mode: ['legacy'], before: ['.section-title'], avoid: ['tr', '.avoid-break', 'thead', 'tbody'] },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    const html2pdfModule: any = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;
    const worker = html2pdf().from(element).set(opt);
    const blob: Blob = await worker.output('blob');
    return blob;
};
