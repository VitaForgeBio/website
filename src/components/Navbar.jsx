import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Team</NavLink>
            <NavLink to="/investors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Investors</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Asset Dashboard</NavLink>
            <NavLink to="/treasury" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Bitcoin Treasury</NavLink>
        </nav>
    );
}
