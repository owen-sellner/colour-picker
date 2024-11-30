import html2canvas from "html2canvas";

// Helper function
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

let lastMove = 0;
const extractColourFromScreen = async (
  x: number,
  y: number
): Promise<string> => {
  const screenshot = await html2canvas(document.body, {
    x: x + 2,
    y: y + 6,
    width: 6,
    height: 6,
    useCORS: true,
  });
  const context = screenshot.getContext("2d", { willReadFrequently: true });
  if (!context) return "#000000";
  const pixelData = context.getImageData(1, 1, 1, 1).data;
  const [r, g, b] = pixelData;
  const colour = rgbToHex(r, g, b);
  return colour;
};

const followerDiv: HTMLDivElement = document.createElement("div");
followerDiv.id = "cursor-follower";

Object.assign(followerDiv.style, {
  position: "absolute",
  width: "20px",
  height: "20px",
  backgroundColor: "green",
  pointerEvents: "none",
  zIndex: "9999",
  transform: "translate(100%, -100%)",
  transition: "transform 0.1s ease-out",
  border: "2px solid black",
  opacity: "1",
});

document.body.appendChild(followerDiv);

const screenLayerDiv: HTMLDivElement = document.createElement("div");
screenLayerDiv.id = "screen-layer";

Object.assign(screenLayerDiv.style, {
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

document.body.appendChild(screenLayerDiv);

document.addEventListener("mousemove", async (e: MouseEvent) => {
  const now = Date.now();

  if (now - lastMove > 16) {
    followerDiv.style.left = `${e.pageX}px`;
    followerDiv.style.top = `${e.pageY}px`;
    lastMove = now;

    const color = await extractColourFromScreen(e.pageX, e.pageY);
    if (color && color.toLowerCase() !== "transparent") {
      followerDiv.style.backgroundColor = color;
    }
  }
});

screenLayerDiv.addEventListener("click", async (e: MouseEvent) => {
  e.stopImmediatePropagation();
  e.preventDefault();

  const colourHex = await extractColourFromScreen(e.pageX, e.pageY);
  chrome.storage.local.set({ colour: colourHex });
});

// Hide the follower when the user scrolls
document.addEventListener("scroll", () => {
  followerDiv.style.opacity = "0";
});

// Show the follower again when the mouse moves
document.addEventListener("mousemove", () => {
  if (followerDiv.style.opacity === "0") {
    followerDiv.style.opacity = "1";
  }
});
