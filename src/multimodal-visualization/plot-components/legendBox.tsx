import React from "react";
import '../index.css';

export default function LegendBox(
    {
        labels,
        colors,
        type,
    } : {
        labels: string[],
        colors: string[],
        type: string,
    }
) {
    return (
        <div className="legend-box">
            { 
                labels.map((label, index) => {
                    return (
                        <div className="legend-item" key={index}>
                            <div className="d-flex flex-row justify-content-start align-items-center">
                                <svg className="legend-icon">
                                    <rect width='0.5em' height='0.5em' 
                                        x={`${1/2-1/2*0.5}em`}
                                        y={`${1/2-1/2*0.5}em`}
                                        fill={colors[index]} />
                                </svg>
                                <div className="legend-label">{label}</div>
                            </div>
                        </div>
                    )
            })}
        </div>
    )
}