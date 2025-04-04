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
import CategoryPlot from "./plot-components/categoryPlot";
import HeatMap from "./plot-components/heatMap";

export default function MultimodalVisualization() {
    const segSize =120;
    const stepSize = 5;
    const synchronyWindowSize = 30;
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [segNum, setSegNum] = useState<number>(0);
    const [seg, setSeg] = useState<number>(-1);
    const [segStartTime, setSegStartTime] = useState(new Date());
    const [segEndTime, setSegEndTime] = useState(new Date());
    const [segData, setSegData] = useState<any[]>([]);
    const [cursorX, setCursorX] = useState<number|null>(null);
    const dispatch = useDispatch();
    const { data } = useSelector((state: any) => state.dataReducer);
    useEffect(() => {
        const loadData = async () => {
            const path = './data/T21_Dyadic_Play_IBI_Behavior_Synced_ccf.csv';
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
                
                const segNum = Math.floor((end.getTime() - start.getTime() - segSize * 1000) / (stepSize * 1000));
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
            const start = moment(startTime).add(seg * stepSize, 's').toDate();
            const end = moment(startTime).add(seg * stepSize + segSize, 's').toDate();
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
            <div className="p-2 ps-3 fs-5 mb-3 w-100 dash-title"><b>Multimodal dyadic data visualization</b></div>
            <div className="d-flex flex-row justify-content-end align-items-center w-100 mb-2 seg-slider-container">
                <input type='range' min={0} max={segNum} value={seg} id='seg-slider' onChange={(e) => setSeg(Number(e.target.value))} />
            </div>
            <LinePlot 
                data={segData}
                timestampCol="Timestamp"
                features={["Child_IBI_Norm", "Parent_IBI_Norm"]}
                marginLeft={60}
                marginBottom={10}
                ylabel='IBI'
                legends={["Child", "Parent"]}
                colors={["#B2A0D9", "#2AA4BF"]}
                xAxis = {false}
                yAxis = {true}
                cursorX={cursorX}
                setCursorX={setCursorX}
                synchronyWindowSize={synchronyWindowSize}
                yMin = {0}
                yMax = {1}
            />
            <LinePlot
                data={segData}
                timestampCol="Timestamp"
                features={["Proximity_Norm"]}
                marginLeft={60}
                marginBottom={10}
                ylabel="Proximity"
                legends={["Proximity"]}
                colors={["#E5CC0B"]}
                xAxis = {false}
                yAxis = {true}
                cursorX={cursorX}
                setCursorX={setCursorX}
                synchronyWindowSize={synchronyWindowSize}
                yMin = {0}
                yMax = {1}
            />
            <CategoryPlot
                data={segData}
                timestampCol="Timestamp"
                features={["Supported_JE", "Coordinated_JE"]}
                marginLeft={60}
                marginBottom={10}
                legends={["Supported JE", "Coordinated JE"]}
                colors={["#C5CED9", "#CF667A"]}
                xAxis = {false}
                cursorX={cursorX}
                synchronyWindowSize={synchronyWindowSize}
                setCursorX={setCursorX}
            />
            <CategoryPlot
                data={segData}
                timestampCol="Timestamp"
                features={["Child_V", "Parent_V"]}
                marginLeft={60}
                marginBottom={10}
                legends={["Child V", "Parent V"]}
                colors={["#B2A0D9", "#2AA4BF"]}
                xAxis = {false}
                cursorX={cursorX}
                synchronyWindowSize={synchronyWindowSize}
                setCursorX={setCursorX}
            />
            {/* <LinePlot
                data={segData}
                timestampCol="Timestamp"
                features={["Max_CCF_10"]}
                marginLeft={60}
                marginBottom={10}
                ylabel="Cross-corr."
                legends={["Synchrony (10s)"]}
                colors={["#E5CC0B"]}
                xAxis = {false}
                yAxis = {true}
                yMin = {-1}
                yMax = {1}
                threshold={0}
            /> */}
            {/* <LinePlot
                data={segData}
                timestampCol="Timestamp"
                features={["Max_CCF_30"]}
                marginLeft={60}
                marginBottom={10}
                ylabel="Cross-corr."
                legends={["Synchrony (30s)"]}
                colors={["#E5CC0B"]}
                xAxis = {false}
                yAxis = {true}
                yMin = {-1}
                yMax = {1}
                threshold={0}
            /> */}
            {/* <LinePlot
                data={segData}
                timestampCol="Timestamp"
                features={["Max_CCF_Lag_30"]}
                marginLeft={60}
                marginBottom={10}
                ylabel="Lag"
                legends={["Lag (30s)"]}
                colors={["#cabbe1"]}
                xAxis = {false}
                yAxis = {true}
                yMin = {-16}
                yMax = {16}
                threshold={0}
            /> */}
            <HeatMap
                data={segData}
                timestampCol="Timestamp"
                feature="Max_CCF_30"
                marginLeft={60}
                marginBottom={50}
                legend="Synchrony"
                xAxis = {true}
                cursorX={cursorX}
                setCursorX={setCursorX}
                yMin={-1}
                yMax={1}
                lineOverlay = {true}
                yAxis = {true}
                ylabel = "Cross-corr."
                threshold = {0.5}
                lineThreshold={0}
            />
            {/* <LinePlot
                data={segData}
                timestampCol="Timestamp"
                features={["Max_CCF_60"]}
                marginLeft={60}
                marginBottom={30}
                ylabel="Cross-corr."
                legends={["Synchrony (60s)"]}
                colors={["#E5CC0B"]}
                xAxis = {true}
                yAxis = {true}
                yMin = {-1}
                yMax = {1}
                threshold={0}
            /> */}
        </div>
    );
}