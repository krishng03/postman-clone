import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
const Groups = () => {
    const [apiEndpoint, setApiEndpoint] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const [groups, setGroups] = useState([]);
    const [groupForSaving, setGroupForSaving] = useState(null);
    const [groupId, setGroupId] = useState({});
    const [showAPIunderGroup, setShowAPIunderGroup] = useState([]);
    const [history, setHistory] = useState([]);

    const [requestType, setRequestType] = useState('GET');

    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);
        try {
            let response;
            if(requestType === 'GET') {
                response = await fetch(apiEndpoint);
            }
            else if(requestType === 'POST') {
                response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: description
                });
            }
            else if(requestType === 'PUT') {
                response = await fetch(apiEndpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: description
                });
            }
            else if(requestType === 'DELETE') {
                response = await fetch(apiEndpoint, {
                    method: 'DELETE'
                });
            }
            if(!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setData(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    const handleCreateGroup = async () => {
        const groupName = prompt('Enter the name of the group:');
        if (!groupName) {
            alert('Group name cannot be empty');
            return;
        }
        await axios.post('http://localhost:5050/insertGroups', {
            name: groupName,
            timestamp: new Date().toISOString()
        });
        const getGroupsData = await axios.get('http://localhost:5050/getGroups');
        setGroups(getGroupsData.data);
    }

    useEffect(() => {
        axios.get('http://localhost:5050/getGroups')
        .then(response => {
            setGroups(response.data);
            const getGroupId = response.data.map(object => object.id);
            setGroupId(getGroupId);
            setShowAPIunderGroup(new Array(Math.max(...getGroupId)+1).fill(false));
        })
        .catch(error => {
            console.error('Error fetching groups:', error);
        });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5050/history')
        .then(response => {
            setHistory(response.data);
        })
        .catch((error) => {
            console.error('Error fetching history:', error);
        })
    }, []);
    
    const handleGroupClick = (id) => {
        const allApiCallsForGroupId = history.filter(object => object.group_id === id);
        setShowAPIunderGroup(showAPIunderGroup.map((value, index) => index === id ? !value : value));
    }

    const handleGroupSelection = async(e) => {
        e.preventDefault();
        const entryData = {
            method: requestType,
            url: apiEndpoint,
            status: 'pending',
            data: null,
            error: null,
            group_id: e.target.group.value,
            timestamp: new Date().toISOString()
        };
        const request = indexedDB.open('postmanDB', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if(!db.objectStoreNames.contains('lastApiCall')){
                db.createObjectStore('lastApiCall', { keyPath: 'id' });
            }
        }
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['lastApiCall'], 'readwrite');
            const objectStore = transaction.objectStore('lastApiCall');
            entryData.data = JSON.stringify(data);
            entryData.status = 'success';
            objectStore.put({id: Date.now(), ...entryData});
        }
        request.onerror = (event) => {
            console.error('Error while saving data to indexedDB : postmanDB', event.target.error);
        }
        try {
            await axios.post('http://localhost:5050/insert', {
                ...entryData,
                status: 'success',
                data: JSON.stringify(data)
            });
        } catch(error) {
            console.error('Error while saving data to better-sqlite3 database : history.db', error);
        }
        setData(null);
    }

    return (
        <div className="flex">
            <div className="w-1/2 rounded-lg p-2 mr-2 h-fit">
                <div>
                    <button className="bg-green-500 w-full rounded-lg p-2" onClick={handleCreateGroup}>
                        <div className="flex justify-between">
                            <div className="left-0">Create Group</div>
                            <div className="right-0">+</div>
                        </div>
                    </button>
                </div>
                <div>
                    {groups.length === 0 ? (
                        <></>
                    ) : (
                        groups.map((group) => (
                            <div>
                                
                                <div key={group.id} className="mx-2 border-gray-300 bg-gray-300 border-2 rounded-lg py-1 px-2 my-2">
                                    <button className="my-2 w-full" onClick={() => handleGroupClick(group.id)}>
                                        <div className="flex justify-between">
                                            <div className="left-0">{group.name}</div>
                                            {showAPIunderGroup[group.id] ? <div className="right-0">-</div> : <div className="right-0">+</div>}
                                        </div>
                                    </button>
                                </div>
                                {showAPIunderGroup[group.id] && (
                                    <div className="overflow-x-auto">
                                        <table >
                                            <tbody className="mx-4">
                                            {history.filter(object => object.group_id === group.id).map((object) => (
                                                <tr>
                                                    <td className="w-1/4 px-8 mx-4">{object.method}</td>
                                                    <td className="w-auto px-8 mx-4">{object.url}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="w-1/2 rounded-lg p-2 ml-2">
                <form onSubmit={handleSubmit}>
                    <div className="mb-12">
                        <label>
                            Select Request Type : {' '}
                            <select name="requestType" className="border-2 border-gray-300 rounded-lg p-2" onChange={(e) => {setRequestType(e.target.value); console.log(e.target.value)}}>
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </label>
                        <br/>
                        {(requestType === 'POST' || requestType === 'PUT' )&& (
                        <label>
                            Add Data : {' '}
                            <br/>
                            <textarea className="border-2 border-gray-300 rounded-lg p-2" name="description" onChange={(e) => {setDescription(e.target.value)}}/>
                        </label>
                        )}
                    </div>
                    <label>
                        API Endpoint here : {' '}
                        <br/>
                        <div className="flex">
                            <div className="w-3/4">
                                <input type="text" className="w-full border-2 border-gray-300 rounded-lg p-2" name="apiEndpoint" onChange={(e) => {setApiEndpoint(e.target.value)}}/>
                            </div>
                            <div className="w-1/4">
                                <button type="submit" className="border-2 border-gray-300 bg-blue-500 text-white p-2 rounded-lg">Submit</button>
                            </div>
                        </div>
                    </label>
                </form>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                {data && 
                    <div>
                        <div>
                            <h1>API Response:</h1>
                            <p>{JSON.stringify(data, null, 2)}</p>
                        </div>
                        <div>
                            <form onSubmit={handleGroupSelection}>
                                Select : {' '}
                                <select name="group" onChange={(e) => {setGroupForSaving(e.target.value)}} className="border-2 border-gray-300 mr-2 rounded-lg p-2">
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id} >{group.name}</option>
                                    ))}
                                </select>
                                <button type="submit" className="border-2 text-center border-gray-300 bg-blue-500 text-white p-2 rounded-lg">Submit</button>
                            </form>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default Groups;