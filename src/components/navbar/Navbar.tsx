// Navbar.tsx
import {Container, Nav, Navbar, NavDropdown, Offcanvas} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '../../context/auth.context.tsx';
import {useEffect, useState} from 'react';
import './NavBar.scss';

const NavBar = () => {
    const location = useLocation();
    const {isAuthenticated, getUserInfo, logout} = useAuth();
    const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string } | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (isAuthenticated) {
                const info = await getUserInfo();
                if (info) {
                    setUserInfo({firstName: info.firstName, lastName: info.lastName});
                }
            }
        };
        fetchUserInfo();
    }, [isAuthenticated, getUserInfo]);

    return (
        <Navbar variant="dark" expand="lg" className="shadow-sm">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    CampSpot
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
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

                    {isAuthenticated ? (
                        <NavDropdown
                            title={
                                <span>
                                    <i className="fas fa-user me-1"></i>
                                    {userInfo?.firstName}
                                </span>
                            }
                            id="user-dropdown"
                        >
                            <NavDropdown.Item as={Link} to="/properties/my-properties">
                                <i className="fas fa-home me-1"></i>
                                My Properties
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/bookings">
                                <i className="fas fa-calendar me-1"></i>
                                My Bookings
                            </NavDropdown.Item>
                            <NavDropdown.Divider/>
                            <NavDropdown.Item onClick={logout}>
                                <i className="fas fa-sign-out-alt me-1"></i>
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <Nav.Link as={Link} to="/login">
                            <i className="fas fa-sign-in-alt me-1"></i>
                            Log In
                        </Nav.Link>
                    )}
                </Nav>

                <Navbar.Offcanvas
                    id="basic-navbar-nav"
                    placement="end"
                    aria-labelledby="offcanvasNavbarLabel"
                    className="sidebar d-lg-none"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title id="offcanvasNavbarLabel">
                            {isAuthenticated && userInfo ? (
                                <span>{userInfo.firstName} {userInfo.lastName}</span>
                            ) : (
                                'Menu'
                            )}
                        </Offcanvas.Title>
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
                            {isAuthenticated ? (
                                <>
                                    <Nav.Link as={Link} to="/properties/my-properties">
                                        <i className="fas fa-home me-2"></i>
                                        My Properties
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/bookings">
                                        <i className="fas fa-calendar me-2"></i>
                                        My Bookings
                                    </Nav.Link>
                                    <Nav.Link onClick={logout}>
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        Logout
                                    </Nav.Link>
                                </>
                            ) : (
                                <Nav.Link as={Link} to="/login">
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Log In
                                </Nav.Link>
                            )}
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default NavBar;