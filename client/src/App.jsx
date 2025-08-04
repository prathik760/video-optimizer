import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [description, setDescription] = useState("");
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const API_BASE = "https://video-optimizer-backend.onrender.com";

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleFetch = async (url, body, errorMessage) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(errorMessage, error);
      alert(errorMessage);
      return null;
    }
  };

  const generateTitles = async () => {
    setLoadingTitles(true);
    const data = await handleFetch(
      `${API_BASE}/api/generate-title`,
      { title, topic },
      "Failed to generate titles. The server might be down or experiencing issues."
    );
    if (data) {
      setResults(data.suggestions || []);
    }
    setLoadingTitles(false);
  };

  const generateKeywords = async () => {
    setLoadingKeywords(true);
    const data = await handleFetch(
      `${API_BASE}/api/generate-keywords`,
      { title },
      "Failed to generate keywords. The server might be down or experiencing issues."
    );
    if (data) {
      const filtered = (data.keywords || [])
        .map((kw) => kw.trim().toLowerCase().replace(/\s+/g, ""))
        .filter((kw) => kw && kw !== "sure");
      const tagged = filtered.map((kw) => `#${kw}`);
      setKeywords(tagged);
    }
    setLoadingKeywords(false);
  };

  const generateDescription = async () => {
    setLoadingDescription(true);
    const data = await handleFetch(
      `${API_BASE}/api/generate-description`,
      { title },
      "Failed to generate description. The server might be down or experiencing issues."
    );
    if (data) {
      setDescription(data.description || "");
    }
    setLoadingDescription(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <div className="container">
      <div className="toggle-container">
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
        <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
      </div>

      <h2 className="heading">🎯 AI Video Title Optimizer</h2>

      <input
        type="text"
        placeholder="Enter video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Enter topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="input"
      />

      <button
        className="button"
        onClick={generateTitles}
        disabled={loadingTitles || !title || !topic}
      >
        {loadingTitles ? "Generating Titles..." : "Generate Titles"}
      </button>

      <ul>
        {results.map((item, i) => (
          <li key={i} className="list-item">
            {item}
          </li>
        ))}
      </ul>

      <hr className="divider" />

      <h3 className="sub-heading">📈 SEO Suggestions</h3>

      <button
        className="button"
        onClick={generateKeywords}
        disabled={!title || loadingKeywords}
      >
        {loadingKeywords ? "Generating Hashtags..." : "Generate Hashtags"}
      </button>

      
        {keywords.map((kw, i) => (
          <li key={i} className="list-item">
            {kw}
          </li>
        ))}
      

      {keywords.length > 0 && (
        <button
          className="button copy"
          onClick={() => copyToClipboard(keywords.join(" "))}
        >
          Copy Hashtags
        </button>
      )}

      <button
        className="button"
        onClick={generateDescription}
        disabled={!title || loadingDescription}
      >
        {loadingDescription ? "Generating Description..." : "Generate Description"}
      </button>

      <p className="description">{description}</p>

      {description && (
        <button
          className="button copy"
          onClick={() => copyToClipboard(description)}
        >
          Copy Description
        </button>
      )}
    </div>
  );
}

export default App;
