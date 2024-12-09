import { Outlet } from 'react-router-dom';
import NavBar from "./components/navbar/Navbar.tsx";


const App = () => {
    return (
        <>
            <NavBar />
            <Outlet />
        </>
    );
};

export default App;

