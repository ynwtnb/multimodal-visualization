import React from "react";
import '../index.css';
import * as d3 from 'd3';
import { useState, useRef, useEffect } from "react";
import LegendBox from "./legendBox";
import Axis from "./axis";
import OnMouseMove from "./onMouseMove";

export default function LinePlot({
    data,
    timestampCol,
    features,
    marginLeft,
    marginBottom,
    ylabel,
    legends,
    colors,
    xAxis,
    yAxis,
    cursorX,
    setCursorX,
    setCursorXTime,
    synchronyWindowSize = 0,
    yMin = null,
    yMax = null,
    threshold = null
}: 
{
    data: any[],
    timestampCol: string,
    features: string[],
    marginLeft: number,
    marginBottom: number,
    ylabel: string,
    legends: string[],
    colors: string[],
    xAxis: boolean,
    yAxis: boolean,
    cursorX: number | null,
    setCursorX: React.Dispatch<React.SetStateAction<number | null>>,
    setCursorXTime: React.Dispatch<React.SetStateAction<Date | null>>,
    synchronyWindowSize?: number,
    yMin?: number | null,
    yMax?: number | null,
    threshold?: number | null
}
) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const margin = { top: height * 0.15, bottom: marginBottom, left: marginLeft, right: 0 };
    const dataCopy = data.filter(
        (d) => features.every((feat) => d[feat] !== null)
    )

    // Update the dimensions of the plot when the window is resized
    const updateDimensions = () => {
        if (containerRef.current) {
            setWidth(containerRef.current.clientWidth);
            setHeight(containerRef.current.clientHeight);
        }
    };

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    if (width === 0 || height === 0) {
        return <div ref={containerRef} className={`${xAxis ? 'full-dash-axis' :'full-dash'} rounded-2`} />;
    }

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d[timestampCol])) as [Date, Date])
        .range([marginLeft, width]);
    const yRange = [(yMin !== null) ? yMin : d3.min(data, d => Math.min(...features.map(feat => d[feat]))) as number,
                    (yMax !== null) ? yMax : d3.max(data, d => Math.max(...features.map(feat => d[feat]))) as number];

    const y = d3.scaleLinear()
            .domain(yRange)
            .range([height - margin.bottom, margin.top]);

    const lines = features.map((feat) => {
        return d3.line()
            .x((d: any) => x(new Date(d[timestampCol])))
            .y((d: any) => y(d[feat]));
    })

    const thresholdLine = threshold !== null ?
        d3.line()
            .x((d: any) => x(new Date(d[timestampCol])))
            .y(() => y(threshold)) : null;

    const mouseMoveFunc = (event: React.MouseEvent<SVGElement>) => {
        OnMouseMove(
            { event, xScale: x, setCursorX, setCursorXTime }
        );
    };

    const cursorXTime = cursorX !== null ? x.invert(cursorX) : null;
    const windowEndTime = cursorXTime !== null ? new Date(cursorXTime.getTime() + synchronyWindowSize * 1000) : null;
    const windowWidth = windowEndTime !== null && cursorX !== null ? x(windowEndTime) - cursorX : 0;

    return (
        <div ref={containerRef} className={`${xAxis ? 'full-dash-axis' :'full-dash'} rounded-2 position-relative`}>
            <div>
                <LegendBox
                    labels={legends}
                    colors={colors}
                    type="line"
                />
            </div>
            <svg width="100%" height="100%" onMouseMove={mouseMoveFunc} id='svg-plot'>
                <g className="plot-area">
                    {lines.map((line, index) => {
                        return <path d={line(dataCopy) as string} fill="none" stroke={colors[index]} strokeWidth="2" />
                    })}
                    {thresholdLine ? <path d={thresholdLine(dataCopy) as string} fill="none" stroke="#c4c4c4" strokeWidth="2" strokeDasharray="5,5" /> : null}
                    {cursorX !== null ? <line x1={cursorX} y1={0} x2={cursorX} y2={height} stroke="#e04667" strokeWidth="1.5" strokeDasharray="4,4" /> : null}
                    {cursorX !== null && synchronyWindowSize > 0 ? 
                        <rect x={cursorX} y={0} width={windowWidth} height={height} fill='#e04667' fillOpacity={0.1}  />
                    : null}
                </g>
                { yAxis ? <Axis
                    orientation = "left"
                    scale = {y}
                    time = {false}
                    marginLeft={marginLeft}
                    marginBottom={0}
                    width={width}
                    height={height}
                    label={ylabel}
                /> : null }
                { xAxis ? <Axis
                    orientation = "bottom"
                    scale = {x}
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