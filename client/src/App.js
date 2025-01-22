import logo from './logo.svg';
import './App.css';
import Groups from './Components/Groups';
import History from './Components/History';
import Home from './Components/Home';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';

function App() {
  const [internetStatus, setInternetStatus] = useState(true);
  const [lastApiCall, setLastApiCall] = useState(null);
  const [lastApiCallKeys, setLastApiCallKeys] = useState(null);
  useEffect(() =>{

    // Check internet status
    const checkInternetStatus = () => {
      const handleOnline = () => setInternetStatus(true);
      const handleOffline = () => setInternetStatus(false);
      
      // Set initial status
      setInternetStatus(navigator.onLine);
      
      // Add event listeners for online/offline events
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Cleanup function
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    checkInternetStatus();
    
    const initDB = () => {
      const request = indexedDB.open('postmanDB', 1);
      request.onupgradeneeded = (event) => { // 
        const db = event.target.result;
        if (!db.objectStoreNames.contains('lastApiCall')) {
          db.createObjectStore('lastApiCall', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        console.log('Database initialized');
      };
      request.onerror = (event) => {
        console.error('Error initializing database', event.target.error);
      };
    };
  
    initDB();


    const getLastApiCall = async () => {
      const request = indexedDB.open('postmanDB', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['lastApiCall'], 'readonly');
        const objectStore = transaction.objectStore('lastApiCall');
        
        // Get all records instead of just ID 1
        const getAllRequest = objectStore.getAll();
        
        getAllRequest.onsuccess = (event) => {
          const results = event.target.result;
          if (results && results.length > 0) {
            // Get the most recent entry (highest timestamp/id)
            const mostRecent = results.reduce((prev, current) => 
              (prev.id > current.id) ? prev : current
            );
            setLastApiCall(mostRecent);
            setLastApiCallKeys(Object.keys(mostRecent));
          } else {
            console.log('No data found in IndexedDB');
            setLastApiCall(null);
            setLastApiCallKeys(null);
          }
        };
      };
    };

    getLastApiCall();
  }, []);
  
  return (
    <>
    {internetStatus ? (
        <Router>
          <div className="flex font-mono p-4 bg-gray-100 h-screen">
            <div className="bg-purple-300 w-1/4 rounded-lg p-4 mr-2">
              <div className="header">
                <h1 className="text-3xl font-bold tracking-wide">Postman Clone</h1>
              </div>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/groups">Groups</Link></li>
                <li><Link to="/history">History</Link></li>
              </ul>
            </div>
            <div className="bg-gray-200 w-3/4 rounded-lg p-4 ml-2">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/history" element={<History />} />
                </Routes>
            </div>
          </div>
        </Router>
      ) : (
        <div className="flex justify-center items-center h-screen">
        <div>
          <h1 className="text-2xl font-bold mb-4">No internet connection</h1>
          {lastApiCall && lastApiCallKeys && (  // Add null check here
            <div className="bg-gray-200 p-4 rounded">
              <h2 className="text-xl mb-2">Last API Call:</h2>
              {lastApiCallKeys.map((key) => (
                <div key={key} className="mb-2">
                  <strong>{key}:</strong> {lastApiCall[key]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
}

export default App;
