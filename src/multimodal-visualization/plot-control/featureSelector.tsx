import React from "react";

export default function FeatureSelector({
    IBIStatus,
    proximityStatus,
    JEStatus,
    VStatus,
    STStatus,
    ITStatus,
    synchronyStatus,
    setIBIStatus,
    setProximityStatus,
    setJEStatus,
    setVStatus,
    setSTStatus,
    setITStatus,
    setSynchronyStatus
} : {
    IBIStatus: boolean,
    proximityStatus: boolean,
    JEStatus: boolean,
    VStatus: boolean,
    STStatus: boolean,
    ITStatus: boolean,
    synchronyStatus: boolean,
    setIBIStatus: React.Dispatch<React.SetStateAction<boolean>>,
    setProximityStatus: React.Dispatch<React.SetStateAction<boolean>>,
    setJEStatus: React.Dispatch<React.SetStateAction<boolean>>,
    setVStatus: React.Dispatch<React.SetStateAction<boolean>>,
    setSTStatus: React.Dispatch<React.SetStateAction<boolean>>,
    setITStatus: React.Dispatch<React.SetStateAction<boolean>>,
    setSynchronyStatus: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const features = [
        { name: "IBI", status: IBIStatus, setStatus: setIBIStatus },
        { name: "Proximity", status: proximityStatus, setStatus: setProximityStatus },
        { name: "JE", status: JEStatus, setStatus: setJEStatus },
        { name: "V", status: VStatus, setStatus: setVStatus },
        { name: "ST", status: STStatus, setStatus: setSTStatus },
        { name: "IT", status: ITStatus, setStatus: setITStatus },
        { name: "Synchrony", status: synchronyStatus, setStatus: setSynchronyStatus }
    ];
    return (
        <div className="d-flex flex-col gap-2 feature-selector">
            {features.map(feature => (
                <div key={feature.name} className="form-check">
                    <label className="form-check-label">
                        <input
                            className = 'form-check-input'
                            type="checkbox"
                            checked={feature.status}
                            onChange={() => feature.setStatus(!feature.status)}
                        />
                        {feature.name}
                    </label>
                </div>
            ))}
        </div>
    )
}