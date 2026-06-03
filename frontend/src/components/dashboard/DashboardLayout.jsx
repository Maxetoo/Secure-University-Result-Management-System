import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet, Link } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <Wrapper>
      <DashboardSidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <MainContent $isCollapsed={isCollapsed}>
        <MobileHeader>
          <MobileMenuButton onClick={() => setIsMobileOpen(true)}>
            <Menu size={24} />
          </MobileMenuButton>
          <Logo>
            <Link to="/dashboard">ResultChecker</Link>
          </Logo>
          <Spacer />
        </MobileHeader>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--background-color);
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.$isCollapsed ? '80px' : '260px'};
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  width: calc(100% - ${props => props.$isCollapsed ? '80px' : '260px'});
  max-width: 100vw;
  overflow-x: hidden;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const MobileHeader = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 1rem;
    background: var(--secondary-color);
    border-bottom: 1px solid var(--stroke-color);
    position: sticky;
    top: 0;
    z-index: 100;
  }
`;

const MobileMenuButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: rgba(99, 102, 241, 0.1); }
  &:active { background: rgba(99, 102, 241, 0.15); }
`;

const Logo = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
  letter-spacing: -0.01em;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Spacer = styled.div`
  width: 40px;
`;

const ContentArea = styled.div`
  padding: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

export default DashboardLayout;
