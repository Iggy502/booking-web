// src/components/MapView/index.tsx
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PropertyResponse } from '../../models/Property.ts';
import './MapView.scss';

interface MapViewProps {
    properties: PropertyResponse[];
}

const MapView = ({ properties }: MapViewProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize map
        mapboxgl.accessToken = 'pk.eyJ1IjoiaWdvcjUwMiIsImEiOiJjbTQ1bmdnN3gwdmRvMmxxeDgwOG12M2gxIn0.UxOguMQKWi0366_3MF45mw';
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12', // Outdoor style fits camping theme
            center: [4.3517, 50.8503], // Brussels center coordinates
            zoom: 8
        });

        // Add controls
        map.current.addControl(new mapboxgl.NavigationControl());

        return () => {
            map.current?.remove();
        };
    }, []);

    return (
        <div className="map-container" ref={mapContainer} />
    );
};

export default MapView;