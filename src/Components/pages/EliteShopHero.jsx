import { createOrder } from '../../api/Orders';
import { useEffect, useState } from "react";
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
      const possibleUrls = [
        "http://localhost:8000/api/public/products/latest",
        "http://127.0.0.1:8000/api/public/products/latest",
        "/api/public/products/latest"
      ];
      let response = null;
      let lastError = null;
      for (const url of possibleUrls) {
        try {
          console.log(`Trying URL: ${url}`);
          response = await axios.get(url);
          break;
        } catch (err) {
          console.log(`Failed URL ${url}:`, err.message);
          lastError = err;
          continue;
        }
      }
      if (response) {
        setProducts(response.data);
        setError(null);
        console.log("Successfully loaded products:", response.data);
      } else {
        throw lastError;
      }
    } catch (err) {
      console.error("All API attempts failed:", err);
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
    form.setFieldsValue({ quantity: 1 });
    setOrderModalVisible(true);
  };

  const handleOrderSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("authToken");
      await createOrder({ ...values, product_id: selectedProduct.id }, token);
      message.success('Order submitted successfully!');
      setOrderModalVisible(false);
    } catch (err) {
      console.error('Order submit error:', err);
      message.error('Failed to submit order');
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

  return (
    <div className="elite-hero" style={{ marginBottom: "40px" }}>
      {error && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", padding: "12px", marginBottom: "16px", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "#856404" }}>{error} - Showing sample products</Text>
          <Button size="small" onClick={fetchLatestProducts}>Retry</Button>
        </div>
      )}
      
      <Carousel autoplay autoplaySpeed={5000} dots={{ className: "hero-dots" }} effect="fade">
        {products.map((product) => (
          <div className="hero-slide" key={product.id || product.name}>
            <Card
              className="hero-card"
              cover={
                <div 
                  className="hero-image-placeholder" 
                  style={{
                    height: "400px",
                    background: "linear-gradient(135deg, #f56c27 0%, #f5a327 100%)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "bold"
                  }}
                >
                  {product.name}
                </div>
              }
            >
              <div className="hero-overlay-content" style={{ padding: "20px" }}>
                <Title level={3} style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
                  {product.name}
                </Title>
                <Paragraph style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
                  {product.description || "No description available"}
                </Paragraph>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <Text strong style={{ fontSize: "20px", color: "var(--primary-btn)" }}>
                    ${typeof product.price === 'string' ? product.price : (product.price?.toFixed(2) || "N/A")}
                  </Text>
                  <Text style={{ color: "var(--text-secondary)" }}>
                    From: {product.shop || "Various Shops"}
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  style={{ background: "var(--primary-btn)", borderColor: "var(--primary-btn)", width: "100%" }}
                  onClick={() => handleContactClick(product)}
                >
                  Contact Supplier
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </Carousel>

      {/* Order Modal */}
      <Modal
        title={`Order: ${selectedProduct?.name}`}
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        onOk={handleOrderSubmit}
        okText="Send Order"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Your Name" name="name" rules={[{ required: true, message: "Please enter your name" }]}>
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Please enter your phone number" }]}>
            <Input placeholder="Enter your phone number" />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true, type: "number", min: 1 }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Message" name="message">
            <Input.TextArea rows={3} placeholder="Add a message for the supplier" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
