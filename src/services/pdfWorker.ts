import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to the requested CDN URL to avoid bundling/CSP issues
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

export default pdfjsLib;
