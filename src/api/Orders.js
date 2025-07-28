// api/Orders.js
import axios from 'axios';

// Create order (handles both authenticated and guest users)
export const createOrder = async (orderData, token = null) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.post('/api/customer/orders', orderData, config);
      return response.data;
    } else {
      const response = await axios.post('/api/public/orders', orderData);
      return response.data;
    }
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

// Get orders for authenticated customers — returns response.data (array or paginated object)
export const getOrders = async (token) => {
  try {
    if (!token) throw new Error('Authentication token required');
    const response = await axios.get('/api/customer/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;  // returns array or paginated object depending on backend
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (orderId, orderData, token) => {
  try {
    if (!token) throw new Error('Authentication token required');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.put(`/api/customer/orders/${orderId}`, orderData, config);
    return response.data;
  } catch (error) {
    console.error('Update order error:', error);
    throw error;
  }
};

// Delete (cancel) order
export const deleteOrder = async (orderId, token) => {
  try {
    if (!token) throw new Error('Authentication token required');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
    const response = await axios.delete(`/api/customer/orders/${orderId}`, config);
    return response.data;
  } catch (error) {
    console.error('Delete order error:', error);
    throw error;
  }
};
