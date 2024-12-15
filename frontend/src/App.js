import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [portfolios, setPortfolios] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState({});
  const [githubUrls, setGithubUrls] = useState({});

  useEffect(() => {
    getPortfolios();
  }, []);

  const getPortfolios = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/portfolios');
      setPortfolios(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addPortfolio = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/portfolios', { title, description });
      setTitle('');
      setDescription('');
      getPortfolios();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addSkill = async (e, portfolioId) => {
    e.preventDefault();
    try {
      const skillName = skills[portfolioId] || '';
      await axios.post(`http://localhost:5001/api/skills/${portfolioId}`, { 
        name: skillName,
        level: 1
      });
      setSkills(prev => ({ ...prev, [portfolioId]: '' }));
      getPortfolios();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addGithubRepo = async (e, portfolioId) => {
    e.preventDefault();
    try {
      const repoUrl = githubUrls[portfolioId] || '';
      await axios.post(`http://localhost:5001/api/repos/${portfolioId}`, {
        repo_url: repoUrl,
        repo_name: repoUrl.split('/').pop()
      });
      setGithubUrls(prev => ({ ...prev, [portfolioId]: '' }));
      getPortfolios();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Portfolio Builder</h1>
      
      {/* Create new portfolio */}
      <form onSubmit={addPortfolio} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Portfolio Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button type="submit">Add Portfolio</button>
      </form>

      {/* Empty portfolio placeholder */}
      <div style={{ 
        border: '1px dashed #ccc',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        <p style={{ color: '#666' }}>Add a new portfolio using the form above</p>
      </div>

      {/* Portfolio List */}
      <div>
        {portfolios.map(portfolio => (
          <div key={portfolio.id} style={{ 
            border: '1px solid #ddd',
            margin: '10px 0',
            padding: '15px',
            borderRadius: '4px'
          }}>
            <h3>{portfolio.title}</h3>
            <p>{portfolio.description}</p>

            {/* Skills Form */}
            <form onSubmit={(e) => addSkill(e, portfolio.id)} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Add Skill"
                value={skills[portfolio.id] || ''}
                onChange={(e) => setSkills(prev => ({ ...prev, [portfolio.id]: e.target.value }))}
                style={{ marginRight: '10px' }}
              />
              <button type="submit">Add Skill</button>
            </form>

            {/* Skills Display */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <h4>Skills:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {portfolio.skills.map(skill => (
                    <span key={skill.id} style={{
                      backgroundColor: '#e1e1e1',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '14px'
                    }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Repo Form */}
            <form onSubmit={(e) => addGithubRepo(e, portfolio.id)}>
              <input
                type="text"
                placeholder="GitHub Repository URL"
                value={githubUrls[portfolio.id] || ''}
                onChange={(e) => setGithubUrls(prev => ({ ...prev, [portfolio.id]: e.target.value }))}
                style={{ marginRight: '10px', width: '300px' }}
              />
              <button type="submit">Add GitHub Repo</button>
            </form>

            {/* Repos Display */}
            {portfolio.repos && portfolio.repos.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <h4>GitHub Repositories:</h4>
                {portfolio.repos.map(repo => (
                  <div key={repo.id} style={{ margin: '5px 0' }}>
                    <a href={repo.repo_url} target="_blank" rel="noopener noreferrer"
                       style={{ color: '#0366d6', textDecoration: 'none' }}>
                      {repo.repo_name}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;