import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', credentials);
      const { token } = response.data.user;
      localStorage.setItem('token', token); // Save the token in localStorage
      navigate('/chat');
    } catch (error) {
      console.error('Login failed', error.response.data);
    }
  };

  return (
    <div className='container'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;