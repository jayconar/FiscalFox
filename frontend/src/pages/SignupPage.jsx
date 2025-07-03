import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
    const [userData, setUserData] = useState({ 
        username: '', 
        email: '', 
        password: '' 
    });
    const [loading, setLoading] = useState(false);
    const { signup, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const successMessage = location.state?.success;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (userData.password.length < 8) {
            alert('Password must be at least 8 characters');
            setLoading(false);
            return;
        }
        
        try {
            await signup(userData);
        } catch (err) {
            console.error('Signup failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="fox-card w-100" style={{ maxWidth: '400px' }}>
                <Card.Body>
                    <Card.Title className="text-center mb-4">Create Account</Card.Title>
                    
                    {successMessage && (
                        <Alert variant="success">
                            Account created successfully! Please log in.
                        </Alert>
                    )}
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={handleChange}
                                required
                                placeholder="Choose a username"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a password"
                                minLength={8}
                            />
                            <Form.Text className="text-muted">
                                At least 8 characters
                            </Form.Text>
                        </Form.Group>
                        
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 mb-3"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </Form>
                    
                    <div className="text-center mt-3">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default SignupPage;