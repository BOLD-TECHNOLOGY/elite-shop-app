import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppContext';

const { Title, Text } = Typography;

export default function Register() {
    const { setToken } = useContext(AppContext);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState('');

    const validateEmail = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Please input your email!'));
        }
        
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!emailRegex.test(value)) {
            return Promise.reject(new Error('Please enter a valid email address!'));
        }
        
        return Promise.resolve();
    };

    const checkPasswordStrength = (password) => {
        if (!password) {
            setPasswordStrength('');
            return;
        }

        let score = 0;
        const feedback = [];

        if (password.length >= 8) score += 1;
        else feedback.push('at least 8 characters');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('an uppercase letter');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('a lowercase letter');

        if (/\d/.test(password)) score += 1;
        else feedback.push('a number');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('a special character');

        if (score < 3) {
            setPasswordStrength('weak');
        } else if (score < 5) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('strong');
        }

        return { score, feedback };
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 'weak':
                return 'Password strength: Weak';
            case 'medium':
                return 'Password strength: Medium';
            case 'strong':
                return 'Password strength: Strong';
            default:
                return '';
        }
    };

    async function handleRegister(values) {
        setLoading(true);
        setErrors({});
        
        try {
            const res = await fetch("/api/register", {
                method: "post",
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (data.errors) {
                setErrors(data.errors);
            } else {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                navigate("/");
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: ['An error occurred. Please try again.'] });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-content">
                <Card className="auth-card">
                    <div className="card-header">
                        <UserOutlined style={{ fontSize: '48px' }} />
                        <Title level={2}>Join Our Community</Title>
                        <Text>Create your account and start your journey with us</Text>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleRegister}
                        className="auth-form"
                        autoComplete="off"
                    >
                        {Object.keys(errors).length > 0 && (
                            <Alert
                                message="Registration Failed"
                                description={Object.values(errors).flat().join(' ')}
                                type="error"
                                showIcon
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        <Form.Item
                            name="name"
                            label="Full Name"
                            rules={[
                                { required: true, message: 'Please input your full name!' },
                                { min: 2, message: 'Name must be at least 2 characters' },
                                { max: 50, message: 'Name cannot exceed 50 characters' },
                                { pattern: /^[a-zA-Z\s]+$/, message: 'Name can only contain letters and spaces' }
                            ]}
                        >
                            <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Enter your full name"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[{ validator: validateEmail }]}
                        >
                            <Input 
                                prefix={<MailOutlined />} 
                                placeholder="Enter your email address"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Create a strong password"
                                size="large"
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                onChange={(e) => checkPasswordStrength(e.target.value)}
                            />
                            {passwordStrength && (
                                <div className={`password-strength ${passwordStrength}`}>
                                    {getPasswordStrengthText()}
                                </div>
                            )}
                        </Form.Item>

                        <Form.Item
                            name="password_confirmation"
                            label="Confirm Password"
                            rules={[
                                { required: true, message: 'Please confirm your password!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm your password"
                                size="large"
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                size="large"
                                loading={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Text type="secondary">
                                Already have an account?{' '}
                                <a href="/login" className="auth-link">
                                    Sign in here
                                </a>
                            </Text>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
}