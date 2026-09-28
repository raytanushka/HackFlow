import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const trackOptions = [
  { value: 'all', label: 'All Tracks' },
  { value: 'developer-tools', label: 'Developer tools' },
  { value: 'data-analytics', label: 'Data & analytics' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'security', label: 'Security' },
  { value: 'climate', label: 'Climate' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'open-hardware', label: 'Open hardware' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'ai', label: 'AI' },
];

const hackathons = [
  {
    id: 'sample-hack-2026',
    name: 'SAMPLE HACK 2026',
    status: 'open',
    description:
      'Build innovative solutions across technology, accessibility, climate, health and education.',
    tracks: [
      'developer-tools',
      'data-analytics',
      'accessibility',
      'security',
      'climate',
      'health',
      'education',
      'open-hardware',
    ],
    trackLabels: [
      'Developer tools',
      'Data & analytics',
      'Accessibility',
      'Security',
      'Climate',
      'Health',
      'Education',
      'Open hardware',
    ],
    deadlineLabel: 'Submissions close',
    deadline: 'March 1, 2026 · 6:00 PM',
  },
  {
    id: 'fincode-hackathon',
    name: 'FINCODE HACKATHON',
    status: 'open',
    description: 'Design secure, scalable fintech tools — from payments infrastructure to fraud detection.',
    tracks: ['fintech', 'security', 'data-analytics'],
    trackLabels: ['FinTech', 'Security', 'Data & analytics'],
    deadlineLabel: 'Submissions close',
    deadline: 'Feb 14, 2026 · 11:59 PM',
  },
  {
    id: 'ai-for-good-summit',
    name: 'AI FOR GOOD SUMMIT',
    status: 'closed',
    description:
      'Apply machine learning to real-world social impact problems in health, education and accessibility.',
    tracks: ['ai', 'health', 'education', 'accessibility'],
    trackLabels: ['AI', 'Health', 'Education', 'Accessibility'],
    deadlineLabel: 'Submissions closed',
    deadline: 'Jan 10, 2026 · 6:00 PM',
  },
];

export default function AvailableHackathons() {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hackathons.filter((hack) => {
      const matchesQuery = hack.name.toLowerCase().includes(q);
      const matchesTrack = track === 'all' || hack.tracks.includes(track);
      return matchesQuery && matchesTrack;
    });
  }, [query, track]);

  return (
    <main>
      <div className="wrap">
        <div className="page-head">
          <h1>Available Hackathons</h1>
          <p>Find a hackathon that's right for you.</p>
        </div>

        <div className="search-row">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search hackathons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-select-wrap">
            <select value={track} onChange={(e) => setTrack(e.target.value)}>
              {trackOptions.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div className="hack-list">
          {filtered.map((hack) => (
            <article className="hack-card" key={hack.id}>
              <div className="hack-card-head">
                <h2>{hack.name}</h2>
                <span className={`status-badge ${hack.status}`}>{hack.status.toUpperCase()}</span>
              </div>
              <p className="hack-desc">{hack.description}</p>
              <div className="track-count">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41L11 4H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z" />
                  <circle cx="7.5" cy="7.5" r="1" />
                </svg>
                {hack.trackLabels.length} Tracks
              </div>
              <div className="track-grid">
                {hack.trackLabels.map((label) => (
                  <span className="track-item" key={label}>{label}</span>
                ))}
              </div>
              <div className="hack-card-foot">
                <div className="deadline">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div>
                    <strong>{hack.deadlineLabel}</strong>
                    {hack.deadline}
                  </div>
                </div>
                <Link to="/join-hackathon" className="btn-view">
                  View Details
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state" style={{ display: 'block' }}>
            No hackathons match your search. Try a different keyword or track.
          </div>
        )}
      </div>
    </main>
  );
}
