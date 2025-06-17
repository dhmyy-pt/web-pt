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
// 定义分类映射
const categoryMap: Record<number, string> = {
  1: '影视',
  2: '音乐',
  3: '图书',
  4: '图片',
  5: '其他',
};
const SeedList: React.FC = () => {
  const [data, setData] = useState<SeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [category, setCategory] = useState<string | undefined>(undefined);

  const fetchData = async (category?: string) => {
    setLoading(true);
    try {
      const res = await request('/api/torrent/list', {
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
      dataIndex: 'categoryId',
      render: (val: number) => categoryMap[val] || '未知',
    },
    {
      title: '作者',
      dataIndex: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
    },
    {
      title: '做种数',
      dataIndex: 'seederCount',
    },
    {
      title: '操作',
      render: (_: any, record: SeedItem) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(`/api/torrent/download/${record.id}`)}
        >
          下载
        </Button>
      ),
    },
  ];

  // 制作种子相关逻辑
  const [makeModalVisible, setMakeModalVisible] = useState(false);
  const [makeForm] = Form.useForm();
  const handleMakeTorrent = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('author', values.author);
      formData.append('file', values.sourceFile.file);

      const res = await request('/api/seeds/make', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });

      if (res && res.torrentUrl) {
        message.success('种子制作成功，开始下载');
        window.open(res.torrentUrl, '_blank'); // 自动打开下载
        setMakeModalVisible(false);
        makeForm.resetFields();
        fetchData(category);
      } else {
        throw new Error('接口未返回种子链接');
      }
    } catch (err) {
      message.error('种子制作失败');
    }
  };

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
            { label: '其他', value: '其他' },
          ]}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setUploadModalVisible(true)}
        >
          上传种子
        </Button>
        <Button
          icon={<UploadOutlined />}
          onClick={() => setMakeModalVisible(true)}
        >
          制作种子
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


      <Modal
        title="制作种子文件"
        open={makeModalVisible}
        onCancel={() => setMakeModalVisible(false)}
        onOk={() => makeForm.submit()}
      >
        <Form form={makeForm} onFinish={handleMakeTorrent} layout="vertical">
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
                { label: '其他', value: '其他' },
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
            label="选择源文件"
            name="sourceFile"
            valuePropName="file"
            getValueFromEvent={(e) =>
              Array.isArray(e) ? e : e && e.fileList[0]
            }
            rules={[{ required: true, message: '请上传源文件' }]}
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
