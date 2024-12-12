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

        mapboxgl.accessToken = 'pk.eyJ1IjoiaWdvcjUwMiIsImEiOiJjbTQ1bmdnN3gwdmRvMmxxeDgwOG12M2gxIn0.UxOguMQKWi0366_3MF45mw';
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: [4.3517, 50.8503],
            zoom: 8
        });

        map.current.addControl(new mapboxgl.NavigationControl());

        map.current.on('load', () => {
            properties.forEach((property) => {
                if (property.address.latitude && property.address.longitude) {
                    const testImage = "https://media.istockphoto.com/id/1377841262/photo/the-beautiful-scenery-of-a-tent-in-a-pine-tree-forest-at-pang-oung-mae-hong-son-province.jpg?s=612x612&w=0&k=20&c=1JvDx-16zTIeytdcC-Fa27nVJ_8SveP-omNKKlUJ-lQ=";

                    const popup = new mapboxgl.Popup({
                        offset: 25,
                        maxWidth: '300px'
                    }).setHTML(
                        `<div class="map-popup">
                            <h5>${property.name}</h5>
                            <div class="image-gallery">
                                <img src="${testImage}" alt="${property.name}" />
                                <img src="${testImage}" alt="${property.name}" />
                                <img src="${testImage}" alt="${property.name}" />
                            </div>
                            <p class="description">${property.description}</p>
                            <p class="price">€${property.pricePerNight}/night</p>
                        </div>`
                    );

                    new mapboxgl.Marker({
                        color: "#2C5530",
                    })
                        .setLngLat([property.address.longitude, property.address.latitude])
                        .setPopup(popup)
                        .addTo(map.current!);
                }
            });

            const bounds = new mapboxgl.LngLatBounds();
            properties.forEach(property => {
                if (property.address.latitude && property.address.longitude) {
                    bounds.extend([property.address.longitude, property.address.latitude]);
                }
            });
            map.current!.fitBounds(bounds, { padding: 50 });
        });

        return () => {
            map.current?.remove();
        };
    }, [properties]);

    return (
        <div className="map-container" ref={mapContainer} />
    );
};

export default MapView;