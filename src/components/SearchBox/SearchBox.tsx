// src/components/AutoComplete/index.tsx
import {useEffect, useRef, useState} from "react";
import {getPlaces, Address, MapboxFeature} from "../../services/Mapbox";
import "./SearchBox.scss";

interface SearchBoxProps {
    onAddressSelect: (address: Address) => void;
}


export const SearchBox = ({onAddressSelect}: SearchBoxProps) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);

        if (value.length > 2) {
            const suggestions = await getPlaces(value);
            setSuggestions(suggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: MapboxFeature) => {
        const streetAndNumber = suggestion.place_name.split(",")[0];
        const [longitude, latitude] = suggestion.center;

        const address: Address = {
            streetAndNumber,
            place: "",
            region: "",
            postcode: "",
            country: "",
            latitude,
            longitude,
        };

        suggestion.context?.forEach((element) => {
            const identifier = element.id.split(".")[0];
            //check if identifier exists within address keys

            switch (identifier) {
                case "place":
                    address.place = element.text;
                    break;
                case "region":
                    address.region = element.text;
                    break;
                case "postcode":
                    address.postcode = element.text;
                    break;
                case "country":
                    address.country = element.text;
                    break;
                case "longitude":
                    address.longitude = parseFloat(element.text);
                    break;
                case "latitude":
                    address.latitude = parseFloat(element.text);
                    break;
                default:
                    break;
            }

        });

        onAddressSelect(address);
        setQuery(streetAndNumber);
        setSuggestions([]);
    };

    return (
        <div className="autocomplete-container" ref={inputRef}>
            <i className="fa-solid fa-map"></i>
            <input
                type="text"
                className="form-control"
                placeholder="Search location..."
                value={query}
                onChange={handleInputChange}
            />
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.place_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};