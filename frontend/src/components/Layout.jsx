import Header from './Header';
import Footer from './Footer';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container className="fox-container flex-grow-1 py-4">
        {children}
      </Container>
      <Footer />
    </div>
  );
};

export default Layout;