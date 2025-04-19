import React from "react";
import logo from '../logo.svg';
import './index.css';
import "bootstrap/dist/css/bootstrap.min.css";
import * as d3 from "d3";
import { useEffect, useState, useRef } from "react";
import { setData } from "./dataReducer";
import { useDispatch, useSelector } from "react-redux";
import LinePlot from "./plot-components/linePlot";
import moment from "moment";
import CategoryPlot from "./plot-components/categoryPlot";
import HeatMap from "./plot-components/heatMap";
import { start } from "repl";

export default function MultimodalVisualization() {
    const segSize =120;
    const stepSize = 5;
    const p1Color = "#B2A0D9";
    const p2Color = "#2AA4BF";
    const synchronyWindowSize = 30;
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [segNum, setSegNum] = useState<number>(0);
    const [seg, setSeg] = useState<number>(0);
    const [segData, setSegData] = useState<any[]>([]);
    const [cursorX, setCursorX] = useState<number|null>(null);
    const [cursorXTime, setCursorXTime] = useState<Date|null>(null);
    const [plotWidth, setPlotWidth] = useState<number>(0);
    const isSyncingRef = useRef(false);
    const dispatch = useDispatch();
    const { data } = useSelector((state: any) => state.dataReducer);
    const videoPath = './data/T21_2318_Dyadic_Play.mp4';
    const timestampCol = "Timestamp";
    const marginLeft = 60;
    // Load data
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
    
    // Update segData when seg changes
    useEffect(() => {
        if (startTime !== null) {
            console.log(seg);
            const start = moment(startTime).add(seg * stepSize, 's').toDate();
            const end = moment(startTime).add(seg * stepSize + segSize, 's').toDate();
            const filteredData = data.filter((d: any) => {
                const timestamp = new Date(d['Timestamp']);
                return timestamp >= start && timestamp < end;
            })
            setSegData(filteredData);
            console.log(`Seg start time: ${start}`);
            console.log(`Seg end time: ${end}`);
            console.log(filteredData);
        }
    }, [seg, startTime, data]);

    // Update the video time when cursorXTime changes
    useEffect(() => {
        if (!cursorXTime || !startTime) return;
        if (isSyncingRef.current) {
            isSyncingRef.current = false;
            return;
        }
        const offsetInSeconds = moment(cursorXTime).diff(moment(startTime), 'seconds');
        (document.getElementById("video-control") as HTMLVideoElement)!.currentTime = offsetInSeconds;
    }, [cursorXTime])
    
    // update the cursor location when video time changes
    useEffect(() => {
        const videoEl = document.getElementById("video-control") as HTMLVideoElement;
        if (!videoEl || !startTime || plotWidth <= marginLeft) return;

        // handler runs on every timeupdate while playing
        const handleTimeUpdate = () => {
            isSyncingRef.current = true;
            // compute absolute time = startTime + video.currentTime
            const newCursorTime = moment(startTime)
                .add(videoEl.currentTime, 'seconds')
                .toDate();
            setCursorXTime(newCursorTime);
            
            const relSec = videoEl.currentTime - seg * stepSize;            // seconds into this segment
            const clamped = Math.max(0, Math.min(segSize, relSec));         // clamp between 0 and segSize
            const pct     = clamped / segSize;                              // 0 → 1 across the segment
            const x       = marginLeft + pct * (plotWidth - marginLeft);    // map into pixel range
            setCursorX(x);
        };
        videoEl.addEventListener("timeupdate", handleTimeUpdate);
            return () => {
                videoEl.removeEventListener("timeupdate", handleTimeUpdate);
            };
        }, [startTime, plotWidth, seg]);
        
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log("mouse click");
        const v = document.getElementById("video-control") as HTMLVideoElement;
        if (v) (v.paused ? v.play() : v.pause());
    };

    return (
        <div className="main-contents">
            <div className="p-2 ps-3 fs-5 mb-3 w-100 dash-title"><b>Multimodal dyadic data visualization</b></div>
            <div className="d-flex flex-row justify-content-between align-items-center w-100">
                <div className="d-flex flex-column align-items-start">
                    <div className="d-flex flex-row justify-content-end align-items-center w-100 mb-2 seg-slider-container">
                        <input type='range' min={0} max={segNum} value={seg} id='seg-slider' onChange={(e) => setSeg(Number(e.target.value))} />
                    </div>
                    <LinePlot 
                        data={segData}
                        timestampCol="Timestamp"
                        features={["Child_IBI_Norm", "Parent_IBI_Norm"]}
                        marginLeft={marginLeft}
                        marginBottom={10}
                        ylabel='IBI'
                        legends={["Child", "Parent"]}
                        colors={[p1Color, p2Color]}
                        xAxis = {false}
                        yAxis = {true}
                        cursorX={cursorX}
                        setCursorX={setCursorX}
                        setCursorXTime={setCursorXTime}
                        setPlotWidth={setPlotWidth}
                        synchronyWindowSize={synchronyWindowSize}
                        yMin = {0}
                        yMax = {1}
                        onClick={handleClick}
                    />
                    <LinePlot
                        data={segData}
                        timestampCol="Timestamp"
                        features={["Proximity_Norm"]}
                        marginLeft={marginLeft}
                        marginBottom={10}
                        ylabel="Proximity"
                        legends={["Proximity"]}
                        colors={["#E5CC0B"]}
                        xAxis = {false}
                        yAxis = {true}
                        cursorX={cursorX}
                        setCursorX={setCursorX}
                        setCursorXTime={setCursorXTime}
                        setPlotWidth={setPlotWidth}
                        synchronyWindowSize={synchronyWindowSize}
                        yMin = {0}
                        yMax = {1}
                        onClick={handleClick}
                    />
                    <CategoryPlot
                        data={segData}
                        timestampCol="Timestamp"
                        features={["Supported_JE", "Coordinated_JE"]}
                        marginLeft={marginLeft}
                        marginBottom={10}
                        legends={["Supported JE", "Coordinated JE"]}
                        colors={["#C5CED9", "#CF667A"]}
                        xAxis = {false}
                        cursorX={cursorX}
                        setCursorXTime={setCursorXTime}
                        synchronyWindowSize={synchronyWindowSize}
                        setCursorX={setCursorX}
                        setPlotWidth={setPlotWidth}
                        onClick={handleClick}
                    />
                    <CategoryPlot
                        data={segData}
                        timestampCol="Timestamp"
                        features={["Child_V", "Parent_V"]}
                        marginLeft={marginLeft}
                        marginBottom={10}
                        legends={["Child V", "Parent V"]}
                        colors={[p1Color, p2Color]}
                        xAxis = {false}
                        cursorX={cursorX}
                        setCursorXTime={setCursorXTime}
                        synchronyWindowSize={synchronyWindowSize}
                        setCursorX={setCursorX}
                        setPlotWidth={setPlotWidth}
                        onClick={handleClick}
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
                        marginLeft={marginLeft}
                        marginBottom={50}
                        legend="Synchrony"
                        xAxis = {true}
                        cursorX={cursorX}
                        setCursorX={setCursorX}
                        setCursorXTime={setCursorXTime}
                        setPlotWidth={setPlotWidth}
                        yMin={-1}
                        yMax={1}
                        lineOverlay = {true}
                        yAxis = {true}
                        ylabel = "Cross-corr."
                        threshold = {0.5}
                        lineThreshold={0}
                        p1LeadCol={"Child_lead_30"}
                        p2LeadCol={"Parent_lead_30"}
                        p1Color={p1Color}
                        p2Color={p2Color}
                        onClick={handleClick}
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
                <div className="">
                    <video id="video-control" controls>
                        <source src={videoPath} type='video/mp4' />
                    </video>
                </div>
            </div>
        </div>
    );
}