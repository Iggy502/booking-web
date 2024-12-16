import {useEffect, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {PropertyResponse} from '../../models/Property.ts';
import './MapView.scss';

interface MapViewProps {
    properties: PropertyResponse[];
    selectedLocation: { longitude: number, latitude: number } | null;
    handlePropertySelect: (propertyId: string) => void;
}

const MapView = ({properties, selectedLocation, handlePropertySelect}: MapViewProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const isInitialMount = useRef(true);

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

        // Add click handler to map for deselecting property
        map.current.on('click', (e) => {
            // Check if click was on a marker
            const target = e.originalEvent.target as HTMLElement;
            const clickedMarker = target.closest('.mapboxgl-marker');
            if (!clickedMarker) {
                handlePropertySelect(''); // or null, depending on your needs
            }
        });

        map.current.on('load', () => {
            updateMarkersAndBounds();
            isInitialMount.current = false;  // Set to false after initial mount
        });

        return () => {
            markersRef.current.forEach(marker => marker.remove());
            map.current?.remove();
        };
    }, []);

    const createMarker = (property: PropertyResponse) => {
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

        const marker = new mapboxgl.Marker({
            color: "#2C5530",
        });

        marker.getElement().addEventListener('click', () => {
            handlePropertySelect(property.id);
        });

        marker.setPopup(popup);
        return marker;
    };

    const updateMarkersAndBounds = () => {
        if (!map.current) return;

        // Remove existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Calculate bounds
        const bounds = new mapboxgl.LngLatBounds();

        // Create and position markers
        properties.forEach((property, index) => {
            const {latitude, longitude} = property.address;
            if (typeof latitude === 'number' && typeof longitude === 'number') {
                bounds.extend([longitude, latitude]);

                setTimeout(() => {
                    const marker = createMarker(property);
                    marker.setLngLat([longitude, latitude]).addTo(map.current!);
                    markersRef.current.push(marker);
                }, index * 150);
            }
        });

        if (properties.length > 0) {
            map.current.fitBounds(bounds, {padding: 50});
        }
    };

    useEffect(() => {
        if (!isInitialMount.current && map.current) {
            updateMarkersAndBounds();
        }
    }, [properties]);

    useEffect(() => {
        if (map.current && selectedLocation) {
            map.current.flyTo({
                center: [selectedLocation.longitude, selectedLocation.latitude],
                zoom: 18,
                duration: 2000
            });
        }
    }, [selectedLocation]);

    return (
        <div className="map-container" ref={mapContainer}/>
    );
};

export default MapView;