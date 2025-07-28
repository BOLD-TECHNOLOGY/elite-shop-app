import { useState, useEffect, useContext } from 'react';
import { Table, Button, Input, Modal, Form, Select, message, Space, Popconfirm, InputNumber } from 'antd';
import { AppContext } from '../../../../Context/AppContext';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import VendorLayout from '../../layout/_role-based/VendorLayout';
import axios from 'axios';
import '../../../../App.css';

export default function ViewShops() {
    const { token } = useContext(AppContext);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [search, setSearch] = useState('');

    const [isProductModalVisible, setIsProductModalVisible] = useState(false);
    const [isProductEditMode, setIsProductEditMode] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentShopId, setCurrentShopId] = useState(null);
    const [productForm] = Form.useForm();
    const [products, setProducts] = useState({});
    const [loadingProducts, setLoadingProducts] = useState({});

    useEffect(() => {
        fetchShops();
    }, [pagination.current, search]);

    const fetchShops = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/vendor/shops?page=${pagination.current}&search=${search}`, {
                headers: { Authorization: `Bearer ${token}` } 
            });
            setShops(res.data.shops || []);
            setPagination({
                ...pagination,
                total: res.data.total || 0,
                current: res.data.current_page || 1,
                pageSize: res.data.per_page || 10
            });
        } catch (err) {
            console.error('Fetch shops error:', err);
            message.error('Failed to fetch shops');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (shopId) => {
        if (!token || products[shopId]) return;
        
        setLoadingProducts(prev => ({ ...prev, [shopId]: true }));
        try {
            const res = await axios.get(`/api/vendor/shops/${shopId}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(prev => ({
                ...prev,
                [shopId]: res.data.products || []
            }));
        } catch (err) {
            console.error('Fetch products error:', err);
            message.error('Failed to fetch products');
        } finally {
            setLoadingProducts(prev => ({ ...prev, [shopId]: false }));
        }
    };

    const handleAddShop = async () => {
        try {
            const values = await form.validateFields();

            const shopData = {
                name: values.name.trim(),
                category: values.category,
                description: values.description?.trim() || ''
            };

            const response = await axios.post('/api/vendor/shops', shopData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Shop added successfully');
            setIsModalVisible(false);
            form.resetFields();
            fetchShops();
        } catch (err) {
            console.error('Add shop error:', err);
            handleApiError(err, 'Failed to add shop');
        }
    };

    const handleEditShop = async () => {
        try {
            const values = await form.validateFields();

            const shopData = {
                name: values.name.trim(),
                category: values.category,
                description: values.description?.trim() || '',
                _method: 'PUT'
            };

            await axios.post(`/api/vendor/shops/${editingShop.id}`, shopData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Shop updated successfully');
            setIsModalVisible(false);
            setIsEditMode(false);
            setEditingShop(null);
            form.resetFields();
            fetchShops();
        } catch (err) {
            console.error('Edit shop error:', err);
            handleApiError(err, 'Failed to update shop');
        }
    };

    const handleDeleteShop = async (shopId, shopName) => {
        try {
            await axios.delete(`/api/vendor/shops/${shopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            message.success(`Shop "${shopName}" deleted successfully`);
            fetchShops();
        } catch (err) {
            console.error('Delete shop error:', err);
            handleApiError(err, 'Failed to delete shop');
        }
    };

    const handleAddProduct = async () => {
        try {
            const values = await productForm.validateFields();

            const productData = {
                shop_id: currentShopId,
                name: values.name.trim(),
                category: values.category,
                price: parseFloat(values.price),
                stock: parseInt(values.stock),
                description: values.description?.trim() || ''
            };

            const response = await axios.post(`/api/vendor/shops/${currentShopId}/products`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Product added successfully');
            setIsProductModalVisible(false);
            productForm.resetFields();
            setProducts(prev => ({ ...prev, [currentShopId]: null }));
            fetchProducts(currentShopId);
        } catch (err) {
            console.error('Add product error:', err);
            handleApiError(err, 'Failed to add product');
        }
    };

    const handleEditProduct = async () => {
        try {
            const values = await productForm.validateFields();

            const productData = {
                name: values.name.trim(),
                category: values.category,
                price: parseFloat(values.price),
                stock: parseInt(values.stock),
                description: values.description?.trim() || '',
                _method: 'PUT'
            };

            const response = await axios.post(`/api/vendor/products/${editingProduct.id}`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Product updated successfully');
            setIsProductModalVisible(false);
            setIsProductEditMode(false);
            setEditingProduct(null);
            productForm.resetFields();
            setProducts(prev => ({ ...prev, [currentShopId]: null }));
            fetchProducts(currentShopId);
        } catch (err) {
            console.error('Edit product error:', err);
            handleApiError(err, 'Failed to update product');
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        try {
            await axios.delete(`/api/vendor/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            message.success(`Product "${productName}" deleted successfully`);
            setProducts(prev => ({ ...prev, [currentShopId]: null }));
            fetchProducts(currentShopId);
        } catch (err) {
            console.error('Delete product error:', err);
            handleApiError(err, 'Failed to delete product');
        }
    };

    const openEditModal = (shop) => {
        setIsEditMode(true);
        setEditingShop(shop);
        form.setFieldsValue({
            name: shop.name,
            category: shop.category,
            description: shop.description || ''
        });
        setIsModalVisible(true);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setEditingShop(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const openAddProductModal = (shopId) => {
        setCurrentShopId(shopId);
        setIsProductEditMode(false);
        setEditingProduct(null);
        productForm.resetFields();
        setIsProductModalVisible(true);
    };

    const openEditProductModal = (product) => {
        setIsProductEditMode(true);
        setEditingProduct(product);
        setCurrentShopId(product.shop_id);
        productForm.setFieldsValue({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            category: product.category
        });
        setIsProductModalVisible(true);
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

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Actions',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        style={{ color: '#024526ff' }} 
                        onClick={() => openEditModal(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Shop"
                        description={`Are you sure you want to delete "${record.name}"? This will also delete all products in this shop.`}
                        onConfirm={() => handleDeleteShop(record.id, record.name)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="link" 
                            icon={<DeleteOutlined />}
                            danger
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const productColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `$${price}` },
        { title: 'Stock', dataIndex: 'stock', key: 'stock' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        {
            title: 'Actions',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        className="text-primary"
                        onClick={() => openEditProductModal(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Product"
                        description={`Are you sure you want to delete "${record.name}"?`}
                        onConfirm={() => handleDeleteProduct(record.id, record.name)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="link" 
                            icon={<DeleteOutlined />}
                            danger
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <VendorLayout pageTitle="My Shops">
            <div style={{ padding: '20px', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <Input.Search 
                        placeholder="Search shops..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        onSearch={() => fetchShops()} 
                        style={{ width: 300 }} 
                    />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        className="secondary-btn"
                        onClick={openAddModal}
                    >
                        Add New Shop
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={shops}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onChange: (page) => setPagination({ ...pagination, current: page }),
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ margin: 0, padding: '16px', background: '#fafafa' }}>
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, color: '#333' }}>Products in {record.name}</h4>
                                    <Button 
                                        type="primary" 
                                        icon={<PlusOutlined />}
                                        size="small"
                                        style={{ background: '#024526ff', border: 'none' }}
                                        onClick={() => openAddProductModal(record.id)}
                                    >
                                        Add Product
                                    </Button>
                                </div>
                                <Table
                                    columns={productColumns}
                                    dataSource={products[record.id] || []}
                                    loading={loadingProducts[record.id]}
                                    rowKey="id"
                                    size="small"
                                    pagination={false}
                                    locale={{ emptyText: 'No products found' }}
                                />
                            </div>
                        ),
                        onExpand: (expanded, record) => {
                            if (expanded) {
                                fetchProducts(record.id);
                            }
                        },
                    }}
                    style={{ background: '#fff', borderRadius: '8px' }}
                />

                {/* Shop Modal */}
                <Modal
                    title={isEditMode ? "Edit Shop" : "Add New Shop"}
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setIsEditMode(false);
                        setEditingShop(null);
                        form.resetFields();
                    }}
                    onOk={isEditMode ? handleEditShop : handleAddShop}
                    okText={isEditMode ? "Update" : "Save"}
                    cancelText="Cancel"
                    centered
                    width={900}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item 
                            name="name" 
                            label="Shop Name" 
                            rules={[
                                { required: true, message: 'Please enter shop name' },
                                { min: 2, message: 'Shop name must be at least 2 characters' },
                                { max: 255, message: 'Shop name must not exceed 255 characters' }
                            ]}
                        >
                            <Input placeholder="Enter shop name" />
                        </Form.Item>
                        
                        <Form.Item 
                            name="category" 
                            label="Category" 
                            rules={[
                                { required: true, message: 'Please select a category' }
                            ]}
                        >
                            <Select placeholder="Select category">
                                <Select.Option value="fashion">Fashion</Select.Option>
                                <Select.Option value="electronics">Electronics</Select.Option>
                                <Select.Option value="grocery">Grocery</Select.Option>
                                <Select.Option value="books">Books</Select.Option>
                                <Select.Option value="home">Home & Garden</Select.Option>
                                <Select.Option value="sports">Sports & Outdoors</Select.Option>
                            </Select>
                        </Form.Item>
                        
                        <Form.Item 
                            name="description" 
                            label="Description"
                            rules={[
                                { max: 1000, message: 'Description must not exceed 1000 characters' }
                            ]}
                        >
                            <Input.TextArea 
                                rows={3} 
                                placeholder="Enter shop description (optional)"
                                showCount
                                maxLength={1000}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Product Modal */}
                <Modal
                    title={isProductEditMode ? "Edit Product" : "Add New Product"}
                    open={isProductModalVisible}
                    onCancel={() => {
                        setIsProductModalVisible(false);
                        setIsProductEditMode(false);
                        setEditingProduct(null);
                        setCurrentShopId(null);
                        productForm.resetFields();
                    }}
                    onOk={isProductEditMode ? handleEditProduct : handleAddProduct}
                    okText={isProductEditMode ? "Update" : "Save"}
                    cancelText="Cancel"
                    centered
                    width={900}
                >
                    <Form form={productForm} layout="vertical">
                        <Form.Item 
                            name="name" 
                            label="Product Name" 
                            rules={[
                                { required: true, message: 'Please enter product name' },
                                { min: 2, message: 'Product name must be at least 2 characters' },
                                { max: 255, message: 'Product name must not exceed 255 characters' }
                            ]}
                        >
                            <Input placeholder="Enter product name" />
                        </Form.Item>
                        
                        <Form.Item 
                            name="category" 
                            label="Category" 
                            rules={[
                                { required: true, message: 'Please select a category' }
                            ]}
                        >
                            <Select placeholder="Select category">
                                <Select.Option value="clothing">Clothing</Select.Option>
                                <Select.Option value="accessories">Accessories</Select.Option>
                                <Select.Option value="electronics">Electronics</Select.Option>
                                <Select.Option value="food">Food & Beverages</Select.Option>
                                <Select.Option value="books">Books</Select.Option>
                                <Select.Option value="home">Home & Garden</Select.Option>
                                <Select.Option value="sports">Sports & Outdoors</Select.Option>
                                <Select.Option value="health">Health & Beauty</Select.Option>
                                <Select.Option value="toys">Toys & Games</Select.Option>
                                <Select.Option value="automotive">Automotive</Select.Option>
                            </Select>
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item 
                                name="price" 
                                label="Price ($)" 
                                style={{ flex: 1 }}
                                rules={[
                                    { required: true, message: 'Please enter price' },
                                    { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0.00"
                                    min={0.01}
                                    step={0.01}
                                    precision={2}
                                />
                            </Form.Item>
                            
                            <Form.Item 
                                name="stock" 
                                label="Stock Quantity" 
                                style={{ flex: 1 }}
                                rules={[
                                    { required: true, message: 'Please enter stock quantity' },
                                    { type: 'number', min: 0, message: 'Stock must be 0 or greater' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    min={0}
                                    step={1}
                                />
                            </Form.Item>
                        </div>
                        
                        <Form.Item 
                            name="description" 
                            label="Description"
                            rules={[
                                { max: 1000, message: 'Description must not exceed 1000 characters' }
                            ]}
                        >
                            <Input.TextArea 
                                rows={4} 
                                placeholder="Enter product description (optional)"
                                showCount
                                maxLength={1000}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </VendorLayout>
    );
}