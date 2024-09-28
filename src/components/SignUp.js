 
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';   
import { useNavigate, Link } from 'react-router-dom';
import './SignUp.css';  
const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
     
      await createUserWithEmailAndPassword(auth, email, password);
    
      navigate('/login');
    } catch (error) {
   
      setError(error.message);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignUp} className="signup-form">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
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
        <button type="submit" className="signup-button">Sign Up</button>
        <p>
          Already have an account? <Link to="/login" className="login-link">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
