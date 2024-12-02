import html2canvas from "html2canvas";

let isContentScriptEnabled = false; 

chrome.runtime.onMessage.addListener(function(req) {
  if (req.action === 'toggle') {
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

chrome.storage.local.get(['contentScriptEnabled'], (result) => {
  isContentScriptEnabled = result.contentScriptEnabled || false;
  if (isContentScriptEnabled) initializeContentScript();
});

function initializeContentScript() {
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (value: number): string => value.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  const extractColourFromScreen = async (x: number, y: number): Promise<string> => {
    const scale = window.devicePixelRatio;
    const canvas = document.createElement("canvas");
    const canvasContext = canvas.getContext("2d")!;

    canvas.width = Math.round(window.innerWidth * scale);
    canvas.height = Math.round(window.innerHeight * scale);
    canvasContext.scale(scale, scale); 

    try {
      const image = new Image();
      image.src = (await html2canvas(document.body)).toDataURL();

      return new Promise((resolve) => {
        image.onload = () => {
          canvasContext.drawImage(image, 0, 0);

          const xIndex = Math.round(x * scale);
          const yIndex = Math.round(y * scale);

          if (
            xIndex >= 0 &&
            xIndex < canvas.width &&
            yIndex >= 0 &&
            yIndex < canvas.height
          ) {
            const canvasData = canvasContext.getImageData(0, 0, canvas.width, canvas.height).data;
            const redIndex = yIndex * canvas.width * 4 + xIndex * 4;

            const color = {
              r: canvasData[redIndex],
              g: canvasData[redIndex + 1],
              b: canvasData[redIndex + 2],
            };

            resolve(rgbToHex(color.r, color.g, color.b));
          } else {
            resolve("#000000");
          }
        };
        image.onerror = () => {
          console.log("Error loading image:", image.src);
          resolve("#000000"); 
        };
      });
    } catch (error) {
      console.log("Error capturing screen color:", error);
      return "#000000"; 
    }
  }

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
      transition: "transform 0.1s ease-out",
      border: "2px solid black",
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
      top: 0,
      left: 0,
      padding: "10vw",
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

  let lastMoveTimestamp = 0;

  document.addEventListener("mousemove", async (event: MouseEvent) => {
    const currentTimestamp = Date.now();

    if (currentTimestamp - lastMoveTimestamp > 16) {
      cursorFollower.style.left = `${event.pageX}px`;
      cursorFollower.style.top = `${event.pageY}px`;
      lastMoveTimestamp = currentTimestamp;

      const color = await extractColourFromScreen(event.pageX, event.pageY);
      if (color.toLowerCase() !== "transparent") {
        cursorFollower.style.backgroundColor = color;
      }
    }
  });

  screenLayer.addEventListener("click", async (event: MouseEvent) => {
    event.stopImmediatePropagation();
    event.preventDefault();

    const colourHex = await extractColourFromScreen(event.pageX, event.pageY);
    chrome.storage.local.set({ colour: colourHex });

    isContentScriptEnabled = false;
    chrome.storage.local.set({ contentScriptEnabled: false });
    removeContentScript();
  });

  // Hide and show cursor follower on scroll and mousemove
  document.addEventListener("scroll", () => {
    cursorFollower.style.opacity = "0";
  });

  document.addEventListener("mousemove", () => {
    if (cursorFollower.style.opacity === "0") {
      cursorFollower.style.opacity = "1";
    }
  }
)}; 

function removeContentScript() {
  const cursorFollower = document.getElementById("cursor-follower"); 
  const screenLayer = document.getElementById("screen-layer");

  if (cursorFollower) { cursorFollower.remove() }
  if (screenLayer) { screenLayer.remove() }
};
