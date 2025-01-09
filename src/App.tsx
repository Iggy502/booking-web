import {Outlet} from 'react-router-dom';
import NavBar from "./components/navbar/Navbar";
import {ErrorProvider} from './context/error.context.tsx';
import ErrorBanner from './error/ErrorBanner.tsx';
import {AuthProvider} from "./context/auth.context.tsx";
import Chat from "./components/chat/ChatComponent.tsx";

const App = () => {
    return (
        <AuthProvider>
            <ErrorProvider>
                <NavBar/>
                <ErrorBanner/>
                <main>
                    <Outlet/>
                </main>
                {<Chat/>}
            </ErrorProvider>
        </AuthProvider>
    );
};

export default App;
