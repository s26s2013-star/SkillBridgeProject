import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Award, Target, Briefcase, Users, User, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';
import logo from '../../assets/logo.png';

export const Sidebar = ({ user, onLogout }) => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Skills', path: '/skills', icon: Award },
        { name: 'Assessment', path: '/assessment', icon: Target },
        { name: 'Jobs', path: '/jobs', icon: Briefcase },
        { name: 'Matches', path: '/matches', icon: Users },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo-wrapper">
                    <img src={logo} alt="SkillsBridge Logo" className="sidebar-logo" />
                </div>
                <h1 className="sidebar-title">SkillsBridge</h1>
            </div>


            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <Icon size={20} className="nav-icon" />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}

            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div className="user-details">
                        <span className="user-name">{user?.name || 'Student'}</span>
                        <span className="user-role">Student</span>
                    </div>
                </div>
                <button className="logout-button" onClick={onLogout}>
                    <LogOut size={20} />
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
};
