// Navbar.tsx
import { Container, Nav, Navbar, Offcanvas, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.scss';

const NavBar = () => {
    const location = useLocation();

    return (
        <Navbar variant="dark" expand="lg" className="shadow-sm">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    CampSpot
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                {/* Expanded mode nav */}
                <Nav className="ms-auto d-none d-lg-flex">
                    <NavDropdown
                        title="Find a Spot"
                        id="properties-dropdown"
                        active={location.pathname.startsWith('/properties')}
                    >
                        <NavDropdown.Item as={Link} to="/properties/map">
                            <i className="fas fa-map-marked-alt me-2"></i>
                            Map View
                        </NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/properties/list">
                            <i className="fas fa-th-large me-2"></i>
                            List View
                        </NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link as={Link} to="/bookings" className="d-none">My Bookings</Nav.Link>
                    <Nav.Link as={Link} to="/spots">Log In</Nav.Link>
                </Nav>
                {/* Collapsed mode offcanvas */}
                <Navbar.Offcanvas
                    id="basic-navbar-nav"
                    placement="end"
                    aria-labelledby="offcanvasNavbarLabel"
                    className="sidebar d-lg-none"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="justify-content-end flex-grow-1 pe-3">
                            <Nav.Link as={Link} to="/">Home</Nav.Link>
                            <Nav.Link as={Link} to="/properties/map">
                                <i className="fas fa-map-marked-alt me-2"></i>
                                Map View
                            </Nav.Link>
                            <Nav.Link as={Link} to="/properties/list">
                                <i className="fas fa-th-large me-2"></i>
                                List View
                            </Nav.Link>
                            <Nav.Link as={Link} to="/bookings">My Bookings</Nav.Link>
                            <Nav.Link as={Link} to="/spots">Log In</Nav.Link>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default NavBar;