import { Layout, Menu, Input, Badge, Button, Drawer, List, Typography } from 'antd';
import { ShoppingCartOutlined, FireOutlined, TagsOutlined, MenuOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { Link, useLocation } from "react-router-dom";
import '../../../App.css';

const { Header, Content } = Layout;
const { Search } = Input;
const { Text } = Typography;

export default function NavigationLayout({ children, pageTitle }) {
  const { user } = useContext(AppContext);
  const location = useLocation();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);

  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books', 'Beauty'];

  // Example static cart (replace with API later)
  useEffect(() => {
    setCartItems([
      { id: 1, name: 'Wireless Headphones', price: 120, quantity: 1 },
      { id: 2, name: 'Running Shoes', price: 80, quantity: 2 },
    ]);
    setCartCount(3);
  }, []);

  const handleSearch = (value) => {
    setSearchLoading(true);
    setTimeout(() => {
      console.log("Searching for:", value);
      setSearchLoading(false);
    }, 500);
  };

  const menuItems = [
    {
      key: 'featured',
      icon: <FireOutlined />,
      label: 'Featured',
      children: [
        { key: 'hot-sales', label: 'Hot Sales' },
        { key: 'new-arrivals', label: 'New Arrivals' }
      ]
    },
    {
      key: 'categories',
      icon: <TagsOutlined />,
      label: 'Categories',
      children: categories.map((cat, idx) => ({
        key: `cat-${idx}`,
        label: cat
      }))
    },
    ...(user?.role === "customer"
      ? [{
          key: "/customer/orders",
          icon: <ShoppingCartOutlined />,
          label: <Link to="/customer/orders">My Orders</Link>,
        }]
      : []),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        {/* Header with navigation */}
        <Header style={{
          padding: 0,
          background: '#fff',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<MenuOutlined />} 
              onClick={() => setDrawerVisible(true)}
              style={{ margin: '0 16px' }}
            />
            <h3 style={{ margin: 0 }}>{pageTitle}</h3>
          </div>

          <div style={{ marginRight: '24px', display: 'flex', alignItems: 'center' }}>
            <Search
              placeholder="Search products..."
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200, marginRight: '16px' }}
              loading={searchLoading}
            />
            <Badge count={cartCount} size="small">
              <Button 
                type="text" 
                shape="circle" 
                icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />} 
                onClick={() => setCartVisible(true)}
              />
            </Badge>
          </div>
        </Header>

        {/* Main content area */}
        <Content style={{ 
          padding: 24, 
          background: '#fff',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {children}
        </Content>
      </Layout>

      {/* Mobile menu drawer (for smaller screens) */}
      <Drawer
        title="Menu"
        placement="left"
        closable
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Drawer>

      {/* Cart drawer */}
      <Drawer
        title="Your Cart"
        placement="right"
        width={350}
        closable
        onClose={() => setCartVisible(false)}
        open={cartVisible}
      >
        {cartItems.length ? (
          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />} 
                    onClick={() => console.log('Remove', item.id)} 
                  />
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`$${item.price} x ${item.quantity}`}
                />
                <Text strong>${item.price * item.quantity}</Text>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">Your cart is empty.</Text>
        )}
        <div style={{ marginTop: 16 }}>
          <Button type="primary" block>
            Checkout
          </Button>
        </div>
      </Drawer>
    </Layout>
  );
}
