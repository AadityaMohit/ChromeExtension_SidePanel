import React, { useEffect, useState } from 'react';
import './styles.css';
import PageInfo from './components/PageInfo';
import TiptapEditor from './components/TiptapEditor';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';  
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './firebase';  
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);   
      console.log("Current user:", user);  
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Checking authentication...</div>;   
  }

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
            <PageInfo username={user?.email} />
              <TiptapEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App