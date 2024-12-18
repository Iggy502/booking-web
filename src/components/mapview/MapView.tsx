import {useEffect, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {PropertyResponse} from '../../models/Property.ts';
import './MapView.scss';

interface MapViewProps {
    properties: PropertyResponse[];
    selectedLocation: { longitude: number | null, latitude: number | null } | null;
    handlePropertySelect: (propertyId: string) => void;
}

const MapView = ({properties, selectedLocation, handlePropertySelect}: MapViewProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const defaultLocation = useRef<{ longitude: number, latitude: number }>(
        {longitude: 4.3517, latitude: 50.8503}
    );
    const hadPreviousLocation = useRef(false);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Calculate initial bounds before creating the map
        const bounds = new mapboxgl.LngLatBounds();
        properties.forEach((property) => {
            const {latitude, longitude} = property.address;
            if (typeof latitude === 'number' && typeof longitude === 'number') {
                bounds.extend([longitude, latitude]);
            }
        });

        mapboxgl.accessToken = 'pk.eyJ1IjoiaWdvcjUwMiIsImEiOiJjbTQ1bmdnN3gwdmRvMmxxeDgwOG12M2gxIn0.UxOguMQKWi0366_3MF45mw';

        // Initialize map with bounds if properties exist, otherwise use default center
        const mapConfig: mapboxgl.MapboxOptions = {
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            zoom: 8
        };

        if (properties.length > 0) {
            // Calculate center from bounds
            const center = [
                (bounds.getWest() + bounds.getEast()) / 2,
                (bounds.getNorth() + bounds.getSouth()) / 2
            ];
            mapConfig.center = center as [number, number];
            mapConfig.bounds = bounds;
            mapConfig.fitBoundsOptions = {padding: 50};
        } else {
            // Default center for Belgium if no properties
            mapConfig.center = [defaultLocation.current.longitude, defaultLocation.current.latitude];
        }

        map.current = new mapboxgl.Map(mapConfig);

        map.current.addControl(new mapboxgl.NavigationControl());

        map.current.on('click', (e) => {
            const target = e.originalEvent.target as HTMLElement;
            const clickedMarker = target.closest('.mapboxgl-marker');
            if (!clickedMarker) {
                handlePropertySelect('');
            }
        });

        map.current.on('load', () => {
            updateMarkers();
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

    const updateMarkers = () => {
        if (!map.current) return;

        // Remove existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Create and position markers
        properties.forEach((property) => {
            const {latitude, longitude} = property.address;
            if (typeof latitude === 'number' && typeof longitude === 'number') {
                const marker = createMarker(property);
                marker.setLngLat([longitude, latitude]).addTo(map.current!);
                markersRef.current.push(marker);
            }
        });
    };

    useEffect(() => {
        if (map.current) {
            updateMarkers();
        }
    }, [properties]);

    useEffect(() => {
        if (map.current) {
            if (selectedLocation) {
                hadPreviousLocation.current = true;
                map.current.flyTo({
                    center: [selectedLocation.longitude ?? defaultLocation.current.longitude,
                        selectedLocation.latitude ?? defaultLocation.current.latitude],
                    zoom: 18,
                    duration: 2000
                });
            } else if (hadPreviousLocation.current) {
                map.current.flyTo({
                    center: [defaultLocation.current.longitude, defaultLocation.current.latitude],
                    zoom: 8,
                    duration: 2000
                });
            }
        }
    }, [selectedLocation]);

    return (
        <div className="map-container" ref={mapContainer}/>
    );
};

export default MapView;