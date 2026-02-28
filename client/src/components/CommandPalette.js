import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCityEngine } from '../engine/CityEngine';
import './CommandPalette.css';
import { CHENNAI_ZONES_GEOJSON } from '../engine/CityEngine';
import { useMapContext } from '../context/MapContext';

const MODES = ['Normal', 'Peak Hour', 'Emergency', 'Stress Test'];

const CommandPalette = () => {
    const { mapRef } = useMapContext();
    const { zones, emit, triggerScenario, setGlobalThreatScore } = useCityEngine();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState('Normal');
    const [filter, setFilter] = useState('All');
    const inputRef = useRef(null);

    // Keyboard shortcut  Ctrl+K
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(o => !o);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    // Build searchable zone list
    const zoneOptions = CHENNAI_ZONES_GEOJSON.features.map(f => ({
        id: f.id,
        name: f.properties.name,
        type: f.properties.type,
    }));

    const filtered = query.length > 0
        ? zoneOptions.filter(z =>
            z.name.toLowerCase().includes(query.toLowerCase()) ||
            z.type.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    const jumpToZone = useCallback((zoneId) => {
        const feature = CHENNAI_ZONES_GEOJSON.features.find(f => f.id === zoneId);
        if (!feature || !mapRef.current) return;
        const coords = feature.geometry.coordinates[0];
        const latlngs = coords.map(([lng, lat]) => [lat, lng]);
        mapRef.current.fitBounds(latlngs, { padding: [40, 40], maxZoom: 14 });
        emit('ZONE_JUMP', { zone: zoneId, severity: 'INFO' });
        setOpen(false);
        setQuery('');
    }, [mapRef, emit]);

    const applyMode = (m) => {
        setMode(m);
        if (m === 'Emergency') triggerScenario('CYBER_ATTACK');
        if (m === 'Stress Test') triggerScenario('FLOOD');
        if (m === 'Normal') setGlobalThreatScore(20);
        emit('MODE_CHANGE', { mode: m, severity: m === 'Emergency' ? 'HIGH' : 'INFO' });
        setOpen(false);
    };

    // Zone filter chip (emits event; map layer can listen)
    const applyFilter = (f) => {
        setFilter(f);
        emit('MAP_FILTER', { filter: f, severity: 'INFO' });
    };

    if (!open) {
        return (
            <button className="palette-trigger" onClick={() => setOpen(true)} title="Command Palette (Ctrl+K)">
                <span>⌘</span> CMD
            </button>
        );
    }

    return (
        <div className="palette-backdrop" onClick={() => setOpen(false)}>
            <div className="palette-box" onClick={e => e.stopPropagation()}>
                <div className="palette-search-row">
                    <span className="palette-icon">🔍</span>
                    <input
                        ref={inputRef}
                        className="palette-input"
                        placeholder="Search zone, asset, or command…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <span className="palette-esc" onClick={() => setOpen(false)}>ESC</span>
                </div>

                {/* Zone search results */}
                {filtered.length > 0 && (
                    <div className="palette-section">
                        <div className="palette-section-label">JUMP TO ZONE</div>
                        {filtered.map(z => (
                            <div key={z.id} className="palette-item" onClick={() => jumpToZone(z.id)}>
                                <span className="pi-icon">📍</span>
                                <div>
                                    <div className="pi-name">{z.name}</div>
                                    <div className="pi-type">{z.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Operational mode */}
                <div className="palette-section">
                    <div className="palette-section-label">OPERATIONAL MODE</div>
                    <div className="palette-modes">
                        {MODES.map(m => (
                            <button
                                key={m}
                                className={`mode-btn ${mode === m ? 'active' : ''} ${m === 'Emergency' ? 'danger' : ''}`}
                                onClick={() => applyMode(m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zone filter */}
                <div className="palette-section">
                    <div className="palette-section-label">MAP FILTER</div>
                    <div className="palette-chips">
                        {['All', 'High Risk', 'Grid', 'Water', 'Traffic'].map(f => (
                            <button
                                key={f}
                                className={`chip ${filter === f ? 'active' : ''}`}
                                onClick={() => applyFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="palette-hint">Ctrl+K to toggle • ESC to close</div>
            </div>
        </div>
    );
};

export default CommandPalette;
