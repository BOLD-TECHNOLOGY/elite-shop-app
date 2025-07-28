import { useEffect, useState, useContext } from "react";
import { Table, Button, message, Popconfirm, Tag, Space, Modal } from "antd";
import { getOrders, deleteOrder } from "../../../../api/Orders";
import { AppContext } from "../../../../Context/AppContext";

export default function CustomerOrders() {
  const { token, user } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(token);
      // Since getOrders returns data directly, no .data nesting here:
      setOrders(res || []);
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

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id, token);
      message.success("Order cancelled successfully");
      fetchOrders();
    } catch (err) {
      console.error("Delete order error:", err);
      message.error("Failed to cancel order");
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

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
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>
      )
    },
    {
      title: "Total Price",
      key: "total",
      render: (_, record) => `$${(record.product?.price || 0) * record.quantity}`
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status !== 'cancelled' && record.status !== 'completed' && (
            <Popconfirm
              title="Are you sure you want to cancel this order?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Cancel"
              cancelText="No"
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
    <div>
      <h2 style={{ marginBottom: 20, padding: 20 }}>My Orders</h2>
      <Table
        bordered
        loading={loading}
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Order Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={<Button onClick={() => setModalVisible(false)}>Close</Button>}
        width={700}
      >
        {selectedOrder && (
          <div>
            <h3>Product: {selectedOrder.product?.name || "Unknown Product"}</h3>
            <p>Quantity: {selectedOrder.quantity}</p>
            <p>Status: <Tag color={getStatusColor(selectedOrder.status)}>
              {selectedOrder.status?.toUpperCase()}
            </Tag></p>
            <p>Total Price: ${(selectedOrder.product?.price || 0) * selectedOrder.quantity}</p>
            <p>Order Date: {new Date(selectedOrder.created_at).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
