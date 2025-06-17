import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Upload,
  Modal,
  Form,
  Input,
  message,
  Select,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { request } from '@umijs/max';

interface SeedItem {
  id: number;
  name: string;
  category: string;
  author: string;
  publishTime: string;
  seedingStatus: string;
  fileUrl: string;
  [key: string]: any;
}

const SeedList: React.FC = () => {
  const [data, setData] = useState<SeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [category, setCategory] = useState<string | undefined>(undefined);

  const fetchData = async (category?: string) => {
    setLoading(true);
    try {
      const res = await request('/api/seeds/list', {
        method: 'GET',
        params: category ? { category } : {},
      });
      setData(res.data || []);
    } catch (err) {
      message.error('获取种子列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleUpload = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('author', values.author);
      formData.append('file', values.file.file);

      await request('/api/seeds/upload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });

      message.success('上传成功');
      setUploadModalVisible(false);
      form.resetFields();
      fetchData(category);
    } catch (err) {
      message.error('上传失败');
    }
  };

  const handleCategoryChange = (value: string | undefined) => {
    setCategory(value);
    fetchData(value);
  };

  const columns = [
    {
      title: '种子名称',
      dataIndex: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
    },
    {
      title: '做种状态',
      dataIndex: 'seedingStatus',
      render: (val: string) => (val === 'active' ? '活跃' : '暂停'),
    },
    {
      title: '操作',
      render: (_: any, record: SeedItem) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record.fileUrl)}
        >
          下载
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Select
          placeholder="选择分类"
          allowClear
          style={{ width: 200 }}
          value={category}
          onChange={handleCategoryChange}
          options={[
            { label: '影视', value: '影视' },
            { label: '音乐', value: '音乐' },
            { label: '图书', value: '图书' },
            { label: '图片', value: '图片' },
          ]}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setUploadModalVisible(true)}
        >
          上传种子
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
      />

      <Modal
        title="上传种子文件"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleUpload} layout="vertical">
          <Form.Item
            label="种子名称"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入种子名称" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="选择分类"
              options={[
                { label: '影视', value: '影视' },
                { label: '音乐', value: '音乐' },
                { label: '图书', value: '图书' },
                { label: '图片', value: '图片' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="作者"
            name="author"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者名称" />
          </Form.Item>

          <Form.Item
            label="选择文件"
            name="file"
            valuePropName="file"
            getValueFromEvent={(e) =>
              Array.isArray(e) ? e : e && e.fileList[0]
            }
            rules={[{ required: true, message: '请上传文件' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SeedList;
