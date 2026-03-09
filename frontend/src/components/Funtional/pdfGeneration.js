import { generateAndSavePDF, generateAndSaveDOCX } from './PDF/pdfGenerator';
import { SectionTable } from './PDF/pdfComponents';
import { ContentRenderer } from './markdownParser';

// Export the main PDF generation function
export { generateAndSavePDF, generateAndSaveDOCX };

// Export the SectionTable component for direct usage
export { SectionTable };

// Export the ContentRenderer for table formatting
export { ContentRenderer };
