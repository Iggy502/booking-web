import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import HomePage from "./pages/HomePage.tsx";
import PropertyWrapper from "./components/properties/property-wrapper/property-wrapper.tsx";
import BookingConfirmComponent from "./components/booking/confirm/booking-confirm-component.tsx";
import BookingDetailComponent from "./components/booking/detail/booking-detail-component.tsx";
import BookingOverviewComponent from "./components/booking/overview/booking-overview-component.tsx";
import CreatePropertyComponent from "./components/properties/create-property/create-property-component.tsx";
import MyPropertiesComponent from "./components/properties/my-properties/my-properties-component.tsx";
import {PrivateRoute} from "./components/auth/private-route.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import 'dotenv';
import EditPropertyComponent from "./components/properties/edit-property/edit-property-component.tsx";
import PropertyDetailComponent from "./components/properties/property-detail-component/property-detail-component.tsx";
import UserEditComponent from "./components/user/edit/user-edit-component.tsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children: [
            {
                index: true,
                element: <HomePage/>,
            },
            {
                path: 'properties',
                children: [
                    {
                        path: 'map',
                        element: <HomePage/>,
                    },
                    {
                        path: 'list',
                        element: <PropertyWrapper/>,
                    },
                    {
                        path: 'create',
                        element: <CreatePropertyComponent/>,
                    },
                    {
                        path: 'edit/:id',
                        element: <EditPropertyComponent/>,
                    },
                    {
                        path: ':id',
                        element: <PropertyDetailComponent/>
                    },
                    {
                        path: 'my-properties',
                        element: (
                            <PrivateRoute>
                                <MyPropertiesComponent/>
                            </PrivateRoute>
                        )

                    }
                ]
            },
            {
                path: 'bookings',
                children: [
                    {
                        path: '',
                        element: <BookingOverviewComponent/>,
                    },
                    {
                        path: ':bookingId',
                        element: <BookingDetailComponent/>,
                    },
                    {
                        path: 'confirm',
                        element: <BookingConfirmComponent/>,
                    },
                ],
            },
            {
                path: 'profile',
                children: [
                    {
                        path: 'edit/:userId',
                        element: <UserEditComponent/>,
                    }
                ]

            },
            {
                path: 'login',
                element: <LoginPage/>
            }
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
);