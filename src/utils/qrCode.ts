export function generateQRCode(url: string): string {
  // Using QR Server API for QR code generation
  const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: '200x200',
    data: url,
    format: 'png',
    color: '36454F',
    bgcolor: 'FFFFFF'
  });
  
  return `${qrApiUrl}?${params.toString()}`;
}