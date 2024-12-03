import html2canvas from "html2canvas";

let isContentScriptEnabled = false;
let cachedScreenshot: CanvasRenderingContext2D | null = null;

chrome.runtime.onMessage.addListener((req) => {
  if (req.action === "toggle") {
    isContentScriptEnabled = !isContentScriptEnabled;
    chrome.storage.local.set({ contentScriptEnabled: isContentScriptEnabled });
    if (isContentScriptEnabled) {
      initializeContentScript();
    } else {
      removeContentScript();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    isContentScriptEnabled = false;
    chrome.storage.local.set({ contentScriptEnabled: false });
    removeContentScript();
  }
});

chrome.storage.local.get(["contentScriptEnabled"], (result) => {
  isContentScriptEnabled = result.contentScriptEnabled || false;
  if (isContentScriptEnabled) initializeContentScript();
});

async function initializeContentScript(): Promise<void> {
  await initializeScreenshot(); 

  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (value: number): string => value.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const extractColourFromScreen = async (x: number, y: number): Promise<string> => {
    if (!cachedScreenshot) {
      await initializeScreenshot();
      if (!cachedScreenshot) {
        return "#000000";
      }
    } 

    const scale = window.devicePixelRatio;
    const xIndex = Math.round(x * scale);
    const yIndex = Math.round(y * scale);
    const imageData = cachedScreenshot.getImageData(xIndex, yIndex, 1, 1).data;

    return rgbToHex(imageData[0], imageData[1], imageData[2]);
  };

  const createCursorFollower = (): HTMLDivElement => {
    const follower = document.createElement("div");
    Object.assign(follower.style, {
      position: "absolute",
      width: "20px",
      height: "20px",
      backgroundColor: "#FFFFFF",
      pointerEvents: "none",
      zIndex: "9999",
      transform: "translate(100%, -100%)",
      border: "2px solid black",
      transition: "transform 0.1s ease-out",
      opacity: "1",
    });
    follower.id = "cursor-follower";
    document.body.appendChild(follower);
    return follower;
  };

  const createScreenLayer = (): HTMLDivElement => {
    const layer = document.createElement("div");
    Object.assign(layer.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      pointerEvents: "auto",
      zIndex: "99999",
      cursor: "crosshair",
    });
    layer.id = "screen-layer";
    document.body.appendChild(layer);
    return layer;
  };

  const cursorFollower = createCursorFollower();
  const screenLayer = createScreenLayer();

  const handleMouseMove = async (event: MouseEvent) => {
    cursorFollower.style.left = `${event.pageX}px`;
    cursorFollower.style.top = `${event.pageY}px`;

    const color = await extractColourFromScreen(event.pageX, event.pageY);
    if (color.toLowerCase() !== "transparent") {
      cursorFollower.style.backgroundColor = color;
    }
  }; 

  document.addEventListener("mousemove", handleMouseMove);

  screenLayer.addEventListener("click", async (event: MouseEvent) => {
    event.stopImmediatePropagation();
    event.preventDefault();

    const colourHex = await extractColourFromScreen(event.pageX, event.pageY);
    chrome.storage.local.set({ colour: colourHex });

    isContentScriptEnabled = false;
    chrome.storage.local.set({ contentScriptEnabled: false });
    removeContentScript();
  });

  document.addEventListener("scroll", () => {
    cursorFollower.style.opacity = "0";
  });

  document.addEventListener("mousemove", () => {
    if (cursorFollower.style.opacity === "0") {
      cursorFollower.style.opacity = "1";
    }
  });
}

function removeContentScript(): void {
  const cursorFollower = document.getElementById("cursor-follower");
  const screenLayer = document.getElementById("screen-layer");

  if (cursorFollower) cursorFollower.remove();
  if (screenLayer) screenLayer.remove();
}

async function loadAllImages(): Promise<void> {
  const images = Array.from(document.getElementsByTagName('img'));

  const imagePromises = images.map(img => {
    return new Promise<void>((resolve, reject) => {
      if (img.complete) {
        resolve();
      } else {
        img.onerror = reject;
      }
    });
  });
  await Promise.all(imagePromises);
}

async function initializeScreenshot(): Promise<void> {
  if (!cachedScreenshot) {
    await loadAllImages();
    const canvas = await html2canvas(document.body, {
      useCORS: true,  
      allowTaint: true,  
    });
    cachedScreenshot = canvas.getContext("2d", { willReadFrequently: true });
  }
}
