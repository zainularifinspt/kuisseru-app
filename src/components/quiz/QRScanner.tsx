"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    // Create scanner instance
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      },
      false // verbose
    );

    // Start scanner
    scannerRef.current.render(
      (decodedText) => {
        // Play success sound or visual feedback here if desired
        onScanSuccess(decodedText);
      },
      (error) => {
        if (onScanFailure) onScanFailure(error);
      }
    );

    // This checks if the UI element for video is added to the DOM to hide the placeholder
    const checkInterval = setInterval(() => {
      const videoElement = document.querySelector('#qr-reader video');
      if (videoElement) {
        setIsCameraActive(true);
        clearInterval(checkInterval);
      }
    }, 500);

    // Cleanup
    return () => {
      clearInterval(checkInterval);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="relative w-full h-full">
      {/* Container for html5-qrcode */}
      <div id="qr-reader" className="w-full h-full rounded-xl overflow-hidden [&>div]:!border-none [&>div>div]:!shadow-none" />
      
      {/* We can hide default html5-qrcode UI elements via global CSS or Tailwind arbitrary variants if needed.
          For now, we let it render its default UI which includes camera permission requests. */}
          
      {/* Custom Corner Markers overlay (only show when camera is active) */}
      {isCameraActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-electric-blue rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-electric-blue rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-electric-blue rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-electric-blue rounded-br-lg"></div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide some default UI elements of html5-qrcode to make it cleaner */
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
          background: #e7e7f5;
        }
        #qr-reader__dashboard_section_csr span {
          display: none; /* Hide 'Requesting camera permissions' text */
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important; /* Hide 'Scan an Image File' link */
        }
        #qr-reader button {
          background-color: #0052FF;
          color: white;
          border: 2px solid #0A0A0A;
          border-radius: 9999px;
          padding: 8px 16px;
          font-weight: bold;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          margin-top: 8px;
        }
        #qr-reader button:hover {
          background-color: #003ec7;
        }
      `}} />
    </div>
  );
}
