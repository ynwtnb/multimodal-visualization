import React from "react";
import '../index.css';
import * as d3 from 'd3';
import { useState, useRef, useEffect } from "react";
import LegendBox from "./legendBox";
import Axis from "./axis";
import OnMouseMove from "./onMouseMove";

export default function HeatMap({
    data,
    timestampCol,
    feature,
    marginLeft,
    marginBottom,
    legend,
    xAxis,
    cursorX,
    setCursorX,
    setCursorXTime,
    setPlotWidth,
    onClick,
    p1LeadCol = null,
    p2LeadCol = null,
    p1Color = null,
    p2Color = null,
    yMin = null,
    yMax = null,
    threshold = null,
    lineOverlay = false,
    yAxis = false,
    ylabel = "",
    lineThreshold = null
}: 
{
    data: any[],
    timestampCol: string,
    feature: string,
    marginLeft: number,
    marginBottom: number,
    legend: string,
    xAxis: boolean,
    cursorX: number | null,
    setCursorX: React.Dispatch<React.SetStateAction<number | null>>,
    setCursorXTime: React.Dispatch<React.SetStateAction<Date | null>>,
    setPlotWidth: React.Dispatch<React.SetStateAction<number>>,
    onClick: (event: React.MouseEvent<HTMLDivElement>) => void,
    p1LeadCol?: string | null,
    p2LeadCol?: string | null,
    p1Color?: string | null,
    p2Color?: string | null,
    yMin?: number | null,
    yMax?: number | null,
    threshold?: number | null
    lineOverlay?: boolean,
    yAxis?: boolean,
    ylabel?: string,
    lineThreshold?: number | null
}
) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const margin = { top: height * 0.15, bottom: marginBottom, left: marginLeft, right: 0 };
    const dataCopy = data.filter(
        (d) => d[feature] !== null
    )

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
        return <div ref={containerRef} className={`${xAxis ? "full-dash-axis" : "full-dash"} rounded-2`} />;
    }
    
    const extent = d3.extent(data, d => d[feature]);
    const domain_range = (yMin !== null && yMax !== null) ? [yMin, 0, yMax] :
        [extent[0], 0, extent[1]] as [number, number, number];
    
    const color = d3.scaleDiverging<string>()
        .domain(domain_range)
        .interpolator(d3.interpolateRgb("blue", "red"));
    
    const yRange = [(yMin !== null) ? yMin : extent[0] as number,
                    (yMax !== null) ? yMax : extent[1] as number];
    const scaleX = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d[timestampCol])) as [Date, Date])
        .range([marginLeft, width]);
    const y = d3.scaleLinear()
            .domain(yRange)
            .range([height - margin.bottom, margin.top]);

    const line = lineOverlay ? d3.line()
            .x((d: any) => scaleX(new Date(d[timestampCol])))
            .y((d: any) => y(d[feature])) : null;
    
    const leadLine = (p1LeadCol !== null && p2LeadCol !== null) ? d3.line()
            .x((d: any) => scaleX(new Date(d[timestampCol])))
            .y((d: any) => y(yRange[1])) : null;

    const thresholdLine = lineThreshold !== null ?
            d3.line()
                .x((d: any) => scaleX(new Date(d[timestampCol])))
                .y(() => y(lineThreshold)) : null;

    const mouseMoveFunc = (event: React.MouseEvent<SVGElement>) => {
            OnMouseMove(
                { event, xScale: scaleX, setCursorX, setCursorXTime }
            );
        };

    return (
        <div ref={containerRef} className={`${xAxis ? "full-dash-axis" : "full-dash"} plot-area rounded-2 position-relative`} onClick={onClick}>
            <div>
                <LegendBox
                    labels={[`${legend} (pos)`, `${legend} (neg)`]}
                    colors={[color(domain_range[2]), color(domain_range[0])]}
                    type="line"
                />
            </div>
            <svg width="100%" height="100%" onMouseMove={mouseMoveFunc} id='svg-plot'>
                <g className="plot-area">
                    {
                        dataCopy.map((d) => {
                            return (
                                (threshold !== null && Math.abs(d[feature]) > threshold) || (threshold === null) ? <rect
                                    x={scaleX(new Date(d[timestampCol]))}
                                    y={margin.top}
                                    width={width / dataCopy.length}
                                    height={height - marginBottom - margin.top}
                                    fill={color(d[feature])}
                                    className="category-rect"
                                /> : null
                            );
                        }
                        )
                    }
                    {line !== null ? <path d={line(dataCopy) as string} fill="none" stroke="#8e8e8e" strokeWidth="2"/> : null}
                    {
                        p1LeadCol !== null && p2LeadCol !== null && leadLine !== null && p1Color !== null && p2Color !== null &&
                            dataCopy.map((d, i) => (
                                d[p1LeadCol] == 1 ? 
                                <path key={i} d={leadLine(dataCopy.slice(i, i+2)) as string} fill="none" stroke={p1Color} strokeWidth="5" /> :
                                d[p2LeadCol] == 1 ?
                                <path key={i} d={leadLine(dataCopy.slice(i, i+2)) as string} fill="none" stroke={p2Color} strokeWidth="5" /> :
                                null
                            ))
                    }
                    {thresholdLine ? <path d={thresholdLine(dataCopy) as string} fill="none" stroke="#c4c4c4" strokeWidth="2" strokeDasharray="5,5" /> : null}
                    {cursorX !== null ? <line x1={cursorX} y1={0} x2={cursorX} y2={height} stroke="#e04667" strokeWidth="1.5" strokeDasharray="4,4" /> : null}
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