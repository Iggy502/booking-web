import {Container, Nav, Navbar, Offcanvas} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import './NavBar.scss';

const NavBar = () => {
    return (
        <Navbar
            variant="dark"
            expand="lg"
            className="shadow-sm"
        >
            <Container fluid>
                <Navbar.Brand
                    as={Link}
                    to="/"
                    className="fw-bold"
                >
                    CampSpot
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                {/* This Nav shows in expanded mode */}
                <Nav className="ms-auto d-none d-lg-flex">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/bookings">My Bookings</Nav.Link>
                    <Nav.Link as={Link} to="/spots">Log In</Nav.Link>
                </Nav>
                {/* This Offcanvas shows in collapsed mode */}
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
                            <Nav.Link as={Link} to="/bookings">My Bookings</Nav.Link>
                            <Nav.Link as={Link} to="/properties">My Bookings</Nav.Link>
                            <Nav.Link as={Link} to="/spots">Log In</Nav.Link>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default NavBar;