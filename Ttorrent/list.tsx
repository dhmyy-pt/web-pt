import React, { useEffect, useState } from 'react';
import { Button, Table, Upload, Modal, Form, Input, message } from 'antd';
import { UploadOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { request } from '@umijs/max';

interface SeedItem {
  id: number;
  name: string;
  fileUrl: string;
  [key: string]: any;
}

const SeedList: React.FC = () => {
  const [data, setData] = useState<SeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await request('/api/seeds/list', {
        method: 'GET',
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
      formData.append('file', values.file.file);

      await request('/api/seeds/upload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });

      message.success('上传成功');
      setUploadModalVisible(false);
      fetchData();
    } catch (err) {
      message.error('上传失败');
    }
  };

  const columns = [
    {
      title: '种子名称',
      dataIndex: 'name',
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
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalVisible(true)}>
          上传种子
        </Button>
      </div>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} />

      <Modal
        title="上传种子文件"
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleUpload} layout="vertical">
          <Form.Item label="种子名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入种子名称" />
          </Form.Item>
          <Form.Item
            label="选择文件"
            name="file"
            valuePropName="file"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList[0])}
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
