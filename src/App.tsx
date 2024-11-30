import './App.css';
import React, { useEffect, useState } from 'react';
import copyIcon from '../public/copy.svg';

interface CopyIconButtonProps {
  code: string;
}

const CopyIconButton: React.FC<CopyIconButtonProps> = ({ code }) => {
  return (
    <button onClick={() => navigator.clipboard.writeText(code)}>
      <img src={copyIcon} alt="Copy" />
    </button>
  );
};

const hexToRGB = (hex: string): string => {
  const hexRegex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
  if (!hexRegex.test(hex)) {
    return "";
  }
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r},${g},${b}`;
};

function hexToHSL(hex: string): string {
  const rgb = hexToRGB(hex);

  const [r, g, b] = rgb.split(',').map(Number);

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else if (max === bNorm) {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h}°,${s}%,${lPercent}%`;
};


function App() {

  const [colour, setColour] = useState<string>('');

  const getColour = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['colour'], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const colour = result.colour || "#FFFFFF";  
          resolve(colour);  
        }
      });
    });
  };

  useEffect(() => {
    const fetchColour = async () => {
      const storedColour = await getColour();
      setColour(storedColour);
    };

    fetchColour();

    const handleStorageChange = (changes: chrome.storage.StorageChange) => {
      if (changes.newValue) {
        setColour(changes.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []); 

  return (
    <>
      <div className='colour-display' style={{ background: colour }}> </div>
      <div className='flex-row'>
        <p>HEX</p>
        <p>{colour.toUpperCase()}</p>
        <CopyIconButton code={colour.toUpperCase()} />
      </div>
      <div className='flex-row'>
        <p>RGB</p>
        <p>{hexToRGB(colour)}</p>
        <CopyIconButton code={hexToRGB(colour)} />
      </div>
      <div className='flex-row'>
        <p>HSL</p>
        <p>{hexToHSL(colour)}</p>
        <CopyIconButton code={hexToHSL(colour)} />
      </div>
    </>
  )
}

export default App
