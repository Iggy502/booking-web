import {useEffect, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {Property} from '../../models/Property.ts';
import './MapView.scss';

interface MapViewProps {
    properties: Property[];
    selectedLocation: { longitude: number | null, latitude: number | null } | null;
    handlePropertySelect: (propertyId: string | null) => void;
    onViewDetails: (propertyId: string) => void;
}

const MapView = ({properties, selectedLocation, handlePropertySelect, onViewDetails}: MapViewProps) => {
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
                handlePropertySelect(null);
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

    const createMarker = (property: Property) => {
        if (!property?.address?.latitude || !property?.address?.longitude) {
            return null;
        }

        const popup = new mapboxgl.Popup({
            offset: 25,
            maxWidth: '300px',
        }).setHTML(
            `<div class="map-popup">
               <h5>${property.name}</h5>
               <div class="image-gallery">
                   <img src="${property.imagePaths[0]}" alt="${property.name}" />
                   <img src="${property.imagePaths[1]}" alt="${property.name}" />
                   <img src="${property.imagePaths[2]}" alt="${property.name}" />
               </div>           
               <p class="description">${property.description}</p>
               <div class="d-inline-flex">
               <p class="price">€${property.pricePerNight} per night</p>           
               <p class="guests"><i class="fa-solid fa-person fa-xl"></i> ${property.maxGuests}</p>
               </div>
               <button class="view-button" data-property-id="${property.id}">
                  <i class="fas fa-info-circle me-1"></i>
                  View
               </button>          
            </div>`
        );

        const marker = new mapboxgl.Marker({
            color: "#2C5530",
        })
            .setLngLat([property.address.longitude, property.address.latitude])
            .setPopup(popup)
            .addTo(map.current!);

        // Handle marker click
        marker.getElement().addEventListener("click", () => {
            handlePropertySelect(property.id);
        });

        // Handle popup button click
        popup.on('open', () => {
            const button = document.querySelector(`button[data-property-id="${property.id}"]`);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event from bubbling up to map
                    onViewDetails(property.id);
                });
            }
        });

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
                if (marker) {
                    marker.setLngLat([longitude, latitude]).addTo(map.current!);
                    markersRef.current.push(marker);
                }
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