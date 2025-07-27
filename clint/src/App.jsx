import { useState, useEffect } from "react";
import './App.css'
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

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
  }, [darkMode]);

  const generateTitles = async () => {
    setLoadingTitles(true);
    try {
      const res = await fetch("http://localhost:5001/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, topic }),
      });
      const data = await res.json();
      setResults(data.suggestions || []);
    } catch {
      alert("Failed to generate titles.");
    } finally {
      setLoadingTitles(false);
    }
  };

  const generateKeywords = async () => {
    setLoadingKeywords(true);
    try {
      const res = await fetch("http://localhost:5001/api/generate-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();

      const filtered = (data.keywords || [])
        .map((kw) => kw.trim().toLowerCase().replace(/\s+/g, ""))
        .filter((kw) => kw && kw !== "sure");

      const tagged = filtered.map((kw) => `#${kw}`);
      setKeywords(tagged);
    } catch {
      alert("Failed to generate keywords.");
    } finally {
      setLoadingKeywords(false);
    }
  };

  const generateDescription = async () => {
    setLoadingDescription(true);
    try {
      const res = await fetch("http://localhost:5001/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      setDescription(data.description || "");
    } catch {
      alert("Failed to generate description.");
    } finally {
      setLoadingDescription(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  const toggleStyle = {
    position: "absolute",
    top: 20,
    right: 30,
  };

  return (
    <div className={`container ${darkMode ? "dark-mode" : ""}`}>
      <div className="toggle-container">
  <label className="switch">
    <input
      type="checkbox"
      onChange={(e) =>
        document.body.classList.toggle("dark-mode", e.target.checked)
      }
    />
    <span className="slider"></span>
  </label>
  <span>{document.body.classList.contains("dark-mode") ? "Dark Mode" : "Light Mode"}</span>
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
        disabled={loadingTitles}
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

      <ul>
        {keywords.map((kw, i) => (
          <li key={i} className="list-item">
            {i + 1}. {kw}
          </li>
        ))}
      </ul>

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