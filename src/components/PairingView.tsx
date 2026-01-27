import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  pinData: any;
}

const PairingView: React.FC<Props> = ({ pinData }) => {
  const pin = pinData.pin || pinData.devicePin;

  return (
    <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-gray-300 mb-4">Activation Code</h2>
      
      {/* PIN Box */}
      <div className="bg-blue-900/20 py-6 rounded-2xl mb-8 border border-blue-500/30">
        <h1 className="text-5xl font-black text-blue-400 tracking-[0.2em]">
          {pin}
        </h1>
      </div>

      {/* QR Code */}
      <div className="p-4 bg-white rounded-2xl inline-block mb-6 shadow-2xl">
        <QRCodeCanvas
          value={JSON.stringify({
            pin: pin,
            serial: pinData.deviceSerial
          })}
          size={180}
          level="H"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-400">Scan QR or enter PIN in your dashboard</p>
        <div className="flex justify-center items-center gap-2">
           <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
           <span className="text-xs text-yellow-500/80 font-medium">Waiting for authorization...</span>
        </div>
      </div>
    </div>
  );
};

export default PairingView;