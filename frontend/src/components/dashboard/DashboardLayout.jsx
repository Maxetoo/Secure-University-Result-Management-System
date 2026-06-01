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
            <Link to="/dashboard">uniresult</Link>
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
  background: #f9fafb;
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
    background: var(--white-color);
    border-bottom: 1px solid #eee;
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

  &:hover {
    background: #f3f4f6;
  }

  &:active {
    background: #e5e7eb;
  }
`;

const Logo = styled.h2`
  font-size: 1.25rem;
  color: var(--primary-color);
  font-weight: 700;
  margin: 0;

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