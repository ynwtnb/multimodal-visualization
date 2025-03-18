import React from "react";
import logo from '../logo.svg';
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";
import * as d3 from "d3";
import { useEffect, useState } from "react";
import { setData } from "./dataReducer";
import { useDispatch, useSelector } from "react-redux";
import LinePlot from "./plot-components/linePlot";
import moment from "moment";

export default function MultimodalVisualization() {
    const segSize = 60;
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [segNum, setSegNum] = useState<number>(0);
    const [seg, setSeg] = useState<number>(-1);
    const [segStartTime, setSegStartTime] = useState(new Date());
    const [segEndTime, setSegEndTime] = useState(new Date());
    const [segData, setSegData] = useState<any[]>([]);
    const dispatch = useDispatch();
    const { data } = useSelector((state: any) => state.dataReducer);
    useEffect(() => {
        const loadData = async () => {
            const path = './data/A02_Dyadic_Play_IBI_Behavior_Synced.csv';
            try {
                const res = await fetch(path);
                const text = await res.text();
                // Parse the CSV text into an array of objects with type inference
                const dataset: any[] = d3.csvParse(text, d3.autoType);
                dispatch(setData(dataset));
                console.log(dataset);
                const start = new Date(dataset[0]['Timestamp']) as Date;
                const end = new Date(dataset[dataset.length - 1]['Timestamp']) as Date;
                setStartTime(start);
                setEndTime(end);
                const segNum = Math.floor((end.getTime() - start.getTime()) / (segSize * 1000));
                setSegNum(segNum);
                console.log(`segNum: ${segNum}`);                
                setSeg(0);
            } catch (error) {
                console.error("Error loading CSV:", error);
            }
        };
        loadData();
    }, []);
    useEffect(() => {
        if (startTime !== null) {
            console.log(seg);
            const start = moment(startTime).add((seg) * segSize, 's').toDate();
            const end = moment(startTime).add((seg + 1) * segSize, 's').toDate();
            setSegStartTime(start);
            setSegEndTime(end);
            setSegData(data.filter((d: any) => {
                const timestamp = new Date(d['Timestamp']);
                return timestamp >= start && timestamp < end;
            }));
            console.log(`Seg start time: ${start}`);
            console.log(`Seg end time: ${end}`);
            console.log(data.filter((d: any) => {
                const timestamp = new Date(d['Timestamp']);
                return timestamp >= start && timestamp < end;
            }));
        }
    }, [seg])
    
    return (
        <div className="main-contents d-flex flex-column align-items-center">
            <div className="p-2 fs-5 mt-2"><b>Multimodal dyadic data visualization</b></div>
            <div className="d-flex flex-row justify-content-end align-items-center w-100 mb-2 seg-slider-container">
                <label htmlFor='seg-slider' className='form-label me-2 mb-0'>Seg. {seg}</label>
                <input type='range' min={0} max={segNum} value={seg} id='seg-slider' onChange={(e) => setSeg(Number(e.target.value))} />
            </div>
            <LinePlot 
                data={segData}
                timestampCol="Timestamp"
                features={["Child_IBI_Norm", "Parent_IBI_Norm"]}
                marginLeft={50}
                marginBottom={50}
                ylabel='IBI'
                legends={["Child", "Parent"]}
                colors={["#B2A0D9", "#2AA4BF"]}
                xAxis = {false}
                yAxis = {true}
            />
            <LinePlot
                data={segData}
                timestampCol="Timestamp"
                features={["Proximity_Norm"]}
                marginLeft={50}
                marginBottom={50}
                ylabel="Proximity"
                legends={["Proximity"]}
                colors={["#B8B0D9"]}
                xAxis = {true}
                yAxis = {true}
            />
        </div>
    );
}