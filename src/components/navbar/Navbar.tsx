import {Container, Nav, Navbar} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import './Navbar.scss';

const NavBar = () => {
    return (
        <Navbar
            variant="dark"
            expand="lg"
            className="shadow-sm"
        >
            <Container fluid={"xxl"}>
                <Navbar.Brand
                    as={Link}
                    to="/"
                    className="fw-bold"
                >
                    CampSpot
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/bookings">My Bookings</Nav.Link>
                        <Nav.Link as={Link} to="/spots">Log In</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;