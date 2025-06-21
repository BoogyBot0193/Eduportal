import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function StudentPortal() {
    const [assignmentFile, setAssignmentFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const { currentUser, logout, getAuthHeader } = useAuth();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a PDF file.');
                setAssignmentFile(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB.');
                setAssignmentFile(null);
                return;
            }
            setError('');
            setAssignmentFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('studentName', currentUser.username);
        formData.append('assignmentFile', assignmentFile);

        try {
            await axios.post('http://localhost:5000/upload', formData, {
               headers: {
                         'Content-Type': 'multipart/form-data',
                         ...getAuthHeader()
               },
            });
            setResponseMessage('Assignment submitted successfully!');
            setAssignmentFile(null);
            // Reset file input
            document.getElementById('assignment-file').value = '';
        } catch (error) {
            setError(error.response?.data?.error || 'Error uploading assignment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-container">
            <header className="portal-header">
                <h1>Student Portal</h1>
                <div className="user-info">
                    <span>Welcome, {currentUser.username}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="portal-main">
                <h2>Upload Your Assignment</h2>
                {error && <p className="error-message">{error}</p>}
                {responseMessage && <p className="success-message">{responseMessage}</p>}
                
                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="assignment-file">Choose Assignment File (PDF only):</label>
                        <input
                            type="file"
                            id="assignment-file"
                            onChange={handleFileChange}
                            accept=".pdf"
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading || !assignmentFile}>
                        {loading ? 'Uploading...' : 'Submit Assignment'}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default StudentPortal;
