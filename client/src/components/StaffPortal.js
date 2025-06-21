import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function StaffPortal() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser, logout, getAuthHeader } = useAuth();

    

    
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/assignments', {
                    headers: getAuthHeader()
                });
                setAssignments(response.data);
            } catch (error) {
                setError('Error fetching assignments');
                console.error('Error fetching assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [getAuthHeader]); // Empty dependency array since function is now inside


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await axios.delete(`http://localhost:5000/assignments/${id}`, {
                    headers: getAuthHeader()
                });
                setAssignments(assignments.filter((assignment) => assignment._id !== id));
            } catch (error) {
                setError('Error deleting assignment');
                console.error('Error deleting assignment:', error);
            }
        }
    };

    if (loading) return <div>Loading assignments...</div>;

    return (
        <div className="portal-container">
            <header className="portal-header">
                <h1>Staff Portal</h1>
                <div className="user-info">
                    <span>Welcome, {currentUser.username}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="portal-main">
                <h2>Manage Assignments</h2>
                {error && <p className="error-message">{error}</p>}
                
                {assignments.length === 0 ? (
                    <p>No assignments submitted yet.</p>
                ) : (
                    <div className="assignments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Assignment File</th>
                                    <th>Submitted By</th>
                                    <th>Submission Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((assignment) => (
                                    <tr key={assignment._id}>
                                        <td>
                                            <a 
                                                href={`http://localhost:5000/${assignment.filePath}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="download-link"
                                            >
                                                Download PDF
                                            </a>
                                        </td>
                                        <td>{assignment.studentName}</td>
                                        <td>{new Date(assignment.submissionDate).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDelete(assignment._id)}
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default StaffPortal;
