import html2canvas from "html2canvas";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

document.addEventListener("mousemove", (event) => {
  if (!canvas) {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
  }

  const { clientX, clientY } = event;
  const element = document.elementFromPoint(clientX, clientY) as HTMLElement;

  if (element) {
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    html2canvas(element).then((canvasElement) => {
      const elementImage = canvasElement;

      ctx?.clearRect(0, 0, canvas.width, canvas.height); 
      ctx?.drawImage(elementImage, 0, 0, rect.width, rect.height);

      const pixelData = ctx?.getImageData(x, y, 1, 1).data;
      if (pixelData) {
        const [r, g, b] = pixelData;
        const color = `rgb(${r},${g},${b})`;

        chrome.runtime.sendMessage({ action: "updateColor", color });
      }
    });
  }
});
