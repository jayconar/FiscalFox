import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import CashLogo from './CashLogo';
import '../index.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    setExpanded(false);
    navigate('/login');
  };

  const closeMenu = () => setExpanded(false);

  return (
    <Navbar bg="light" expand="lg" expanded={expanded} className="fox-header">
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={closeMenu} className="d-flex align-items-center">
          <CashLogo size={32} className="me-2" />
          <span className="logo-text">FiscalFox</span>
        </Navbar.Brand>
        
        <Navbar.Toggle onClick={() => setExpanded(!expanded)} aria-controls="main-nav" />
        
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto d-flex gap-3">
            {currentUser ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/" 
                  active={location.pathname === '/'} 
                  onClick={closeMenu}
                >
                  Dashboard
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/transactions" 
                  active={location.pathname === '/transactions'} 
                  onClick={closeMenu}
                >
                  Transactions
                </Nav.Link>
                
                <div className="d-lg-none mobile-account-info">
                  <div className="account-details">
                    <strong>{currentUser.username}</strong>
                    <br />
                    <small>{currentUser.email}</small>
                  </div>
                  <Nav.Link 
                    as={Link} 
                    to="#" 
                    onClick={handleLogout}
                    className="logout-link-mobile"
                  >
                    Logout
                  </Nav.Link>
                </div>
                
                <NavDropdown 
                  title="My Account" 
                  id="account-dropdown" 
                  align="end"
                  className="d-none d-lg-block"
                >
                  <NavDropdown.ItemText>
                    <strong>{currentUser.username}</strong>
                    <br />
                    <small>{currentUser.email}</small>
                  </NavDropdown.ItemText>
                  <NavDropdown.Divider />
                  <NavDropdown.Item 
                    onClick={handleLogout} 
                    className="logout-link"
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  active={location.pathname === '/login'} 
                  onClick={closeMenu}
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/signup" 
                  active={location.pathname === '/signup'} 
                  onClick={closeMenu}
                >
                  Signup
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;