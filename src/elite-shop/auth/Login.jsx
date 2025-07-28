import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import { AppContext } from '../../Context/AppContext';

const { Title, Text } = Typography;

export default function Login() {
    const { setToken } = useContext(AppContext);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Enhanced email validation
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

    async function handleLogin(values) {
        setLoading(true);
        setErrors({});
        
        try {
            const res = await fetch("/api/login", {
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
                navigate(data.dashboard_route);
            }
        } catch (error) {
            console.error('Login error:', error);
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
                        <Title level={2}>Welcome Back</Title>
                        <Text>Sign in to your account to continue</Text>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleLogin}
                        className="auth-form"
                        autoComplete="off"
                    >
                        {Object.keys(errors).length > 0 && (
                            <Alert
                                message="Login Failed"
                                description={Object.values(errors).flat().join(' ')}
                                type="error"
                                showIcon
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[{ validator: validateEmail }]}
                        >
                            <Input 
                                prefix={<UserOutlined />} 
                                placeholder="Enter your email address"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please input your password!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Enter your password"
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
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Text type="secondary">
                                Don't have an account?{' '}
                                <a href="/register" className="auth-link">
                                    Create one here
                                </a>
                            </Text>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
}