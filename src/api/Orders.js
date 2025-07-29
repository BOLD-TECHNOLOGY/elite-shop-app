import axios from 'axios';

export const createOrder = async (orderData, token) => {
  if (!token) {
    throw new Error("Authentication token required");
  }
  
  try {
    const response = await axios.post('/customer/orders', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrders = async (token) => {
  try {
    if (!token) throw new Error('Authentication token required');
    const response = await axios.get('/api/customer/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};

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
