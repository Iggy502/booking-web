// Navbar.tsx
import {Container, Nav, Navbar, NavDropdown, Offcanvas} from 'react-bootstrap';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/auth.context.tsx';
import {useCallback} from 'react';
import './NavBar.scss';

const NavBar = () => {
    const location = useLocation();
    const {isAuthenticated, userInfo, logout} = useAuth();
    const navigate = useNavigate();


    const logoutAndRedirect = useCallback(async () => {
        logout().then(() => {
            navigate('/');
        });
    }, [logout, navigate]);

    return (
        <Navbar id={'custom-nav'} variant="dark" expand="lg" className="shadow-sm">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    CampSpot
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Nav className="ms-auto d-none d-lg-flex align-items-center">
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
                    <Nav.Link as={Link} to="/bookings" className="d-none">
                        My Bookings
                    </Nav.Link>
                    {isAuthenticated ? (
                        <NavDropdown
                            title={
                                <div className="d-flex align-items-center">
                                    {userInfo?.profilePicturePath ? (
                                        <img
                                            src={userInfo.profilePicturePath}
                                            alt="Profile"
                                            className="rounded-circle me-2"
                                            width="45"
                                            height="45"
                                            style={{objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <i className="fas fa-user me-2"></i>
                                    )}
                                    <span>{userInfo?.firstName}</span>
                                </div>
                            }
                            id="user-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item as={Link} to="/properties/my-properties">
                                <i className="fas fa-home me-2"></i>
                                My Properties
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/bookings">
                                <i className="fas fa-calendar me-2"></i>
                                My Bookings
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to={`/profile/edit/${userInfo?.id}`}>
                                <i className="fas fa-pencil me-2"></i>
                                Edit Profile
                            </NavDropdown.Item>
                            <NavDropdown.Divider/>
                            <NavDropdown.Item onClick={logoutAndRedirect}>
                                <i className="fas fa-sign-out-alt me-2"></i>
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    ) : (
                        <Nav.Link as={Link} to="/login">
                            <i className="fas fa-sign-in-alt me-2"></i>
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
                                <div className="d-flex align-items-center">
                                    {userInfo.profilePicturePath ? (
                                        <img
                                            src={userInfo.profilePicturePath}
                                            alt="Profile"
                                            className="rounded-circle me-2"
                                            width="45"
                                            height="45"
                                            style={{objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <i className="fas fa-user me-2"></i>
                                    )}
                                    <span>{userInfo.firstName} {userInfo.lastName}</span>
                                </div>
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
                                    <Nav.Link as={Link} to={`/profile/edit/${userInfo?.id}`}>
                                        <i className="fas fa-pencil me-2"></i>
                                        Edit Profile
                                    </Nav.Link>
                                    <Nav.Link onClick={logoutAndRedirect}>
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