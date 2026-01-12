import React, { useState } from 'react';
import '../styles/contact.css';

export default function Contact() {
    const [interest, setInterest] = useState('biotech');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState({ submitting: false, success: false, error: null });

    // TODO: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDfLjGE0UDWyJjCBbpCNH13CWkVg6HVSJOi8MJd84WandPnm2cPOwXcG2JrxjKnvo/exec";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (GOOGLE_SCRIPT_URL === "INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE") {
            alert("Please deploy the Google Apps Script and update the URL in Contact.jsx first.");
            return;
        }

        setStatus({ submitting: true, success: false, error: null });

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    interest,
                    ...formData,
                    source: 'Contact Page'
                }),
            });

            if (response.ok) {
                setStatus({ submitting: false, success: true, error: null });
                setFormData({ name: '', email: '', message: '' }); // Reset form
                setInterest('biotech');
            } else {
                throw new Error("Network response was not ok");
            }
        } catch (error) {
            console.error("Form error:", error);
            setStatus({ submitting: false, success: false, error: "Failed to submit. Please try again." });
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-container">
                <div className="form-card">
                    <h2 style={{ color: 'white', marginTop: 0, textAlign: 'center' }}>Request Access</h2>
                    <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '2rem' }}>
                        Select your area of interest to reach the appropriate team.
                    </p>

                    {status.success ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px' }}>
                            <h3>Request Received</h3>
                            <p>Thank you. Our team will review your profile and contact you shortly.</p>
                            <button
                                onClick={() => setStatus({ ...status, success: false })}
                                style={{ marginTop: '1rem', background: 'transparent', border: '1px solid currentColor', color: '#4ade80', padding: '0.5rem 1rem', cursor: 'pointer' }}
                            >
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>I am interested in</label>
                                <select value={interest} onChange={(e) => setInterest(e.target.value)}>
                                    <option value="biotech">Biotech Asset Opportunities (Tokenized)</option>
                                    <option value="treasury">Bitcoin Treasury (Convertible Notes)</option>
                                    <option value="general">General Inquiries</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    rows="4"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us about your firm or investment thesis..."
                                    required
                                ></textarea>
                            </div>

                            {status.error && (
                                <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
                                    {status.error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={status.submitting}
                                style={{ opacity: status.submitting ? 0.7 : 1 }}
                            >
                                {status.submitting ? 'Sending...' : 'Send Inquiry'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
