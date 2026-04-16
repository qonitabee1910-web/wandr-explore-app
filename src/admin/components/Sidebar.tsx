/**
 * Admin Sidebar Navigation
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Navigation,
  Bus,
  DollarSign,
  Settings,
  Tag,
  Megaphone,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <BarChart3 size={20} />,
        path: '/admin/dashboard',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        id: 'drivers',
        label: 'Driver Management',
        icon: <Users size={20} />,
        path: '/admin/drivers',
        badge: 5,
      },
      {
        id: 'rides',
        label: 'Ride Monitoring',
        icon: <Navigation size={20} />,
        path: '/admin/rides',
      },
      {
        id: 'shuttles',
        label: 'Shuttle Management',
        icon: <Bus size={20} />,
        path: '/admin/shuttles',
      },
    ],
  },
  {
    title: 'Business',
    items: [
      {
        id: 'pricing',
        label: 'Pricing Control',
        icon: <DollarSign size={20} />,
        path: '/admin/pricing',
      },
      {
        id: 'promos',
        label: 'Promo Control',
        icon: <Tag size={20} />,
        path: '/admin/promos',
      },
      {
        id: 'ads',
        label: 'Ads Control',
        icon: <Megaphone size={20} />,
        path: '/admin/ads',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={20} />,
        path: '/admin/settings',
      },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>('Main');
  const [isMobileOpen, setIsMobileOpen] = useState(isOpen);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle navigation"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo/Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Bus size={28} className="brand-icon" />
            <span className="brand-name">PYU-GO Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section">
              {/* Section title (collapsible) */}
              <button
                className={`nav-section-title ${expandedSection === section.title ? 'expanded' : ''}`}
                onClick={() => toggleSection(section.title)}
              >
                <span>{section.title}</span>
                <ChevronDown size={16} />
              </button>

              {/* Section items */}
              <div
                className={`nav-items ${expandedSection === section.title ? 'visible' : 'hidden'}`}
              >
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsMobileOpen(false);
                      }
                    }}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <p className="text-xs text-gray-500">PYU-GO Admin Panel</p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
