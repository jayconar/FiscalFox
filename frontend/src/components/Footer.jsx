import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-auto">
      <Container>
        <p className="text-center mb-0">
          &copy; {new Date().getFullYear()} FiscalFox - Personal Finance App
        </p>
      </Container>
    </footer>
  );
};

export default Footer;