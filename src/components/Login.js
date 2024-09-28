 
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useNavigate } from 'react-router-dom';
import './Login.css';  

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const navigate=useNavigate()
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
     navigate('/')
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" className="login-button">Login</button>
        <p>
          Don't have an account? <Link to="/signup" className="signup-link">Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
