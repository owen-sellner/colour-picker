
// Create the follower div and style it
const followerDiv: HTMLDivElement = document.createElement("div");
followerDiv.id = "cursor-follower";

// function rgbToHex(r: any, g: any, b: any): string {
//   const toHex = (value: number) => {
//     const hex = value.toString(16); 
//     return hex.length === 1 ? '0' + hex : hex; 
//   };
//   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
// }

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
  opacity: "1"
});

document.body.appendChild(followerDiv);

let lastMove = 0;
const throttleDelay = 16;

const extractColourFromStyles = (element: HTMLElement): string | null => {
  const style = window.getComputedStyle(element);
  const backgroundColor = style.backgroundColor; 

  if (backgroundColor) {
    return backgroundColor;
  } 
  return null; 
};

document.addEventListener("mousemove", (e: MouseEvent) => {
  const now = Date.now();

  if (now - lastMove > throttleDelay) {
    followerDiv.style.left = `${e.pageX}px`;
    followerDiv.style.top = `${e.pageY}px`;
    lastMove = now;

    const element = document.elementFromPoint(e.pageX, e.pageY);
    if (element) {
      const styleColor = extractColourFromStyles(element as HTMLElement);
      if (styleColor && styleColor.toLowerCase() !== 'transparent') {
        followerDiv.style.backgroundColor = styleColor;
      } 
    }
  }
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
