import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';  
import { auth, db } from '../firebase';  
import { collection, addDoc, getDocs } from 'firebase/firestore';  
import '../App.css';

const PageInfo = ({ username }) => {
  const [pageTitle, setPageTitle] = useState('Loading...');
  const [pageUrl, setPageUrl] = useState('Loading...');
  const [inputValue, setInputValue] = useState(''); 
  const [savedData, setSavedData] = useState([]);  
  const navigate = useNavigate();  

  useEffect(() => {
    const updateTabInfo = (tabId, changeInfo, tab) => {
      if (tab && tab.active) {
        setPageTitle(tab.title);
        setPageUrl(tab.url);
      }
    };

    const queryActiveTab = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          setPageTitle(tabs[0].title);
          setPageUrl(tabs[0].url);
        }
      });
    };

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      queryActiveTab();  
      chrome.tabs.onActivated.addListener(queryActiveTab); 
      chrome.tabs.onUpdated.addListener(updateTabInfo); 
    } else {
      console.error('Chrome API is not available.');
    }

    return () => {
      if (chrome.tabs) {
        chrome.tabs.onActivated.removeListener(queryActiveTab);
        chrome.tabs.onUpdated.removeListener(updateTabInfo);
      }
    };
  }, []);

 
  const handleLogout = async () => {
    try {
      await signOut(auth);  
      navigate('/login');  
    } catch (error) {
      console.error("Logout error: ", error.message);  
    }
  };

 
  const handleSaveData = async () => {
    try {
      await addDoc(collection(db, "userInputs"), {
        username,
        inputValue,
        timestamp: new Date(),
      });
      console.log("Data saved successfully!");
      alert("Saved")
      setInputValue('');  
      fetchData();  
    } catch (error) {
      console.error("Error saving data: ", error);
    }
  };

 
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "userInputs"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setSavedData(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

 
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div id="container">
      {username && <p>Welcome : {username}</p>} 
      <p><strong>Title:</strong> <span>{pageTitle}</span></p>
      <p><strong>URL:</strong> <span>{pageUrl}</span></p>



      {/* Logout button */}
      <button 
        onClick={handleLogout} 
        style={{
          backgroundColor: '#FF5733',
          color: '#FFFFFF',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100px',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C70039'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF5733'}
      >
        Logout
      </button>

     
      <div>
     
      </div>
    </div>
  );
};

export default PageInfo;
