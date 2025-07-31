import { useState, useEffect, useContext } from "react";
import { Table, Button, message, Popconfirm, Tag, Space, Modal } from "antd";
import VendorLayout from '../../layout/_role-based/CustomerLayout';
import { AppContext } from "../../../../Context/AppContext";
import axios from 'axios';

export default function CustomerOrders() {
  const { token, user } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchOrders = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
      };

      const res = await axios.get('/api/customer/orders', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const ordersData = res.data.data || res.data.orders || res.data || [];
      setOrders(ordersData);
      setPagination({
        ...pagination,
        total: res.data.total || res.data.meta?.total || 0,
        current: res.data.current_page || res.data.meta?.current_page || 1,
        pageSize: res.data.per_page || res.data.meta?.per_page || 10
      });
    } catch (err) {
      console.error("Fetch orders error:", err);
      if (err.response?.status === 401) {
        message.error("Please login to view your orders");
      } else {
        message.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await axios.delete(`/api/customer/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success("Order cancelled successfully");
      fetchOrders();
    } catch (err) {
      console.error("Delete order error:", err);
      handleApiError(err, "Failed to cancel order");
    }
  };

  const handleApiError = (err, defaultMessage) => {
    if (err.response && err.response.status === 422 && err.response.data.errors) {
      const errors = err.response.data.errors;
      let errorMessage = 'Validation errors:\n';
      Object.keys(errors).forEach(field => {
        errorMessage += `${field}: ${errors[field].join(', ')}\n`;
      });
      message.error(errorMessage);
    } else if (err.response && err.response.data.message) {
      message.error(err.response.data.message);
    } else {
      message.error(defaultMessage);
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token, pagination.current]);

  const getStatusColor = (status) => ({
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'purple',
    completed: 'green',
    cancelled: 'red',
    suspended: 'gray'
  }[status] || 'default');

  const columns = [
    {
      title: "Product",
      dataIndex: ["product", "name"],
      key: "product_name",
      render: (text, record) => (
        <Button type="link" onClick={() => showOrderDetails(record)}>
          {record.product?.name || "Unknown Product"}
        </Button>
      )
    },
    { 
      title: "Quantity", 
      dataIndex: "quantity", 
      key: "quantity",
      align: 'center'
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>
      )
    },
    {
      title: "Total Price",
      key: "total",
      align: 'center',
      render: (_, record) => `$${((record.product?.price || 0) * record.quantity).toFixed(2)}`
    },
    {
      title: "Order Date",
      key: "created_at",
      align: 'center',
      render: (_, record) => new Date(record.created_at).toLocaleDateString()
    },
    {
      title: "Action",
      key: "action",
      align: 'center',
      render: (_, record) => (
        <Space>
          {record.status !== 'cancelled' && record.status !== 'completed' && (
            <Popconfirm
              title="Are you sure you want to cancel this order?"
              onConfirm={() => handleDeleteOrder(record.id)}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small">Cancel Order</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Please login to view your orders.</p>
      </div>
    );
  }

  return (
    <VendorLayout pageTitle="My Orders">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-description">View and manage your order history</p>
          </div>
        </div>

        <Table
          bordered
          loading={loading}
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => setPagination({ ...pagination, current: page }),
            showSizeChanger: false
          }}
          scroll={{ x: true }}
          style={{ 
            background: '#fff', 
            borderRadius: '8px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
          }}
        />

        <Modal
          title="Order Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={<Button onClick={() => setModalVisible(false)}>Close</Button>}
          width={700}
          centered
        >
          {selectedOrder && (
            <div>
              <h3>Product: {selectedOrder.product?.name || "Unknown Product"}</h3>
              <p>Quantity: {selectedOrder.quantity}</p>
              <p>Status: <Tag color={getStatusColor(selectedOrder.status)}>
                {selectedOrder.status?.toUpperCase()}
              </Tag></p>
              <p>Total Price: ${((selectedOrder.product?.price || 0) * selectedOrder.quantity).toFixed(2)}</p>
              <p>Order Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
              {selectedOrder.shipping_address && (
                <>
                  <h4 style={{ marginTop: '16px' }}>Shipping Address</h4>
                  <p>{selectedOrder.shipping_address}</p>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </VendorLayout>
  );
}