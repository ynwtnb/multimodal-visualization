import React from "react";
import '../index.css';
import * as d3 from 'd3';
import { useState, useRef, useEffect } from "react";
import LegendBox from "./legendBox";
import Axis from "./axis";
import OnMouseMove from "./onMouseMove";

export default function CategoryPlot({
    data,
    timestampCol,
    features,
    marginLeft,
    marginBottom,
    legends,
    colors,
    xAxis,
    cursorX,
    setCursorX,
    setCursorXTime,
    setPlotWidth,
    onClick,
    synchronyWindowSize = 0
}: 
{
    data: any[],
    timestampCol: string,
    features: string[],
    marginLeft: number,
    marginBottom: number,
    legends: string[],
    colors: string[],
    xAxis: boolean,
    cursorX: number | null,
    setCursorX: React.Dispatch<React.SetStateAction<number | null>>,
    setCursorXTime: React.Dispatch<React.SetStateAction<Date | null>>,
    setPlotWidth: React.Dispatch<React.SetStateAction<number>>,
    onClick: (event: React.MouseEvent<HTMLDivElement>) => void,
    synchronyWindowSize?: number
}
) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const margin = { top: height * 0.15, bottom: marginBottom, left: marginLeft, right: 0 };
    const dataCopy = data.filter(
        (d) => features.every((feat) => d[feat] !== null)
    )

    const scaleX = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d[timestampCol])) as [Date, Date])
        .range([marginLeft, width]);

    // Update the dimensions of the plot when the window is resized
    const updateDimensions = () => {
        if (containerRef.current) {
            setWidth(containerRef.current.clientWidth);
            setHeight(containerRef.current.clientHeight);
            setPlotWidth(containerRef.current.clientWidth);
        }
    };

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    if (width === 0 || height === 0) {
        return <div ref={containerRef} className="full-dash rounded-2" />;
    }
    
    const mouseMoveFunc = (event: React.MouseEvent<SVGElement>) => {
            OnMouseMove(
                { event, xScale: scaleX, setCursorX, setCursorXTime }
            );
        };

    const cursorXTime = cursorX !== null ? scaleX.invert(cursorX) : null;
    const windowEndTime = cursorXTime !== null ? new Date(cursorXTime.getTime() + synchronyWindowSize * 1000) : null;
    const windowWidth = windowEndTime !== null && cursorX !== null ? scaleX(windowEndTime) - cursorX : 0;

    return (
        <div ref={containerRef} className="plot-area full-dash rounded-2 position-relative" onClick={onClick}>
            <div>
                <LegendBox
                    labels={legends}
                    colors={colors}
                    type="line"
                />
            </div>
            <svg width="100%" height="100%" onMouseMove={mouseMoveFunc}>
                <g className="plot-area">
                    {features.map((feat, i) => {
                        return (
                            dataCopy.map((d) => {
                                return (
                                    d[feat] === 1 ? <rect
                                        x={scaleX(new Date(d[timestampCol]))}
                                        y={margin.top}
                                        width={width / dataCopy.length}
                                        height={height - marginBottom - margin.top}
                                        fill={colors[i]}
                                        className="category-rect"
                                    /> : null
                                );
                            }
                            )
                        );
                    })}
                    {cursorX !== null ? <line x1={cursorX} y1={0} x2={cursorX} y2={height} stroke="#e04667" strokeWidth="1.5" strokeDasharray="4,4" /> : null}
                    {cursorX !== null && synchronyWindowSize > 0 ? 
                        <rect x={cursorX} y={0} width={windowWidth} height={height} fill='#e04667' fillOpacity={0.1}  />
                    : null}
                </g>
                { xAxis ? <Axis
                    orientation = "bottom"
                    scale = {scaleX}
                    time = {true}
                    marginLeft={0}
                    marginBottom={marginBottom}
                    width={width}
                    height={height}
                    label="Timestamp"
                /> : null }
            </svg>
        </div>
    );
}