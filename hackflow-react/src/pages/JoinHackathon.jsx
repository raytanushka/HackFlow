import { useState } from 'react';
import { Link } from 'react-router-dom';

const initialValues = { fullName: '', studentId: '', email: '', college: '' };

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function JoinHackathon() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: false }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(false);

    const nextErrors = {
      fullName: values.fullName.trim().length === 0,
      studentId: values.studentId.trim().length === 0,
      email: !isValidEmail(values.email.trim()),
      college: values.college.trim().length === 0,
    };
    setErrors(nextErrors);

    const hasError = Object.values(nextErrors).some(Boolean);
    if (!hasError) {
      setSubmitted(true);
      setValues(initialValues);
    }
  }

  return (
    <main>
      <div className="wrap">
        <Link to="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Home
        </Link>

        <div className="content-grid">
          <div>
            <div className="badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Participant Registration
            </div>

            <h1 className="page-title">
              Join <span className="accent">Hackathon</span>
            </h1>
            <p className="page-sub">
              Be a part of innovative ideas, build with like-minded people, and turn your skills into
              real-world impact.
            </p>

            <div className="form-card">
              <h2>Your Details</h2>
              <p className="form-desc">Fill in the information below to register as a participant.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className={`field${errors.fullName ? ' invalid' : ''}`}>
                  <label htmlFor="fullName">
                    Full Name<span className="req">*</span>
                  </label>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                    </svg>
                    <input
                      type="text"
                      id="fullName"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      value={values.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="error-msg">Please enter your full name.</div>
                </div>

                <div className={`field${errors.studentId ? ' invalid' : ''}`}>
                  <label htmlFor="studentId">
                    Student ID<span className="req">*</span>
                  </label>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="6" y1="15" x2="10" y2="15" />
                      <circle cx="8" cy="10" r="1.5" />
                    </svg>
                    <input
                      type="text"
                      id="studentId"
                      placeholder="e.g. 2024CS001"
                      value={values.studentId}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="error-msg">Please enter your student ID.</div>
                </div>

                <div className={`field${errors.email ? ' invalid' : ''}`}>
                  <label htmlFor="email">
                    Email Address<span className="req">*</span>
                  </label>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <polyline points="2 6 12 13 22 6" />
                    </svg>
                    <input
                      type="email"
                      id="email"
                      placeholder="you@college.edu"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="error-msg">Please enter a valid email address.</div>
                </div>

                <div className={`field${errors.college ? ' invalid' : ''}`}>
                  <label htmlFor="college">
                    College Name<span className="req">*</span>
                  </label>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18" />
                      <path d="M5 21V9l7-5 7 5v12" />
                      <line x1="9" y1="21" x2="9" y2="13" />
                      <line x1="15" y1="21" x2="15" y2="13" />
                    </svg>
                    <input
                      type="text"
                      id="college"
                      placeholder="Enter your college name"
                      value={values.college}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="error-msg">Please enter your college name.</div>
                </div>

                <button type="submit" className="btn-continue">
                  Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>

                {submitted && (
                  <div className="success-msg" style={{ display: 'block' }}>
                    You're registered! Redirecting you to the next step…
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="side">
            <div className="art-wrap">
              <svg viewBox="0 0 460 380" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="screen2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#241f45" />
                    <stop offset="100%" stopColor="#100e20" />
                  </linearGradient>
                </defs>
                <path d="M20 24l4 4-4 4-4-4z" fill="#c9b6ff" opacity="0.7" />
                <path d="M430 60l3 3-3 3-3-3z" fill="#c9b6ff" opacity="0.6" />
                <path d="M420 300l4 4-4 4-4-4z" fill="#c9b6ff" opacity="0.5" />
                <path d="M100 300 L360 300 L385 320 L75 320 Z" fill="#181828" stroke="#2d2b48" strokeWidth="1.5" />
                <rect x="115" y="90" width="230" height="210" rx="12" fill="url(#screen2)" stroke="#3a3660" strokeWidth="2" />
                <rect x="128" y="106" width="204" height="180" rx="4" fill="#0a0916" stroke="#2a2748" strokeWidth="1" />
                <line x1="160" y1="145" x2="270" y2="145" stroke="#8b7bff" strokeWidth="6" strokeLinecap="round" />
                <line x1="160" y1="163" x2="245" y2="163" stroke="#4a4470" strokeWidth="5" strokeLinecap="round" />
                <rect x="158" y="188" width="122" height="54" rx="7" fill="#1c1a3a" stroke="#3a3660" strokeWidth="1.5" />
                <line x1="170" y1="204" x2="245" y2="204" stroke="#5b4fd6" strokeWidth="4" strokeLinecap="round" />
                <line x1="170" y1="218" x2="225" y2="218" stroke="#332f57" strokeWidth="4" strokeLinecap="round" />
                <g transform="translate(40,150)">
                  <rect x="0" y="0" width="60" height="60" rx="14" fill="#141226" stroke="#3a3660" strokeWidth="1.5" />
                  <text x="30" y="38" textAnchor="middle" fontFamily="monospace" fontSize="18" fill="#8b7bff">&lt;/&gt;</text>
                </g>
                <g transform="translate(200,20)">
                  <rect x="0" y="0" width="56" height="56" rx="14" fill="#141226" stroke="#3a3660" strokeWidth="1.5" />
                  <circle cx="28" cy="24" r="11" fill="none" stroke="#8b7bff" strokeWidth="2.5" />
                  <line x1="23" y1="40" x2="33" y2="40" stroke="#8b7bff" strokeWidth="2.5" strokeLinecap="round" />
                </g>
                <g transform="translate(360,140)">
                  <rect x="0" y="0" width="60" height="60" rx="14" fill="#141226" stroke="#3a3660" strokeWidth="1.5" />
                  <circle cx="30" cy="22" r="9" fill="#8b7bff" />
                  <path d="M14 46c2-10 8-15 16-15s14 5 16 15" fill="#8b7bff" />
                </g>
                <path d="M360 40 C410 70 425 140 390 190" stroke="#5b4fd6" strokeWidth="1" fill="none" opacity="0.4" />
              </svg>
            </div>

            <div className="benefits">
              <div className="benefit">
                <div className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h7l-1 8 11-14h-7l0-6z" />
                  </svg>
                </div>
                <div>
                  <h3>Build Your Skills</h3>
                  <p>Work on real-world problems and learn from the best.</p>
                </div>
              </div>
              <div className="benefit">
                <div className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h3>Meet Like-Minded People</h3>
                  <p>Collaborate, create and grow with amazing teammates.</p>
                </div>
              </div>
              <div className="benefit">
                <div className="benefit-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
                    <path d="M7 6H4a1 1 0 0 0-1 1c0 2 1.5 4 4 4" />
                    <path d="M17 6h3a1 1 0 0 1 1 1c0 2-1.5 4-4 4" />
                  </svg>
                </div>
                <div>
                  <h3>Win Exciting Prizes</h3>
                  <p>Showcase your talent and get recognized.</p>
                </div>
              </div>
            </div>

            <div className="handwritten">
              Good ideas start with people
              <br />
              who show up.
              <span className="underline"></span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
