import './App.css';
import React from 'react';
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

function App() {
  const HEX_CODE = "#FFFFFF";
  const RGB_CODE = "255,255,255";
  const HSL_CODE = "100,100%,100%";

  return (
    <>
      <div className='colour-display' style={{ background: HEX_CODE }}> </div>
      <div className='flex-row'>
        <p>HEX</p>
        <p>{HEX_CODE}</p>
        <CopyIconButton code={HEX_CODE} />
      </div>
      <div className='flex-row'>
        <p>RGB</p>
        <p>{RGB_CODE}</p>
        <CopyIconButton code={RGB_CODE} />
      </div>
      <div className='flex-row'>
        <p>HSL</p>
        <p>{HSL_CODE}</p>
        <CopyIconButton code={HSL_CODE} />
      </div>
    </>
  )
}

export default App
