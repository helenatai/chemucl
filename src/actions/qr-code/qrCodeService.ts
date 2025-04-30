import QRCode from 'qrcode';
import JSZip from 'jszip';
import { validateAndProcessQrCode } from './qrCodeActionHandler';

export const downloadQRCode = async (qrValue: string): Promise<string | undefined> => {
  try {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) throw new Error('Failed to create canvas context');

    tempCtx.font = 'bold 24px Arial';
    const textWidth = tempCtx.measureText(qrValue).width + 40;
    const qrSize = Math.max(200, textWidth);

    const dataUrl = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: qrSize,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    const qrImage = new Image();
    qrImage.src = dataUrl;
    await new Promise((resolve) => (qrImage.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create canvas context');

    const padding = 20;
    const textHeight = 50;
    canvas.width = Math.max(qrImage.width, textWidth) + padding * 2;
    canvas.height = qrImage.height + padding * 2 + textHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(qrImage, (canvas.width - qrImage.width) / 2, padding);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(qrValue, canvas.width / 2, qrImage.height + padding * 1.5 + textHeight / 2);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Error generating QR code:', err);
    return undefined;
  }
};

export const printQRCode = async (qrValue: string, printContainer: HTMLElement): Promise<void> => {
  try {
    const dataUrl = await downloadQRCode(qrValue);
    if (!dataUrl) throw new Error('Failed to generate QR code');

    const img = new Image();
    img.src = dataUrl;
    printContainer.appendChild(img);
  } catch (error) {
    console.error('Error printing QR code:', error);
  }
};

export const generateMultipleQRCodes = async ({
  count,
  qrId,
  exportType
}: {
  count?: number;
  qrId?: string;
  exportType: 'print' | 'download' | 'csv';
}): Promise<void> => {
  let printIframe: HTMLIFrameElement | undefined;
  let printContainer: HTMLElement | undefined;
  const qrIds: { qrID: string; dataUrl?: string }[] = [];

  const setupPrintEnvironment = () => {
    printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = '0px';
    document.body.appendChild(printIframe);

    printContainer = printIframe.contentWindow?.document.body || document.createElement('div');
    printContainer.style.display = 'flex';
    printContainer.style.flexDirection = 'column';
    printContainer.style.alignItems = 'center';
  };

  const generateAndCollectQR = async (overrideQrId?: string) => {
    const addQrCodeResult = await validateAndProcessQrCode('add', {
      type: 'NEW',
      qrID: overrideQrId
    });

    if (addQrCodeResult.error) {
      console.error('Error adding QR code to database:', addQrCodeResult.error);
    } else {
      console.log('QR code added successfully:', addQrCodeResult.qrCode);
      const qrID = addQrCodeResult.qrCode.qrID;

      if (exportType === 'print' && printContainer) {
        await printQRCode(qrID, printContainer);
      } else if (exportType === 'download') {
        const dataUrl = await downloadQRCode(qrID);
        if (dataUrl) {
          qrIds.push({ qrID, dataUrl });
        }
      } else if (exportType === 'csv') {
        qrIds.push({ qrID });
      }
    }
  };

  if (exportType === 'print') setupPrintEnvironment();

  if (count) {
    for (let i = 0; i < count; i++) {
      await generateAndCollectQR();
    }
  } else if (qrId) {
    await generateAndCollectQR(qrId);
  }

  if (exportType === 'csv') {
    const csvContent = `data:text/csv;charset=utf-8,${qrIds.map((q) => q.qrID).join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'qr_ids.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (exportType === 'download') {
    const zip = new JSZip();
    const folder = zip.folder('QR Codes');
    qrIds.forEach(({ qrID, dataUrl }) => {
      if (dataUrl) {
        const base64Data = dataUrl.split('base64,')[1];
        folder?.file(`qr-code-${qrID}.png`, base64Data, { base64: true });
      }
    });

    const zipContent = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipContent);
    link.download = 'qr_codes.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (exportType === 'print' && printIframe) {
    const printWindow = printIframe.contentWindow;
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
    setTimeout(() => {
      if (printIframe) document.body.removeChild(printIframe);
    }, 1000);
  }
};
