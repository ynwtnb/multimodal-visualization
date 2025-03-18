import React from "react";
import '../index.css';
import * as d3 from 'd3';
import { useState, useRef, useEffect } from "react";
import LegendBox from "./legendBox";
import Axis from "./axis";

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
    yAxis
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
    yAxis: boolean
}
) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const margin = { top: height * 0.15, bottom: marginBottom, left: marginLeft, right: 0 };

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
        return <div ref={containerRef} className="full-dash rounded-2" />;
    }

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d[timestampCol])) as [Date, Date])
        .range([marginLeft, width]);
    const y = d3.scaleLinear()
        .domain([
            d3.min(data, d => Math.min(...features.map(feat => d[feat]))) as number,
            d3.max(data, d => Math.max(...features.map(feat => d[feat]))) as number
        ])
        .range([height - margin.bottom, margin.top]);

    const lines = features.map((feat) => {
        return d3.line()
            .x((d: any) => x(new Date(d[timestampCol])))
            .y((d: any) => y(d[feat]));
    })

    return (
        <div ref={containerRef} className="full-dash rounded-2 position-relative">
            <div>
                <LegendBox
                    labels={legends}
                    colors={colors}
                    type="line"
                />
            </div>
            <svg width="100%" height="100%">
                <g className="plot-area">
                    {lines.map((line, index) => {
                        return <path d={line(data) as string} fill="none" stroke={colors[index]} strokeWidth="2" />
                    })}
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