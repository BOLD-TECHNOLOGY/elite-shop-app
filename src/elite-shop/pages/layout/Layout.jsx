import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { DownOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Layout, Menu, Dropdown, Button, Avatar, Space, Typography } from 'antd';
import '../../../App.css'; 

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, token, setUser, setToken } = useContext(AppContext);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    async function handleLogout(e) {
        if (e && typeof e.preventDefault === "function") {
            e.preventDefault();
        }
        
        const res = await fetch("/api/logout", {
            method: "post",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        const data = await res.json();
        console.log(data);
        
        if (res.ok) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            navigate("/");
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item 
                key="logout" 
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                danger
            >
                Logout
            </Menu.Item>
        </Menu>
    );

    const authMenu = (
        <Menu>
            <Menu.Item key="login">
                <Link to="/login">Login</Link>
            </Menu.Item>
            <Menu.Item key="register">
                <Link to="/register">Register</Link>
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout className="layout">
            <Header className="nav-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" className="nav-link logo">
                    ELITE SHOP
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {user ? (
                        <Dropdown 
                            overlay={userMenu} 
                            trigger={['click']}
                            placement="bottomRight"
                            getPopupContainer={trigger => trigger.parentNode}
                        >
                            <Space className="user-dropdown" style={{ cursor: 'pointer', padding: '0 10px' }}>
                                <Avatar className="bg-primary" size="default">
                                    {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Text strong>{user.name}</Text>
                                <DownOutlined />
                            </Space>
                        </Dropdown>
                    ) : (
                        <>
                            <div className="auth-links desktop-nav">
                                <Button type="text">
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button type="primary">
                                    <Link to="/register">Register</Link>
                                </Button>
                            </div>
                            
                            <Dropdown 
                                overlay={authMenu} 
                                trigger={['click']}
                                placement="bottomRight"
                                getPopupContainer={trigger => trigger.parentNode}
                                className="mobile-menu"
                            >
                                <Button type="text" icon={<MenuOutlined />} />
                            </Dropdown>
                        </>
                    )}
                </div>
            </Header>
            
            <Content className="main-content">
                <Outlet />
            </Content>
        </Layout>
    );
}