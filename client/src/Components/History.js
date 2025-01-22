import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/History.css';
const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupNames, setGroupNames] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5050/history')
            .then(response => {
                setHistory(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching history:', error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5050/getGroups')
            .then(response => {
                setGroupNames(response.data);
                console.log(response);
            })
            .catch(error => {
                console.error('Error fetching groups:', error);
                setError(error.message);
            });
    }, []);

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error: {error}</p>;
    return (
        <div>
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="scrollit">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <caption class="p-5 text-lg font-semibold text-left bg-white rtl:text-right text-gray-900 dark:text-white dark:bg-gray-800">
                    History
                    <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">It is a list of all the requests made to different API Endpoints.</p>
                </caption>
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3">URL</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Error</th>
                        <th className="px-6 py-3">Group Name</th>
                        <th className="px-6 py-3">Timestamp</th>
                    </tr>
                </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td colSpan="8" className="text-center text-2xl">No history available</td>
                            </tr>
                        ) : (
                            history.map((entry) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={entry.id}>
                                    <td className="px-6 py-4">{entry.id}</td>
                                    <td className="px-6 py-4">{entry.method}</td>
                                    <td className="px-6 py-4">{entry.url}</td>
                                    <td className="px-6 py-4">{entry.status}</td>
                                    <td className="px-6 py-4">{entry.data === null ? 'No Data' : entry.data}</td>
                                    <td className="px-6 py-4">{entry.error === null ? 'No Error' : entry.error}</td>
                                    <td className="px-6 py-4">{groupNames.find(group => group.id === entry.group_id)?.name || 'No Group'}</td>
                                    <td className="px-6 py-4">{entry.timestamp}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                </table>
                </div>
            </div>

        </div>
    );
}

export default History;