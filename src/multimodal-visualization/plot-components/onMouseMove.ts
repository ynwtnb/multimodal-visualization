import * as d3 from 'd3';

export default function OnMouseMove({
    event,
    xScale,
    setCursorX,
    setCursorXTime
} : {
    event: React.MouseEvent<SVGElement>,
    xScale: d3.ScaleTime<number, number>,
    setCursorX: React.Dispatch<React.SetStateAction<number | null>>,
    setCursorXTime: React.Dispatch<React.SetStateAction<Date | null>>
}) {
    // get coordinates of mouse relative to the svg element
    const [mouseX, mouseY] = d3.pointer(event);

    // keep mouseX within the margins
    const [minX, maxX] = xScale.range();
    if (mouseX < minX || mouseX > maxX) {
        setCursorX(null);
        setCursorXTime(null);
    } else {
        setCursorX(mouseX);
        const cursorXTime = xScale.invert(mouseX);
        setCursorXTime(cursorXTime);
    }
}