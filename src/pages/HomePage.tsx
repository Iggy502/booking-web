// src/pages/HomePage/index.tsx
import {Container} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import MapView from '../components/mapview/MapView.tsx';
import {properties} from '../util/TestData.ts';
import {useEffect, useState} from 'react';
import "react-datepicker/dist/react-datepicker.css";
import './HomePage.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {Address} from "../services/Mapbox.ts";
import {SearchBox} from "../components/SearchBox/SearchBox.tsx";

const HomePage = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<{longitude: number, latitude: number} | null>(null);


    useEffect(() => {
        console.log(startDate, endDate);
    });


    const handleAddressSelect = (address: Address) => {
        setSelectedLocation({
            longitude: address.longitude,
            latitude: address.latitude
        });
    };

    return (
        <div className="home-page">
            <Container fluid="xxl" className="py-4">
                <h1 className="text-center responsive-heading mb-4">Find your next camping spot</h1>
                <div className="d-flex mb-4 justify-content-center align-items-center gap-4 w-100 flex-wrap">
                    <SearchBox onAddressSelect={handleAddressSelect}/>
                    <div className="date-picker-container">

                        <DatePicker
                            showIcon={true}
                            icon="fa fa-calendar-alt"
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(dates: [Date | null, Date | null]) => {
                                const [start, end] = dates;
                                setStartDate(start ?? undefined);
                                setEndDate(end ?? undefined);
                            }}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Select check-in and check-out dates"
                            className="form-control"
                            monthsShown={2}
                        />

                    </div>
                </div>
                <MapView properties={properties} selectedLocation={selectedLocation} />
            </Container>
        </div>
    );
};

export default HomePage;