// src/pages/HomePage/index.tsx
import {Container} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import MapView from '../components/mapview/MapView.tsx';
import {properties} from '../util/TestData.ts';
import {useEffect, useState} from 'react';
import {Calendar} from 'react-bootstrap-icons'; // Add this import
import "react-datepicker/dist/react-datepicker.css";
import './HomePage.scss';

const HomePage = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);


    useEffect(() => {
        console.log(startDate, endDate);
    });

    return (
        <div className="home-page">
            <Container fluid="xxl" className="py-4">
                <div className="date-picker-container mb-4 mx-auto">
                    <div className="input-wrapper">
                        <Calendar className="calendar-icon"/>
                        <DatePicker
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
                <MapView properties={properties}/>
            </Container>
        </div>
    );
};

export default HomePage;