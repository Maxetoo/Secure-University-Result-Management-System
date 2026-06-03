import { useState } from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    UploadCloud,
    Database,
    Building2,
    Users,
    Settings,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import { logout } from '../../slices/authSlice'

const DashboardSidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen }) => {
    const { user } = useSelector((store) => store.user)
    const dispatch = useDispatch()
    const location = useLocation()
    const [settingsOpen, setSettingsOpen] = useState(false)

    const role = user?.role

    const getMenuItems = () => {
        const items = [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        ]

        if (role === 'student') {
            items.push({ path: '/dashboard/results', icon: ClipboardList, label: 'My Results' })
        }
        if (role === 'lecturer') {
            items.push({ path: '/dashboard/results/upload', icon: UploadCloud, label: 'Upload Results' })
        }
        if (role === 'admin') {
            items.push({ path: '/dashboard/results/manage', icon: Database, label: 'All Results' })
            items.push({ path: '/dashboard/results/upload', icon: UploadCloud, label: 'Upload Results' })
        }

        if (['lecturer', 'admin'].includes(role)) {
            items.push({ path: '/dashboard/courses', icon: BookOpen, label: 'Courses' })
        }

        if (role === 'admin') {
            items.push({ path: '/dashboard/departments', icon: Building2, label: 'Departments' })
            items.push({ path: '/dashboard/users', icon: Users, label: 'Users' })
        }

        return items
    }

    const menuItems = getMenuItems()

    const settingsItems = [
        { path: '/dashboard/settings/profile', icon: User, label: 'Profile' },
        { path: '/dashboard/settings/account', icon: Settings, label: 'Account' },
    ]

    const handleLinkClick = () => setIsMobileOpen(false)

    const handleLogout = () => {
        dispatch(logout())
        setIsMobileOpen(false)
    }

    const isActive = (path) => location.pathname === path
    const isSettingsActive = settingsItems.some((item) => location.pathname === item.path)

    return (
        <>
            <Overlay $isOpen={isMobileOpen} onClick={() => setIsMobileOpen(false)} />
            <SidebarWrapper $isCollapsed={isCollapsed} $isMobileOpen={isMobileOpen}>
                <SidebarHeader>
                    {!isCollapsed && <Logo><Link to="/dashboard">ResultChecker</Link></Logo>}
                    <CollapseButton onClick={toggleSidebar} className="desktop-only">
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </CollapseButton>
                </SidebarHeader>

                <MenuList>
                    {menuItems.map((item) => (
                        <MenuItem key={item.path + item.label} $isActive={isActive(item.path)}>
                            <Link to={item.path} onClick={handleLinkClick}>
                                <item.icon size={20} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        </MenuItem>
                    ))}

                    <SettingsSection>
                        <SettingsToggle
                            $isActive={isSettingsActive}
                            onClick={() => setSettingsOpen(!settingsOpen)}
                        >
                            <div className="settings-header">
                                <Settings size={20} />
                                {!isCollapsed && <span>Settings</span>}
                            </div>
                            {!isCollapsed && (settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                        </SettingsToggle>

                        {settingsOpen && !isCollapsed && (
                            <SettingsSubmenu>
                                {settingsItems.map((item) => (
                                    <MenuItem key={item.path} $isActive={isActive(item.path)} $isSubmenu>
                                        <Link to={item.path} onClick={handleLinkClick}>
                                            <item.icon size={18} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </MenuItem>
                                ))}
                            </SettingsSubmenu>
                        )}
                    </SettingsSection>

                    <SignOutItem>
                        <button onClick={handleLogout}>
                            <LogOut size={20} />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </SignOutItem>
                </MenuList>
            </SidebarWrapper>
        </>
    )
}

const Overlay = styled.div`
    display: none;
    @media (max-width: 768px) {
        display: ${(p) => p.$isOpen ? 'block' : 'none'};
        position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 999; backdrop-filter: blur(2px);
    }
`

const SidebarWrapper = styled.aside`
    width: ${(p) => p.$isCollapsed ? '80px' : '260px'};
    background: var(--secondary-color);
    border-right: 1px solid var(--stroke-color);
    transition: all 0.3s ease;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
    top: 0;
    left: 0;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: #3a4060; border-radius: 3px; }

    @media (max-width: 768px) {
        width: 280px;
        transform: ${(p) => p.$isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: ${(p) => p.$isMobileOpen ? '4px 0 24px rgba(0,0,0,0.4)' : 'none'};
        .desktop-only { display: none; }
    }
`

const SidebarHeader = styled.div`
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--stroke-color);
    @media (max-width: 768px) { padding: 0 1.25rem; }
`

const Logo = styled.h2`
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: var(--primary-color);
    margin: 0;
    letter-spacing: -0.01em;
    white-space: nowrap;
    a { color: inherit; text-decoration: none; }
    @media (max-width: 768px) { font-size: 0.95rem; }
`

const CollapseButton = styled.button`
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--primary-color);
    border-radius: 6px;
    cursor: pointer;
    color: #ffffff;
    transition: all 0.2s;
    flex-shrink: 0;
    &:hover { opacity: 0.9; }
`

const MenuList = styled.nav`
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    @media (max-width: 768px) { padding: 1rem 0.875rem; }
`

const MenuItem = styled.div`
    a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: ${(p) => p.$isSubmenu ? '0.625rem 1rem 0.625rem 2.5rem' : '0.75rem 1rem'};
        border-radius: 10px;
        color: ${(p) => p.$isActive ? '#ffffff' : 'var(--light-text-color)'};
        background: ${(p) => p.$isActive ? 'var(--primary-color)' : 'transparent'};
        font-weight: ${(p) => p.$isActive ? '600' : '500'};
        font-size: ${(p) => p.$isSubmenu ? '0.9rem' : '0.95rem'};
        transition: all 0.2s;
        text-decoration: none;
        width: 100%;
        box-sizing: border-box;

        &:hover {
            background: ${(p) => p.$isActive ? 'var(--primary-color)' : 'rgba(99, 102, 241, 0.1)'};
            color: ${(p) => p.$isActive ? '#ffffff' : 'var(--highlight-color)'};
        }

        svg { flex-shrink: 0; }
        span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }

    @media (max-width: 768px) {
        a { padding: ${(p) => p.$isSubmenu ? '0.75rem 1rem 0.75rem 2.5rem' : '0.875rem 1rem'}; font-size: ${(p) => p.$isSubmenu ? '0.875rem' : '0.95rem'}; }
    }
`

const SettingsSection = styled.div`margin-top: 0.5rem;`

const SettingsToggle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    color: ${(p) => p.$isActive ? 'var(--highlight-color)' : 'var(--light-text-color)'};
    background: ${(p) => p.$isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent'};
    font-weight: ${(p) => p.$isActive ? '600' : '500'};
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;

    .settings-header { display: flex; align-items: center; gap: 0.75rem; }

    &:hover {
        background: ${(p) => p.$isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)'};
        color: var(--highlight-color);
    }

    svg { flex-shrink: 0; }
    span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    @media (max-width: 768px) { padding: 0.875rem 1rem; }
`

const SettingsSubmenu = styled.div`
    margin-top: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`

const SignOutItem = styled.div`
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--stroke-color);

    button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        color: var(--error-color);
        background: transparent;
        font-size: 0.95em;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;

        &:hover { background: rgba(248, 113, 113, 0.1); }
    }
`

export default DashboardSidebar
