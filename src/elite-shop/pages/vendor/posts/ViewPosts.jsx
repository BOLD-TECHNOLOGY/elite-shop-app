import { useState, useEffect, useContext } from 'react';
import { Table, Button, Input, Modal, Form, Select, message, Collapse, Space, Popconfirm, InputNumber } from 'antd';
import { AppContext } from '../../../../Context/AppContext';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import VendorLayout from '../../layout/_role-based/VendorLayout';
import axios from 'axios';
import '../../../../App.css';

export default function ViewPosts() {

    return (
        <VendorLayout pageTitle="My Products">
            
        </VendorLayout>
    );
}