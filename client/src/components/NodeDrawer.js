import React from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './NodeDrawer.css';

const NodeDrawer = ({ node, onClose }) => {
    const { updateTraffic, updateLights, setGrid } = useCityEngine();

    if (!node) return null;

    const renderTrafficContent = () => (
        <div className="node-content">
            <h4 className="section-title">TRAFFIC CONTROL</h4>
            <div className="stat-row">
                <span>CONGESTION</span>
                <span className={node.congestion > 70 ? 'txt-danger' : 'txt-safe'}>{Math.round(node.congestion)}%</span>
            </div>
            <div className="stat-row">
                <span>DENSITY</span>
                <span className="txt-warn">{node.vehicleDensity} / hr</span>
            </div>
            <div className="control-group">
                <label>ADAPTIVE TIMING OVERRIDE</label>
                <div className="btn-group">
                    <button onClick={() => updateTraffic(node.id, { phase: 'GREEN' })} className="btn-safe">FORCE GREEN</button>
                    <button onClick={() => updateTraffic(node.id, { phase: 'RED' })} className="btn-danger">FORCE RED</button>
                </div>
            </div>
            <div className="mini-chart">
                <div className="chart-bars">
                    {(node.historical || Array(24).fill(50)).map((val, i) => (
                        <div key={i} className="bar" style={{ height: `${val}%`, background: val > 75 ? '#FF3D3D' : '#00F0FF' }} />
                    ))}
                </div>
                <div className="chart-label">24H CONGESTION TREND</div>
            </div>
        </div>
    );

    const renderWaterContent = () => (
        <div className="node-content">
            <h4 className="section-title">RESERVOIR CONTROL</h4>
            <div className="stat-row">
                <span>CAPACITY</span>
                <span className="txt-safe">{Math.round(node.capacity || node.capacityPercent || 0)}%</span>
            </div>
            <div className="stat-row">
                <span>PRESSURE</span>
                <span className="txt-warn">{Math.round(node.pressure)} PSI</span>
            </div>
            <div className="control-group">
                <label>ISOLATION VALVE</label>
                <button className="btn-danger full-width">EMERGENCY SHUTOFF</button>
            </div>
        </div>
    );

    const renderGridContent = () => (
        <div className="node-content">
            <h4 className="section-title">SUBSTATION CONTROL</h4>
            <div className="stat-row">
                <span>LOAD</span>
                <span className={node.load > 85 ? 'txt-danger' : 'txt-warn'}>{Math.round(node.load)}%</span>
            </div>
            <div className="stat-row">
                <span>TRANSFORMER TEMP</span>
                <span className={node.transformerTemp > 95 ? 'txt-danger' : 'txt-safe'}>{Math.round(node.transformerTemp)}°C</span>
            </div>
            <div className="control-group">
                <label>MICROGRID MODE</label>
                <button className="btn-secondary full-width">ENABLE ISLANDING</button>
            </div>
        </div>
    );

    const renderLightsContent = () => (
        <div className="node-content">
            <h4 className="section-title">LIGHTING CLUSTER</h4>
            <div className="stat-row">
                <span>BRIGHTNESS</span>
                <span className="txt-safe">{Math.round(node.brightness)}%</span>
            </div>
            <div className="stat-row">
                <span>AUTO MODE</span>
                <span className="txt-warn">{node.autoMode !== false ? 'ACTIVE' : 'MANUAL'}</span>
            </div>
            <div className="control-group">
                <label>BRIGHTNESS OVERRIDE</label>
                <input
                    type="range"
                    min="0" max="100"
                    value={Math.round(node.brightness)}
                    onChange={e => updateLights(node.id, { brightness: parseInt(e.target.value), autoMode: false })}
                    className="full-width"
                />
            </div>
        </div>
    );

    return (
        <div className={`node-drawer ${node ? 'open' : ''}`}>
            <header className="nd-header">
                <div>
                    <div className="nd-type">{node.type.toUpperCase()} NODE</div>
                    <h2 className="nd-title">{node.id.toUpperCase()}</h2>
                </div>
                <button className="nd-close" onClick={onClose}>×</button>
            </header>

            <div className="nd-body">
                {node.type === 'traffic' && renderTrafficContent()}
                {node.type === 'water' && renderWaterContent()}
                {node.type === 'grid' && renderGridContent()}
                {node.type === 'lights' && renderLightsContent()}
            </div>
        </div>
    );
};

export default NodeDrawer;
