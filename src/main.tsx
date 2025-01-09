import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import HomePage from "./pages/home/HomePage.tsx";
import PropertyGridSelector from "./components/properties/property-grid/property-grid-selector.tsx";
import BookingConfirmComponent from "./components/booking/confirm/booking-confirm-component.tsx";
import BookingDetailComponent from "./components/booking/detail/booking-detail-component.tsx";
import BookingOverviewComponent from "./components/booking/overview/booking-overview-component.tsx";
import CreatePropertyComponent from "./components/properties/create-property/create-property-component.tsx";
import MyPropertiesComponent from "./components/properties/my-properties/my-properties-component.tsx";
import {PrivateRoute} from "./components/auth/private-route.tsx";
import {LoginPage} from "./pages/login/LoginPage.tsx";
import 'dotenv';
import EditPropertyComponent from "./components/properties/edit-property/edit-property-component.tsx";
import PropertyDetailComponent from "./components/properties/property-detail-component/property-detail-component.tsx";
import UserEditComponent from "./components/user/edit/user-edit-component.tsx";
import UserCreateComponent from "./components/user/create/create-user-component.tsx";
import {RequestPasswordReset} from "./components/user/password-reset/request/password-request-component.tsx";
import {ResetPasswordConfirm} from "./components/user/password-reset/confirm/confirm-password-component.tsx";
import EditPropertyImages
    from "./components/properties/edit-property/edit-property-image/edit-property-image-component.tsx";

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
                        element: <PropertyGridSelector/>,
                    },
                    {
                        path: 'create',
                        element:
                            <PrivateRoute>
                                <CreatePropertyComponent/>
                            </PrivateRoute>
                    },
                    {
                        path: 'edit/:id',
                        element:
                            <PrivateRoute>
                                <EditPropertyComponent/>
                            </PrivateRoute>
                    },
                    {
                        path: 'edit-images/:id',
                        element:
                            <PrivateRoute>
                                <EditPropertyImages/>
                            </PrivateRoute>
                    },

                    {
                        path: ':id',
                        element: <PropertyDetailComponent/>
                    },
                    {
                        path: 'my-properties',
                        element:
                            <PrivateRoute>
                                <MyPropertiesComponent/>
                            </PrivateRoute>

                    }
                ]
            },
            {
                path: 'bookings',
                children: [
                    {
                        path: '',
                        element:
                            <PrivateRoute>
                                <BookingOverviewComponent/>
                            </PrivateRoute>,
                    },
                    {
                        path: ':bookingId',
                        element:
                            <PrivateRoute>
                                <BookingDetailComponent/>
                            </PrivateRoute>,
                    },
                    {
                        path: 'confirm',
                        element:
                            <PrivateRoute>
                                <BookingConfirmComponent/>
                            </PrivateRoute>,
                    },
                ],
            },
            {
                path: 'profile',
                children: [
                    {
                        path: 'edit/:userId',
                        element:
                            <PrivateRoute>
                                <UserEditComponent/>
                            </PrivateRoute>,
                    },
                    {
                        path: 'register',
                        element: <UserCreateComponent/>,
                    },
                    {
                        path: 'reset-password',
                        element: <RequestPasswordReset/>,
                    },
                    {
                        path: 'confirm-password-reset/:token',
                        element: <ResetPasswordConfirm/>,
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