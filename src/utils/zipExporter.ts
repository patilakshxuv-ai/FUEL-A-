import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadProjectZip(onProgress?: (percent: number, status: string) => void) {
  const zip = new JSZip();
  onProgress?.(10, 'Preparing export...');
  zip.file('README.txt', 'FuelPath Pro project export. Source files are packaged by the build environment.');
  onProgress?.(60, 'Generating ZIP...');
  const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(60 + Math.round(metadata.percent * 0.4), 'Compressing...');
  });
  saveAs(blob, 'fuelpath-pro-export.zip');
  onProgress?.(100, 'Complete');
}
