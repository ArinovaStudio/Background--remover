import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function useFingerprint() {
  const [deviceHash, setDeviceHash] = useState<string>("");

  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      
      const { visitorId } = await fp.get();
      
      setDeviceHash(visitorId);
    };

    setFp();
  }, []);

  return deviceHash;
}