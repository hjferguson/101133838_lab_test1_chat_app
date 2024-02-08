// LogoutButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem('token'); //removes the jwt, so you can no longer access /chat route
    navigate('/login'); 
    
  };

  return (
    <button onClick={handleLogout} className="logoutButton">
      Logout
    </button>
  );
};

export default LogoutButton;
