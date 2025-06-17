import React, { useEffect, useState } from 'react';
import { Card, List, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [detailModal, setDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await request('/api/community/posts', {
        method: 'GET',
      });
      setPosts(res.data || []);
    } catch (error) {
      message.error('获取帖子失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePublish = async (values: any) => {
    try {
      await request('/api/community/posts', {
        method: 'POST',
        data: values,
      });
      message.success('发布成功');
      form.resetFields();
      setShowModal(false);
      fetchPosts();
    } catch (error) {
      message.error('发布失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>社区动态</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>
          发布帖子
        </Button>
      </div>

      <List
        loading={loading}
        grid={{ gutter: 16, column: 1 }}
        dataSource={posts}
        renderItem={(item) => (
          <List.Item>
            <Card
              title={item.title}
              extra={<span>{item.author} · {new Date(item.createdAt).toLocaleString()}</span>}
              hoverable
              onClick={() => {
                setSelectedPost(item);
                setDetailModal(true);
              }}
            >
              {item.content.length > 100 ? item.content.slice(0, 100) + '...' : item.content}
            </Card>
          </List.Item>
        )}
      />

      {/* 发布帖子 Modal */}
      <Modal
        title="发布新帖"
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handlePublish} layout="vertical">
          <Form.Item label="标题" name="title" rules={[{ required: true }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item label="内容" name="content" rules={[{ required: true }]}>
            <Input.TextArea rows={5} placeholder="请输入内容" />
          </Form.Item>
          <Form.Item label="作者" name="author" rules={[{ required: true }]}>
            <Input placeholder="请输入作者名" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 帖子详情 Modal */}
      <Modal
        title={selectedPost?.title}
        open={detailModal}
        footer={null}
        onCancel={() => setDetailModal(false)}
      >
        <p><strong>作者：</strong>{selectedPost?.author}</p>
        <p><strong>时间：</strong>{selectedPost ? new Date(selectedPost.createdAt).toLocaleString() : ''}</p>
        <hr />
        <p style={{ whiteSpace: 'pre-wrap' }}>{selectedPost?.content}</p>
      </Modal>
    </div>
  );
};

export default CommunityPage;