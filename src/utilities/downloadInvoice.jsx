import { jsPDF } from 'jspdf';
import { formatBillingPrice, formatBillingDate } from './billingUtils';
import logger from '../services/logger';
import logoImage from '../../public/logo-black.png';


export const generateAndDownloadInvoice = async (id) => {
  try {
    const apiUrl = `${import.meta.env.VITE_APP_API_HOME_ENDPOINT}/api/billings/${id}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const { billingMeta, billingValidThru, invoiceId } = data;
    const packageName = billingMeta?.stripeMeta?.packageName || billingMeta?.payfastMeta?.packageName || 'TVOD-Invoice';
    const priceInfo = formatBillingPrice(data);
    const originalWidth = 96;
    const originalHeight = 42;
    const aspectRatio = originalWidth / originalHeight;
    // choose width (adjust between 30–35 if needed)
    const logoWidth = 30;
    const logoHeight = logoWidth / aspectRatio;

    const doc = new jsPDF();


        // Header - Invoice title and logo (matching PDF spacing)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(47, 53, 67);
        doc.text('Invoice', 20, 25);

        // Add logo on the right if available
        if (logoImage) {
          const logoSize = 15;
          // doc.addImage(logoImage, 'PNG', 175, 13, 25, 15);
          doc.addImage(logoImage, 'PNG', 175, 13, logoWidth, logoHeight);

        }

        // Invoice details section (proper spacing like PDF)
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);

        // Left column - Invoice details with PDF spacing
        doc.text('Invoice number', 20, 45);
        doc.text('Billed on', 20, 50);
        doc.text('Paid on', 20, 55);
        // doc.text('Figma GB VAT', 20, 60);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(47, 53, 67);
        doc.text(`${invoiceId}`, 50, 45);
        doc.text(`${formatBillingDate(billingValidThru[0]?.subscription_date)}`, 50, 50);
        doc.text(`${formatBillingDate(billingValidThru[0]?.subscription_date)}`, 50, 55);
        // doc.text('GB444658372', 75, 60);

        // Company information section - exact PDF positioning
        const leftCol = 20;
        const midCol = 75;
        const rightCol = 135;
        const startY = 75;

        // From section (Figma) - no header in PDF
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(47, 53, 67);
        doc.text('ARY PLUS', leftCol, startY - 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text('6th Floor Madina City Mall', leftCol, startY);
        doc.text('Abdullah Haroon Rd', leftCol, startY + 6);
        doc.text('Saddar, Karachi 74400', leftCol, startY + 12);
        doc.text('Pakistan', leftCol, startY + 18);
        doc.text('support@aryplus.com', leftCol, startY + 24);
        // doc.text('+1 415-890-5404', leftCol, startY + 36);
        // doc.text('support@aryplus.com', leftCol, startY + 36);

        // Bill to section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        // doc.setTextColor(102, 102, 102);
        doc.setTextColor(47, 53, 67);
        doc.text('Bill to', midCol, startY - 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        // doc.setTextColor(47, 53, 67);
        doc.setTextColor(102, 102, 102);
        // doc.text(`${billingMeta?.billingFullName || "Customer's Name"}`, midCol, startY);
        doc.text(
          `${billingMeta?.billingFullName || billingMeta?.stripeMeta?.email?.split('@')[0] || billingMeta?.payfastMeta?.email?.split('@')[0] || "Customer's Name"}`,
          midCol,
          startY
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text(`${billingMeta?.stripeMeta?.email || billingMeta?.payfastMeta?.email || "Customer's Email"}`, midCol, startY + 6);
        // doc.text('4 Bacon Terrace', midCol, startY + 6);
        // doc.text('Fitzstephen Road', midCol, startY + 12);
        // doc.text('Dagenham', midCol, startY + 18);
        // doc.text('RM8 2NN', midCol, startY + 24);
        // doc.text('United Kingdom', midCol, startY + 30);
        // doc.text(`${billingMeta?.stripeMeta?.email}`, midCol, startY + 36);

        // Ship to section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(47, 53, 67);
        doc.text('Ship to', rightCol, startY - 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(47, 53, 67);
        doc.setTextColor(102, 102, 102);
        doc.text(`${billingMeta?.billingFullName || billingMeta?.stripeMeta?.email?.split('@')[0] || billingMeta?.payfastMeta?.email?.split('@')[0] || "Customer's Name"}`, rightCol, startY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);
        doc.text(`${billingMeta?.stripeMeta?.email || billingMeta?.payfastMeta?.email || "Customer's Email"}`, rightCol, startY + 6);
        // doc.text('4 Bacon Terrace, Fitzstephen Road', rightCol, startY + 6);
        // doc.text('Fitzstephen Road', rightCol, startY + 12);
        // doc.text('DAGENHAM', rightCol, startY + 18);
        // doc.text('RM8 2NN', rightCol, startY + 24);
        // doc.text('United Kingdom', rightCol, startY + 30);

        // Amount due section with PDF spacing
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(18);
        doc.setTextColor(47, 53, 67);
        // doc.text('£76.80 due July 30, 2025', 20, 130);

        doc.text(`Paid ${priceInfo.formatted}`, 20, 120);

        // doc.setFont('helvetica', 'normal');
        // doc.setFontSize(9);
        // doc.setTextColor(41, 98, 255);
        // doc.text('Pay online', 20, 138);

        // Table section with proper PDF spacing
        const tableStartY = 140;

        // Separator line above table header
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(20, tableStartY - 5, 190, tableStartY - 5);

        // Table header
        doc.setTextColor(102, 102, 102);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Description', 20, tableStartY);
        doc.text('Qty', 135, tableStartY);
        doc.text('Unit price', 150, tableStartY);
        // doc.text('Tax', 165, tableStartY);
        doc.text('Amount', 180, tableStartY);

        // Separator line below table header
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(20, tableStartY + 3, 190, tableStartY + 3);

        // Table rows with PDF spacing (15 units between rows)
        let rowY = tableStartY + 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(47, 53, 67);

        // Row 1
        doc.text(`${packageName}`, 20, rowY);
        doc.setTextColor(102, 102, 102);
        doc.setFontSize(8);
        // doc.text('Jul 30 – Aug 30, 2025', 20, rowY + 4);
        doc.text(`${formatBillingDate(billingValidThru[0]?.subscription_date)} - ${formatBillingDate(billingValidThru[0]?.subscription_expiry)}`, 20, rowY + 4);
        doc.setTextColor(47, 53, 67);
        doc.setFontSize(9);
        doc.text('1', 135, rowY);
        doc.text(`${priceInfo.formatted}`, 150, rowY);
        // doc.text('20%', 165, rowY);
        doc.text(`${priceInfo.formatted}`, 180, rowY);

        // Row 2  
        // rowY += 15;
        // doc.text('Professional Dev seats (monthly)', 20, rowY);
        // doc.setTextColor(102, 102, 102);
        // doc.setFontSize(8);
        // doc.text('Jul 30 – Aug 30, 2025', 20, rowY + 4);
        // doc.setTextColor(47, 53, 67);
        // doc.setFontSize(9);
        // doc.text('2', 120, rowY);
        // doc.text('£14.00', 140, rowY);
        // doc.text('20%', 165, rowY);
        // doc.text('£28.00', 180, rowY);

        // Row 3
        // rowY += 15;
        // doc.text('Professional Collab seats (monthly)', 20, rowY);
        // doc.setTextColor(102, 102, 102);
        // doc.setFontSize(8);
        // doc.text('Jul 30 – Aug 30, 2025', 20, rowY + 4);
        // doc.setTextColor(47, 53, 67);
        // doc.setFontSize(9);
        // doc.text('0', 120, rowY);
        // doc.text('£5.00', 140, rowY);
        // doc.text('', 165, rowY);
        // doc.text('£0.00', 180, rowY);

        // Totals section with proper PDF spacing
        const totalsStartY = 170;
        
        // Separator line above totals section
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(20, totalsStartY - 5, 190, totalsStartY - 5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(102, 102, 102);

        doc.text('Subtotal', 135, totalsStartY);
        doc.text(`${priceInfo.formatted}`, 180, totalsStartY);

        // doc.text('Total excluding tax', 135, totalsStartY + 7);
        // doc.text('£64.00', 180, totalsStartY + 7);

        // doc.text('Tax (20% on £64.00)', 135, totalsStartY + 14);
        // doc.text('£12.80', 180, totalsStartY + 14);

        // Bold totals
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(47, 53, 67);
        doc.text('Total', 135, totalsStartY + 7);
        doc.text(`${priceInfo.formatted}`, 180, totalsStartY + 7);

        // doc.text('Amount due', 135, totalsStartY + 14);
        // doc.text(`Rs. ${billingMeta?.stripeMeta.packagePrice}`, 180, totalsStartY + 14);

        // Footer with separator line and thank you message
        const footerY = 250;
        
        // Draw separator line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(20, footerY, 190, footerY);
        
        // Thank you message
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(47, 53, 67);
        doc.text('Thanks for the business', 20, footerY + 10);

        // Save the PDF
        doc.save(`${invoiceId}.pdf`);

      // Handle logo loading error - same exact layout without logo
      // logo.onerror = () => {
      //   console.warn('Logo not found, generating invoice without logo');

      //   // Header - Invoice title without logo
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(28);
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('Invoice', 20, 25);

      //   // Invoice details section (proper spacing like PDF)
      //   doc.setFontSize(9);
      //   doc.setFont('helvetica', 'normal');
      //   doc.setTextColor(102, 102, 102);

      //   // Left column - Invoice details with PDF spacing
      //   doc.text('Invoice number', 20, 45);
      //   doc.text('Date of issue', 20, 50);
      //   doc.text('Date due', 20, 55);
      //   doc.text('Figma GB VAT', 20, 60);

      //   doc.setFont('helvetica', 'bold');
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('F03347F8-0017', 75, 45);
      //   doc.text('July 30, 2025', 75, 50);
      //   doc.text('July 30, 2025', 75, 55);
      //   doc.text('GB444658372', 75, 60);

      //   // Company information section - exact PDF positioning
      //   const leftCol = 20;
      //   const midCol = 75;
      //   const rightCol = 135;
      //   const startY = 75;

      //   // From section (Figma) - no header in PDF
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(11);
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('Figma, Inc.', leftCol, startY);
      //   doc.setFont('helvetica', 'normal');
      //   doc.setFontSize(9);
      //   doc.setTextColor(102, 102, 102);
      //   doc.text('760 Market Street', leftCol, startY + 6);
      //   doc.text('Floor 10', leftCol, startY + 12);
      //   doc.text('San Francisco, California 94102', leftCol, startY + 18);
      //   doc.text('United States', leftCol, startY + 24);
      //   doc.text('+1 415-890-5404', leftCol, startY + 30);
      //   doc.text('support@figma.com', leftCol, startY + 36);

      //   // Bill to section
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(9);
      //   // doc.setTextColor(102, 102, 102);        
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('Bill to', midCol, startY - 6);
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(9);
      //   doc.setTextColor(102, 102, 102); 
      //   doc.text('info\'s team', midCol, startY);
      //   doc.setFont('helvetica', 'normal');
      //   doc.setFontSize(9);
      //   doc.setTextColor(102, 102, 102);
      //   doc.text('4 Bacon Terrace', midCol, startY + 6);
      //   doc.text('Fitzstephen Road', midCol, startY + 12);
      //   doc.text('Dagenham', midCol, startY + 18);
      //   doc.text('RM8 2NN', midCol, startY + 24);
      //   doc.text('United Kingdom', midCol, startY + 30);
      //   doc.text('info@aryservices.com', midCol, startY + 36);

      //   // Ship to section
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(9);
      //   doc.setTextColor(102, 102, 102);
      //   doc.text('Ship to', rightCol, startY - 6);
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(11);
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('info\'s team', rightCol, startY);
      //   doc.setFont('helvetica', 'normal');
      //   doc.setFontSize(9);
      //   doc.setTextColor(102, 102, 102);
      //   doc.text('4 Bacon Terrace, Fitzstephen Road', rightCol, startY + 6);
      //   doc.text('Fitzstephen Road', rightCol, startY + 12);
      //   doc.text('DAGENHAM', rightCol, startY + 18);
      //   doc.text('RM8 2NN', rightCol, startY + 24);
      //   doc.text('United Kingdom', rightCol, startY + 30);

      //   // Amount due section with PDF spacing
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(18);
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('£76.80 due July 30, 2025', 20, 130);

      //   doc.setFont('helvetica', 'normal');
      //   doc.setFontSize(9);
      //   doc.setTextColor(41, 98, 255);
      //   doc.text('Pay online', 20, 138);

      //   // Table section with proper PDF spacing
      //   const tableStartY = 150;

      //   // Separator line above table header
      //   doc.setDrawColor(220, 220, 220);
      //   doc.setLineWidth(0.2);
      //   doc.line(20, tableStartY - 5, 190, tableStartY - 5);

      //   // Table header
      //   doc.setTextColor(102, 102, 102);
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(8);
      //   doc.text('Description', 20, tableStartY);
      //   doc.text('Qty', 120, tableStartY);
      //   doc.text('Unit price', 140, tableStartY);
      //   doc.text('Tax', 165, tableStartY);
      //   doc.text('Amount', 180, tableStartY);

      //   // Separator line below table header
      //   doc.setDrawColor(220, 220, 220);
      //   doc.setLineWidth(0.2);
      //   doc.line(20, tableStartY + 3, 190, tableStartY + 3);

      //   // Table rows with PDF spacing (15 units between rows)
      //   let rowY = tableStartY + 10;
      //   doc.setFont('helvetica', 'normal');
      //   doc.setFontSize(9);
      //   doc.setTextColor(47, 53, 67);

      //   // Row 1
      //   doc.text('Professional Full seats (monthly)', 20, rowY);
      //   doc.setTextColor(102, 102, 102);
      //   doc.setFontSize(8);
      //   doc.text('Jul 30 – Aug 30, 2025', 20, rowY + 4);
      //   doc.setTextColor(47, 53, 67);
      //   doc.setFontSize(9);
      //   doc.text('2', 120, rowY);
      //   doc.text('£18.00', 140, rowY);
      //   doc.text('20%', 165, rowY);
      //   doc.text('£36.00', 180, rowY);

      //   // Row 2  
      //   rowY += 15;
      //   doc.text('Professional Dev seats (monthly)', 20, rowY);
      //   doc.setTextColor(102, 102, 102);
      //   doc.setFontSize(8);
      //   doc.text('Jul 30 – Aug 30, 2025', 20, rowY + 4);
      //   doc.setTextColor(47, 53, 67);
      //   doc.setFontSize(9);
      //   doc.text('2', 120, rowY);
      //   doc.text('£14.00', 140, rowY);
      //   doc.text('20%', 165, rowY);
      //   doc.text('£28.00', 180, rowY);

      //   // Row 3
      //   rowY += 15;
      //   doc.text('Professional Collab seats (monthly)', 20, rowY);
      //   doc.setTextColor(102, 102, 102);
      //   doc.setFontSize(8);
      //   doc.text('Jul 30 – Aug 30, 2025', 20, rowY + 4);
      //   doc.setTextColor(47, 53, 67);
      //   doc.setFontSize(9);
      //   doc.text('0', 120, rowY);
      //   doc.text('£5.00', 140, rowY);
      //   doc.text('', 165, rowY);
      //   doc.text('£0.00', 180, rowY);

      //   // Totals section with proper PDF spacing
      //   const totalsStartY = 205;
        
      //   // Separator line above totals section
      //   doc.setDrawColor(220, 220, 220);
      //   doc.setLineWidth(0.2);
      //   doc.line(20, totalsStartY - 5, 190, totalsStartY - 5);
        
      //   doc.setFont('helvetica', 'normal');
      //   doc.setFontSize(9);
      //   doc.setTextColor(102, 102, 102);

      //   doc.text('Subtotal', 135, totalsStartY);
      //   doc.text('£64.00', 180, totalsStartY);

      //   // doc.text('Total excluding tax', 135, totalsStartY + 7);
      //   // doc.text('£64.00', 180, totalsStartY + 7);

      //   // doc.text('Tax (20% on £64.00)', 135, totalsStartY + 14);
      //   // doc.text('£12.80', 180, totalsStartY + 14);

      //   // Bold totals
      //   doc.setFont('helvetica', 'bold');
      //   doc.setFontSize(10);
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('Total', 135, totalsStartY + 7);
      //   doc.text('£76.80', 180, totalsStartY + 7);

      //   doc.text('Amount due', 135, totalsStartY + 14);
      //   doc.text('£76.80', 180, totalsStartY + 14);

      //   // Footer with separator line and thank you message
      //   const footerY = 250;
        
      //   // Draw separator line
      //   doc.setDrawColor(220, 220, 220);
      //   doc.setLineWidth(0.2);
      //   doc.line(20, footerY, 190, footerY);
        
      //   // Thank you message
      //   doc.setFont('helvetica', 'normal');
      //   doc.setFontSize(10);
      //   doc.setTextColor(47, 53, 67);
      //   doc.text('Thanks for the business', 20, footerY + 10);

      //   // Save the PDF
      //   doc.save('F03347F8-0017.pdf');
      // };
  } catch (error) {
    logger.error('Error generating invoice:', error);
    alert('Failed to generate invoice. Please try again.');
  }
};