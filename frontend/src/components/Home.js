import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className='container'>
      <h1>Welcome to the Chat App</h1>
      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Home;
