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

//上传种子
import { useModel } from '@umijs/max';

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
  0: '影视',
  1: '音乐',
  2: '图书',
  3: '图片',
  4: '其他',
};
const SeedList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;
  const [data, setData] = useState<SeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [category, setCategory] = useState<string | undefined>("-1"); // 默认值为 -1，表示全部
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(undefined);

  const fetchData = async (category?: string, keyword?: string) => {
    setLoading(true);
    try {
      const res = await request('/api/torrent/list', {
        method: 'GET',
        params: {
          ...(category ? { category } : {}),
          ...(keyword ? { name: keyword } : {}),
        }

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

//上传种子相关逻辑
  const handleUpload = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('author', user?.userName || '');
      formData.append('creatorId', user?.userId?.toString() || '');
      formData.append('category', values.category);
      formData.append('file', values.file);

      await request('/api/torrent/upload', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });
      window.location.href = '/api/torrent/upload'; // 自动下载最新上传的种子
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

  const handleDownload = (id: number) => {
    window.location.href = `/api/torrent/download/${id}`;
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
      title: '做种数',
      dataIndex: 'seederCount',
    },
    {
      title: '操作',
      render: (_: any, record: SeedItem) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record.id)}
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
      formData.append('category', values.category);
      formData.append('author', user?.userName || '');
      formData.append('creatorId', user?.userId?.toString() || '');

      formData.append('sourcePath', values.sourcePath);

      const res = await request('/api/torrent/make', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });
      message.success('种子制作成功，保存路径为原路径下的.torrent文件');
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
          onChange={(value) => {
             console.log("选择分类:", value); // 
            setCategory(value);
            fetchData(value, searchKeyword);
            console.log("searchKeyword:", searchKeyword);
          }}
          options={[
            { label: '全部', value: '-1' },
            { label: '影视', value: '0' },
            { label: '音乐', value: '1' },
            { label: '图书', value: '2' },
            { label: '图片', value: '3' },
            { label: '其他', value: '4' },
          ]}
        />
        <Input.Search
          placeholder="搜索种子名称"
          style={{ width: 240 }}
          allowClear
          onSearch={(value) => {
            setSearchKeyword(value);
            fetchData(category, value);
          }}
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
      {/* 上传种子文件 */}
      <Modal
        title="上传种子文件"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleUpload} layout="vertical">

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="选择分类"
              options={[
                { label: '影视', value: '0' },
                { label: '音乐', value: '1' },
                { label: '图书', value: '2' },
                { label: '图片', value: '3' },
                { label: '其他', value: '4' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="选择文件"
            name="file"
            valuePropName="file"
            getValueFromEvent={(e) =>
              Array.isArray(e) ? e : e && e.fileList[0]?.originFileObj
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
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="选择分类"
              options={[
                { label: '影视', value: '0' },
                { label: '音乐', value: '1' },
                { label: '图书', value: '2' },
                { label: '图片', value: '3' },
                { label: '其他', value: '4' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="源文件路径"
            name="sourcePath"
            rules={[{ required: true }]}
          >
            <Input placeholder="请输入源文件路径" />
          </Form.Item>
        </Form>
      </Modal>

    </>
  );
};

export default SeedList;
