import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [portfolios, setPortfolios] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [portfolioForm, setPortfolioForm] = useState({
        title: '',
        description: '',
        githubUrl: '',
        skills: '',
        is_public: true
    });
    const [mediaFile, setMediaFile] = useState(null);

    useEffect(() => {
        fetchPublicPortfolios();
    }, []);

    const fetchPublicPortfolios = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/public-portfolios');
            setPortfolios(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    const handleCreatePortfolio = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', portfolioForm.title);
            formData.append('description', portfolioForm.description);
            formData.append('githubUrl', portfolioForm.githubUrl);
            formData.append('skills', portfolioForm.skills);
            formData.append('is_public', portfolioForm.is_public);
            if (mediaFile) {
                formData.append('media', mediaFile);
            }

            await axios.post('http://localhost:5001/api/portfolios', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Reset form
            setPortfolioForm({
                title: '',
                description: '',
                githubUrl: '',
                skills: '',
                is_public: true
            });
            setMediaFile(null);
            fetchPublicPortfolios();
        } catch (error) {
            console.error('Error creating portfolio:', error);
            alert(error.response?.data?.error || 'Error creating portfolio');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Navigation */}
            <div style={{ marginBottom: '20px' }}>
                <button>Public Portfolios</button>
                {isLoggedIn ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <button onClick={() => window.location.href = '/login'}>Login</button>
                )}
            </div>

            {/* Portfolio Creation Form */}
            {isLoggedIn && (
                <div style={{ 
                    marginBottom: '30px',
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '5px'
                }}>
                    <h2>Create New Portfolio</h2>
                    <form onSubmit={handleCreatePortfolio}>
                        {/* Title */}
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="text"
                                placeholder="Portfolio Title"
                                value={portfolioForm.title}
                                onChange={(e) => setPortfolioForm({
                                    ...portfolioForm,
                                    title: e.target.value
                                })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '10px'
                                }}
                                required
                            />

                            {/* Description */}
                            <textarea
                                placeholder="Description"
                                value={portfolioForm.description}
                                onChange={(e) => setPortfolioForm({
                                    ...portfolioForm,
                                    description: e.target.value
                                })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '10px',
                                    minHeight: '100px'
                                }}
                                required
                            />

                            {/* GitHub URL */}
                            <input
                                type="url"
                                placeholder="GitHub Repository URL"
                                value={portfolioForm.githubUrl}
                                onChange={(e) => setPortfolioForm({
                                    ...portfolioForm,
                                    githubUrl: e.target.value
                                })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '10px'
                                }}
                            />

                            {/* Skills */}
                            <input
                                type="text"
                                placeholder="Skills (comma-separated)"
                                value={portfolioForm.skills}
                                onChange={(e) => setPortfolioForm({
                                    ...portfolioForm,
                                    skills: e.target.value
                                })}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '10px'
                                }}
                            />

                            {/* File Upload */}
                            <div style={{ marginBottom: '10px' }}>
                                <p style={{ marginBottom: '5px' }}>Project Media (Images, PDFs, etc.)</p>
                                <input
                                    type="file"
                                    onChange={(e) => setMediaFile(e.target.files[0])}
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                            </div>

                            {/* Public Toggle */}
                            <label style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={portfolioForm.is_public}
                                    onChange={(e) => setPortfolioForm({
                                        ...portfolioForm,
                                        is_public: e.target.checked
                                    })}
                                    style={{ marginRight: '8px' }}
                                />
                                Make this portfolio public
                            </label>
                        </div>
                        <button type="submit" style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            Create Portfolio
                        </button>
                    </form>
                </div>
            )}

            {/* Public Portfolios List */}
            <h2>Public Portfolios</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
                {portfolios.map(portfolio => (
                    <div key={portfolio.id} style={{
                        border: '1px solid #ddd',
                        padding: '20px',
                        borderRadius: '5px',
                        backgroundColor: '#fff'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>{portfolio.title}</h3>
                        <p style={{ margin: '0 0 10px 0' }}>{portfolio.description}</p>
                        
                        {/* GitHub Link */}
                        {portfolio.githubUrl && (
                            <div style={{ margin: '10px 0' }}>
                                <a 
                                    href={portfolio.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#007bff', textDecoration: 'none' }}
                                >
                                    View GitHub Repository
                                </a>
                            </div>
                        )}

                        {/* Skills */}
                        {portfolio.skills && (
                            <div style={{ margin: '10px 0' }}>
                                <strong>Skills: </strong>
                                {portfolio.skills.split(',').map((skill, index) => (
                                    <span 
                                        key={index}
                                        style={{
                                            background: '#e9ecef',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            marginRight: '5px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Media Preview */}
                        {portfolio.mediaUrl && (
                            <div style={{ margin: '10px 0' }}>
                                {portfolio.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <img 
                                        src={portfolio.mediaUrl} 
                                        alt="Portfolio media"
                                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                                    />
                                ) : (
                                    <a 
                                        href={portfolio.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#007bff', textDecoration: 'none' }}
                                    >
                                        View Project Documentation
                                    </a>
                                )}
                            </div>
                        )}

                        <small style={{ color: '#666', display: 'block', marginTop: '10px' }}>
                            Created by: {portfolio.username}
                        </small>
                    </div>
                ))}
                {portfolios.length === 0 && (
                    <p>No public portfolios available yet.</p>
                )}
            </div>
        </div>
    );
}

export default App;