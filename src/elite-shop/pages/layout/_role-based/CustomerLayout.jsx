import React, { useState, useContext } from 'react';
import { AppContext } from '../../../../Context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import { 
    BarChart3, 
    Users, 
    Building2, 
    Settings, 
    Eye, 
    Plus, 
    Edit3, 
    UserPlus, 
    FileText, 
    Activity, 
    Bell, 
    Lock, 
    ShoppingCart, 
    CheckCircle
} from 'lucide-react';
import '../../../../App.css';

const { Sider, Content } = Layout;
const { Text } = Typography;

export default function CustomerLayout({ children }) {
    const { user } = useContext(AppContext);
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState(['overview']);

    const sidebarItems = [
        {
            key: 'orders',
            icon: <Users size={18} />,
            label: 'Orders & Carts',
            children: [
                { key: 'view-orders', label: 'View Orders', icon: <Eye size={16} />, route: '/customer/orders' },
                { key: 'pending-orders', label: 'Pending Orders', icon: <FileText size={16} />, route: '/customer/orders/pending' },
                { key: 'in-progress-orders', label: 'In Progress', icon: <Activity size={16} />, route: '/customer/orders/in-progress' },
                { key: 'completed-orders', label: 'Completed Orders', icon: <CheckCircle size={16} />, route: '/customer/orders/completed' },
                { key: 'carts', label: 'Customer Carts', icon: <ShoppingCart size={16} />, route: '/customer/carts' }
            ]
        },
        {
            key: 'settings',
            icon: <Settings size={18} />,
            label: 'Settings',
            children: [
                { key: 'profile', label: 'Profile Settings', icon: <UserPlus size={16} />, route: '/customer/profile' },
                { key: 'security', label: 'Security Settings', icon: <Lock size={16} />, route: '/customer/security' },
                { key: 'notifications', label: 'Notifications', icon: <Bell size={16} />, route: '/customer/notifications' }
            ]
        }
    ];

    const handleNavigation = ({ key }) => {
        let route = '';
        for (const group of sidebarItems) {
            const found = group.children?.find(item => item.key === key);
            if (found) {
                route = found.route;
                break;
            }
        }
        if (route) {
            navigate(route);
            setSelectedKeys([key]);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                trigger={null}
                width={250}
                className="vendor-sidebar"
                breakpoint="lg"
                collapsedWidth={80}
            >
                <div className="sidebar-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: collapsed ? '16px 8px' : '16px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '8px'
                }}>
                    {!collapsed ? (
                        <Text strong className="text-black" style={{
                            fontSize: '18px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>DASHBOARD</Text>
                    ) : (
                        <Text strong className="text-black" style={{ fontSize: '18px' }}>E</Text>
                    )}
                    <Button 
                        type="text" 
                        icon={collapsed ? (
                            <MenuOutlined style={{ color: '#000', fontSize: '20px' }} />
                        ) : (
                            <ArrowLeftOutlined style={{ color: '#000', fontSize: '20px' }} />
                        )}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            minWidth: 'auto',
                            width: 'auto',
                            height: 'auto',
                            padding: '4px'
                        }}
                    />
                </div>

                <Menu
                    mode="inline"
                    defaultOpenKeys={['dashboard']}
                    selectedKeys={selectedKeys}
                    onClick={handleNavigation}
                    className="vendor-menu"
                >
                    {sidebarItems.map(item => (
                        <Menu.SubMenu
                            key={item.key}
                            icon={React.cloneElement(item.icon, { className: "text-black-300" })}
                            title={<span className="text-black-300">{item.label}</span>}
                        >
                            {item.children.map(child => (
                                <Menu.Item 
                                    key={child.key} 
                                    icon={React.cloneElement(child.icon, { className: "text-gray-300" })}
                                >
                                    {child.label}
                                </Menu.Item>
                            ))}
                        </Menu.SubMenu>
                    ))}
                </Menu>
            </Sider>

            <Layout>
                <Content className="vendor-content">
                    <div className="content-container">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}