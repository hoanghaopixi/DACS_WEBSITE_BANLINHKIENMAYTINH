import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const getUrlParameter = (name) => {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');
        const error = getUrlParameter('error');

        if (token) {
            // Save the token somehow.
            // Since our authService.js expects user info, we can fetch it.
            // Or we can just set the token and fetch user.
            localStorage.setItem('pc_store_access_token', token);
            
            // We need to fetch the user details.
            authService.fetchCurrentUser(token).then(user => {
                 window.dispatchEvent(new Event('auth-changed'));
                 const isAdmin = user?.roles?.some(role => role.toUpperCase() === 'ADMIN' || role === 'QUẢN TRỊ VIÊN');
                 navigate(isAdmin ? '/admin' : '/', { replace: true });
            }).catch(err => {
                 navigate('/login', { state: { error: 'Failed to fetch user details.' } });
            });
        } else {
            navigate('/login', { state: { error: error || 'OAuth2 login failed.' } });
        }
    }, [location, navigate]);

    return (
        <div className="oauth2-redirect-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loader">Đang xử lý đăng nhập...</div>
        </div>
    );
}

export default OAuth2RedirectHandler;
