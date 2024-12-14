import {useEffect, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {PropertyResponse} from '../../models/Property.ts';
import './MapView.scss';

interface MapViewProps {
    properties: PropertyResponse[];
    selectedLocation: { longitude: number, latitude: number } | null;
}

const MapView = ({properties, selectedLocation}: MapViewProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);


    // Add effect to handle selected location changes
    useEffect(() => {
        if (map.current && selectedLocation) {
            map.current.flyTo({
                center: [selectedLocation.longitude, selectedLocation.latitude],
                zoom: 18,
                duration: 2000  // Animation duration in milliseconds
            });
        }
    }, [selectedLocation]);


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
            // Calculate and set bounds immediately
            const bounds = new mapboxgl.LngLatBounds();
            properties.forEach(property => {
                const {latitude, longitude} = property.address;
                if (typeof latitude === 'number' && typeof longitude === 'number') {
                    bounds.extend([longitude, latitude]);
                }
            });
            map.current!.fitBounds(bounds, {padding: 50});

            // After bounds are set, start dropping markers with animation
            properties.forEach((property, index) => {
                const {latitude, longitude} = property.address;
                if (typeof latitude === 'number' && typeof longitude === 'number') {
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
                    <p class="price">€${property.pricePerNight} per night</p>
                </div>`
                    );

                    setTimeout(() => {
                        const marker = new mapboxgl.Marker({
                            color: "#2C5530",
                        });

                        marker
                            .setLngLat([longitude, latitude])
                            .setPopup(popup)
                            .addTo(map.current!);
                    }, index * 150);
                }
            });
        });

        return () => {
            map.current?.remove();
        };
    }, [properties]);

    return (
        <div className="map-container" ref={mapContainer}/>
    );
};

export default MapView;