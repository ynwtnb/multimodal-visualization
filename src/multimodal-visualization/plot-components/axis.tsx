import React from "react";
import moment from "moment";

export default function Axis(
    {
        orientation,
        scale,
        time,
        marginLeft,
        marginBottom,
        width,
        height,
        label
    } : {
        orientation: string,
        scale: any,
        time: boolean,
        marginLeft: number,
        marginBottom: number,
        width: number,
        height: number,
        label: string
    }
) {
    const ticks =
        typeof (scale as any).bandwidth === 'function'
            ? (scale as any).domain()
            : (scale as any).ticks();
    var shortTicks;
    if (ticks.length > 8 && orientation === 'left') {
        const newTicks = [];
        for (let i = 0; i < ticks.length; i += Math.ceil(ticks.length / 8)) {
            newTicks.push(ticks[i]);
        }
        shortTicks = newTicks;
    } else {
        shortTicks = ticks;
    }   
    const offset =
        typeof (scale as any).bandwidth === 'function'
            ? scale.bandwidth() / 2
            : 0;

    return orientation === 'left' ? (
        <g transform={`translate(${marginLeft})`}>
            {shortTicks.map((tick: any) => {
                return (
                    <g transform={`translate(0, ${scale(tick) + offset})`}>
                    <line x2={-6} stroke="black" />
                    <text text-anchor="end" dominant-baseline="middle" fill="black" x={-10}>
                        {
                            time ? tick.toLocaleString() : tick
                        }
                    </text>
                </g>
                )  
            })}
            {label ? 
                <text text-anchor="middle" dominant-baseline="middle" fill="black" x={-height/2} y={-45} transform="rotate(-90)">
                    {label}
                </text>
            : null}
        </g>
        ) : (
        <g transform={`translate(0, ${height - marginBottom})`}>
            {shortTicks.map((tick: any) => {
                return (
                    <g transform={`translate(${scale(tick) + offset})`}>
                    <line y2={6} stroke="black" />
                    <text text-anchor="middle" dominant-baseline="hanging" fill="black" y={10}>
                        {
                            time ? moment(tick).format('h:mm:ss') : tick
                        }
                    </text>
                </g>
                )  
            })}
            {label ? 
                <text text-anchor="end" dominant-baseline="hanging" fill="black" x={width} y={30}>
                    {label}
                </text>
            : null}
        </g>
        )
}