import "./App.css";
import React, { useEffect, useState } from "react";
import copyIcon from "/copy.svg";
import { TinyColor } from "@ctrl/tinycolor";

interface CopyIconButtonProps {
  text: string;
}

const CopyIconButton: React.FC<CopyIconButtonProps> = ({ text }) => {
  return (
    <button onClick={() => navigator.clipboard.writeText(text)}>
      <img src={copyIcon} alt="Copy" />
    </button>
  );
};

function App() {
  const [colour, setColour] = useState<string>("");

  const getColour = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["colour"], (result) => {
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

  const handleSelectClick = () => {
    window.close();
  
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTabId = tabs[0]?.id;
      if (currentTabId === undefined) return;
  
      chrome.tabs.update(currentTabId, { active: true });
      chrome.tabs.sendMessage(
        currentTabId,
        { action: "toggle" },
        function () {
          if (chrome.runtime.lastError) {
            alert("Colour Picker was denied access to this webpage.");
          }
        }
      );
    });
  };
  

  return (
    <>
      <div
        className="colour-display"
        style={{
          background: colour,
          borderColor: new TinyColor(colour).isDark() ? "#FFFFFF" : "transparent",
        }}
      />
      <div className="flex-row">
        <p>HEX</p>
        <p>{colour.toUpperCase()}</p>
        <CopyIconButton text={colour.toUpperCase()} />
      </div>
      <div className="flex-row">
        <p>RGB</p>
        <p>{new TinyColor(colour).toRgbString().replace(/^rgb\(|\)$/g, "")}</p>
        <CopyIconButton
          text={new TinyColor(colour).toRgbString().replace(/^rgb\(|\)$/g, "")}
        />
      </div>
      <div className="flex-row">
        <p>HSL</p>
        <p>{new TinyColor(colour).toHslString().replace(/^hsl\(|\)$/g, "")}</p>
        <CopyIconButton
          text={new TinyColor(colour).toHslString().replace(/^hsl\(|\)$/g, "")}
        />
      </div>
      <div className="centered-row">
        <button onClick={handleSelectClick} className="select-btn">Select Colour</button>
      </div>
    </>
  );
}

export default App;
