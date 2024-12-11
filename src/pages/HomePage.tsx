// src/pages/HomePage/index.tsx
import {Container} from 'react-bootstrap';
import MapView from '../components/mapview/MapView';
import {properties} from '../util/TestData'; // Import test data
import './HomePage.scss';

const HomePage = () => {
    return (
        <div className="home-page">
            <Container className="py-4 mapview">
                <h1 className="mb-4">Find your perfect camping spot</h1>
                <MapView properties={properties}/>
            </Container>
        </div>
    );
};

export default HomePage;