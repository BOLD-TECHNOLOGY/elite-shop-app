import { useState, useEffect } from "react";
import { Carousel, Button, Spin, Typography, Card, message, Modal, Form, Input, InputNumber } from "antd";
import axios from "axios";
import "../../App.css";

const { Title, Paragraph, Text } = Typography;

export default function EliteShopHero() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();
  const [quantity, setQuantity] = useState(1);

  const mockProducts = [
    { id: 1, name: "Premium Electronics", description: "High-quality gadgets at competitive prices", price: 299.99, shop: "Tech Haven" },
    { id: 2, name: "Organic Groceries", description: "Fresh farm produce delivered to your doorstep", price: 59.99, shop: "Green Market" },
    { id: 3, name: "Designer Apparel", description: "Latest fashion trends for all seasons", price: 129.99, shop: "Urban Styles" },
    { id: 4, name: "Home Essentials", description: "Everything you need for your living space", price: 89.99, shop: "Domestic Bliss" },
    { id: 5, name: "Sports Equipment", description: "Professional gear for fitness enthusiasts", price: 199.99, shop: "Active Life" }
  ];

  const fetchLatestProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/public/products/latest');
      setProducts(response.data);
    } catch (err) {
      console.error("API connection failed:", err);
      setError("API connection failed - using sample data");
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  const handleContactClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    form.setFieldsValue({ quantity: 1, name: '', email: '', phone: '', message: '' });
    setOrderModalVisible(true);
  };

  const handleOrderSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("authToken");
      if (!token) {
        message.error("Please login to place an order");
        return;
      }

      const orderData = {
        product_id: selectedProduct.id,
        quantity: values.quantity,
        contact_info: {
          name: values.name,
          email: values.email,
          phone: values.phone
        },
        message: values.message || ''
      };

      await axios.post('/api/customer/orders', orderData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      message.success('Order submitted successfully!');
      setOrderModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error('Order submit error:', err);
      if (err.response?.status === 401) {
        message.error('Please login to place an order');
      } else if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach(errArr => message.error(errArr.join(', ')));
      } else {
        message.error(err.response?.data?.message || 'Failed to submit order');
      }
    }
  };

  if (loading) {
    return (
      <div className="hero-loading" style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
        <Text style={{ marginLeft: "16px" }}>Loading featured products...</Text>
      </div>
    );
  }

  const calculateTotal = () => ((selectedProduct?.price || 0) * quantity).toFixed(2);

  return (
    <div className="elite-hero" style={{ marginBottom: "40px" }}>
      {error && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", padding: "12px", marginBottom: "16px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "#856404" }}>{error} - Showing sample products</Text>
          <Button size="small" onClick={fetchLatestProducts}>Retry</Button>
        </div>
      )}

      <Carousel autoplay autoplaySpeed={5000} dots={{ className: "hero-dots" }} effect="fade" style={{ borderRadius: "8px", overflow: "hidden" }}>
        {products.map((product) => (
          <div className="hero-slide" key={product.id || product.name}>
            <Card
              className="hero-card"
              bordered={false}
              cover={
                <div className="hero-image-placeholder" style={{
                  height: "400px",
                  background: "linear-gradient(135deg, #f56c27 0%, #f5a327 100%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>
                  {product.name}
                </div>
              }
            >
              <div className="hero-overlay-content" style={{ padding: "20px" }}>
                <Title level={3} style={{ color: "var(--text-primary)", marginBottom: "8px" }}>{product.name}</Title>
                <Paragraph style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>{product.description || "No description available"}</Paragraph>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <Text strong style={{ fontSize: "20px", color: "var(--primary-btn)" }}>
                    ${product.price?.toFixed(2) || "N/A"}
                  </Text>
                  <Text style={{ color: "var(--text-secondary)" }}>From: {product.shop || "Various Shops"}</Text>
                </div>
                <Button type="primary" size="large" style={{ background: "var(--primary-btn)", borderColor: "var(--primary-btn)", width: "100%", fontWeight: 500 }} onClick={() => handleContactClick(product)}>Order Now</Button>
              </div>
            </Card>
          </div>
        ))}
      </Carousel>

      <Modal
        title={`Order: ${selectedProduct?.name}`}
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        onOk={handleOrderSubmit}
        okText="Place Order"
        cancelText="Cancel"
        centered
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Your Name" name="name" rules={[{ required: true, message: "Please enter your name" }, { min: 2, message: "Name must be at least 2 characters" }]}>
            <Input placeholder="Enter your full name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email" }, { type: "email", message: "Please enter a valid email" }]}>
            <Input placeholder="Enter your email address" />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: "Please enter your phone number" }, { pattern: /^[0-9+\- ]+$/, message: "Please enter a valid phone number" }]}>
            <Input placeholder="Enter your phone number with country code" />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please enter quantity" }, { type: "number", min: 1, message: "Quantity must be at least 1" }]}>
            <InputNumber min={1} style={{ width: "100%" }} onChange={(val) => setQuantity(val)} />
          </Form.Item>
          <Form.Item label="Additional Message (Optional)" name="message" rules={[{ max: 500, message: "Message cannot exceed 500 characters" }]}>
            <Input.TextArea rows={4} placeholder="Any special instructions for your order?" showCount maxLength={500} />
          </Form.Item>

          {selectedProduct && (
            <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "4px", marginBottom: "16px" }}>
              <Text strong>Order Summary:</Text>
              <div style={{ marginTop: "8px" }}>
                <Text>Product: {selectedProduct.name}</Text><br />
                <Text>Price: ${selectedProduct.price?.toFixed(2) || 'N/A'}</Text><br />
                <Text>Total: ${calculateTotal()}</Text>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}
