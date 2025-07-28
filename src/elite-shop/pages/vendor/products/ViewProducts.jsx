import { useState, useEffect, useContext } from 'react';
import { Table, Button, Input, Modal, Form, Select, message, Space, Popconfirm, InputNumber, Tag } from 'antd';
import { AppContext } from '../../../../Context/AppContext';
import { EditOutlined, PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import VendorLayout from '../../layout/_role-based/VendorLayout';
import axios from 'axios';
import '../../../../App.css';

export default function ViewProducts() {
    const { token } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [search, setSearch] = useState('');
    const [shops, setShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        shop: null,
        category: null,
        priceRange: null
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [addForm] = Form.useForm();
    const [form] = Form.useForm();

    useEffect(() => {
        fetchProducts();
        fetchShops();
    }, [pagination.current, search, filters]);

    const fetchProducts = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = {
                page: pagination.current,
                search: search,
                shop_id: filters.shop,
                category: filters.category,
            };

            const res = await axios.get('/api/vendor/products', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('API Response:', res.data);
            
            const productsData = res.data.data || res.data.products || res.data || [];
            
            const uniqueCategories = [...new Set(productsData.map(product => product.category))];
            setCategories(uniqueCategories);
            
            setProducts(productsData);
            setPagination({
                ...pagination,
                total: res.data.total || res.data.meta?.total || 0,
                current: res.data.current_page || res.data.meta?.current_page || 1,
                pageSize: res.data.per_page || res.data.meta?.per_page || 10
            });
        } catch (err) {
            console.error('Fetch products error:', err);
            console.error('Error response:', err.response);
            message.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchShops = async () => {
        if (!token) return;
        try {
            const res = await axios.get('/api/vendor/shops', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShops(res.data.shops || []);
        } catch (err) {
            console.error('Fetch shops error:', err);
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        try {
            await axios.delete(`/api/vendor/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            message.success(`Product "${productName}" deleted successfully`);
            fetchProducts();
            
        } catch (err) {
            console.error('Delete product error:', err);
            handleApiError(err, 'Failed to delete product');
        }
    };

    const handleEditProduct = async () => {
        try {
            const values = await form.validateFields();
            
            const payload = {
                name: values.name.trim(),
                description: values.description ? values.description.trim() : null,
                price: parseFloat(values.price),
                stock: parseInt(values.stock),
                category: values.category,
            };
            
            await axios.put(`/api/vendor/products/${editingProduct.id}`, payload, {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            
            message.success('Product updated successfully');
            setIsModalVisible(false);
            setEditingProduct(null);
            form.resetFields();
            fetchProducts();
            
        } catch (err) {
            console.error('Edit product error:', err);
            handleApiError(err, 'Failed to update product');
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        form.setFieldsValue({
            name: product.name,
            description: product.description || '',
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
            stock: product.stock,
            category: product.category
        });
        setIsModalVisible(true);
    };

    const handleAddProduct = async () => {
        try {
            const values = await addForm.validateFields();
            
            const payload = {
                shop_id: values.shop_id,
                name: values.name.trim(),
                description: values.description ? values.description.trim() : null,
                price: parseFloat(values.price),
                stock: parseInt(values.stock),
                category: values.category,
            };
            
            await axios.post('/api/vendor/products', payload, {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            
            message.success('Product added successfully');
            setIsAddModalVisible(false);
            addForm.resetFields();
            fetchProducts();
            
        } catch (err) {
            console.error('Add product error:', err);
            handleApiError(err, 'Failed to add product');
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

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const resetFilters = () => {
        setFilters({
            shop: null,
            category: null,
            priceRange: null
        });
        setSearch('');
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const columns = [
        { 
            title: 'Product Name', 
            dataIndex: 'name', 
            key: 'name',
            align: 'left',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    {record.description && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
                    )}
                </div>
            )
        },
        { 
            title: 'Shop', 
            dataIndex: 'shop', 
            key: 'shop',
            align: 'left',
            render: (shop) => (
                <Tag color="blue">{shop?.name || 'N/A'}</Tag>
            ),
            filters: shops.map(shop => ({
                text: shop.name,
                value: shop.id
            })),
            filteredValue: filters.shop ? [filters.shop] : null,
            onFilter: (value, record) => record.shop.id === value
        },
        { 
            title: 'Category', 
            dataIndex: 'category', 
            key: 'category',
            align: 'left',
            render: (category) => (
                <Tag color="green">{category}</Tag>
            ),
            filters: categories.map(cat => ({
                text: cat,
                value: cat
            })),
            filteredValue: filters.category ? [filters.category] : null,
            onFilter: (value, record) => record.category === value
        },
        { 
            title: 'Price', 
            dataIndex: 'price', 
            key: 'price', 
            align: 'center',
            render: (price) => {
                const priceNum = typeof price === 'string' ? parseFloat(price) : price;
                return `$${priceNum.toFixed(2)}`;
            },
            sorter: (a, b) => {
                const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
                const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
                return priceA - priceB;
            }
        },
        { 
            title: 'Stock', 
            dataIndex: 'stock', 
            key: 'stock',
            align: 'center',
            render: (stock) => (
                <span style={{ color: stock > 0 ? 'inherit' : 'red' }}>
                    {stock > 0 ? stock : 'Out of Stock'}
                </span>
            ),
            sorter: (a, b) => a.stock - b.stock
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        className="text-primary"
                        onClick={() => openEditModal(record)}
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
        <VendorLayout pageTitle="My Products">
            <div className="view-products" style={{ padding: '20px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 className="page-title">My Products</h1>
                        <p className="page-description">Manage all your products across all shops</p>
                    </div>
                    <div className='view-products-actions' style={{ display: 'flex', gap: '10px' }}>
                        <Button 
                            type="primary" 
                            onClick={resetFilters}
                            className="secondary-btn"
                        >
                            Reset Filters
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setIsAddModalVisible(true)}
                            className="ml-2"
                        >
                            Add New Product
                        </Button>
                    </div>
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
                    <Input.Search 
                        placeholder="Search products..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        onSearch={() => fetchProducts()} 
                        style={{ width: 300 }}
                        enterButton={<SearchOutlined />}
                    />
                    
                    <Select
                        placeholder="Filter by Shop"
                        style={{ width: 200 }}
                        value={filters.shop}
                        onChange={(value) => handleFilterChange('shop', value)}
                        allowClear
                        options={shops.map(shop => ({
                            value: shop.id,
                            label: shop.name
                        }))}
                    />
                    
                    <Select
                        placeholder="Filter by Category"
                        style={{ width: 200 }}
                        value={filters.category}
                        onChange={(value) => handleFilterChange('category', value)}
                        allowClear
                        options={categories.map(cat => ({
                            value: cat,
                            label: cat
                        }))}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={products}
                    loading={loading}
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

                {/* Edit Product Modal */}
                <Modal
                    title="Edit Product"
                    open={isModalVisible}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setEditingProduct(null);
                        form.resetFields();
                    }}
                    onOk={() => form.submit()}
                    okText="Update"
                    cancelText="Cancel"
                    centered
                    width={900}
                >
                    <Form 
                        form={form} 
                        layout="vertical"
                        onFinish={handleEditProduct}
                    >
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
                                {categories.map(category => (
                                    <Select.Option key={category} value={category}>
                                        {category}
                                    </Select.Option>
                                ))}
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

                {/* Add Product Modal */}
                <Modal
                    title="Add New Product"
                    open={isAddModalVisible}
                    onCancel={() => {
                        setIsAddModalVisible(false);
                        addForm.resetFields();
                    }}
                    onOk={() => addForm.submit()}
                    okText="Add"
                    cancelText="Cancel"
                    centered
                    width={900}
                >
                    <Form 
                        form={addForm} 
                        layout="vertical"
                        onFinish={handleAddProduct}
                    >
                        <Form.Item 
                            name="shop_id" 
                            label="Shop" 
                            rules={[
                                { required: true, message: 'Please select a shop' }
                            ]}
                        >
                            <Select placeholder="Select shop">
                                {shops.map(shop => (
                                    <Select.Option key={shop.id} value={shop.id}>
                                        {shop.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        
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
                                {categories.map(category => (
                                    <Select.Option key={category} value={category}>
                                        {category}
                                    </Select.Option>
                                ))}
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