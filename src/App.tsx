import {Outlet} from 'react-router-dom';
import NavBar from "./components/navbar/Navbar";
import {ErrorProvider} from './context/error.context.tsx';
import ErrorBanner from './error/ErrorBanner.tsx';

const App = () => {
    return (
        <ErrorProvider>
            <NavBar/>
            <ErrorBanner/>
            <main>
            <Outlet/>
            </main>
        </ErrorProvider>
    );
};

export default App;
