import { useState } from "react";
import { Button, Table, Image, Modal, Form, Select, Input, message, Spin } from "antd";
import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import useSwr, { mutate } from "swr";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const App = () => {
  const [regform] = Form.useForm();
  const [modal, setModal] = useState(false);
  const [imgURL, setImgURL] = useState(null);
  const [id, setId] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const dummyProfile = "https://www.clipartmax.com/png/full/144-1442578_flat-person-icon-download-dummy-man.png";
  const columns = [
    {
      title: 'Profile',
      key: 'profile',
      dataIndex: 'profile',
      render : (_,obj) => (
        <Image src={obj.profile ? obj.profile : dummyProfile } alt="Profile" width={50} height={50} className="rounded-full" />
      )
    },
    {
      title: 'Name',
      key: 'fullname',
      dataIndex: 'fullname',
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: 'Mobile',
      key: 'mobile',
      dataIndex: 'mobile',
    },
    {
      title: 'DOB',
      key: 'dob',
      dataIndex: 'dob',
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: 'gender',
    },
    {
      title: 'Address',
      key: 'address',
      dataIndex: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'action',
      render: (_,obj) => (
        <div>
          <Button
            className="!text-green-500"
            icon={<EditFilled />}
            shape='circle'
            type="text"
            onClick={()=>(onEdit(obj))}
          />
          <Button
            className="!text-rose-500"
            icon={<DeleteFilled />}
            shape='circle'
            type="text"
            onClick={()=>(onDelete(obj._id))}
          />
        </div>
      )
    },


  ]

  const fetcher = async (url) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error; // ✅ REQUIRED for SWR
    }
  };

  
  const { data, error, isLoading } = useSwr('/api', fetcher);

  /*
  const { data, error, isLoading } = useSwr('/api', fetcher, {
    shouldRetryOnError: false
  });

  const { data, error, isLoading } = useSwr('/api', fetcher, {
    errorRetryCount: 1,        // retry only once
    errorRetryInterval: 5000   // after 5 seconds
  });

  const { data, error, isLoading } = useSwr('/api', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  */

  // console.log("API response:", data);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spin size="large" />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg font-semibold">
        🚫 Server is down. Please try again later.
      </div>
    );
  }

  const dataSource = Array.isArray(data)
  ? data.map(item => ({ ...item, key: item._id }))
  : [];

  // console.log(dataSource);

  //handleImage
  const handleImage = (e) => {
    const file = e.target.files[0];
    const fReader = new FileReader();
    if (file.size <= 100000) {
      setDisabled(false);
      regform.setFields([{ name: 'profile', errors: [] }]);
      fReader.readAsDataURL(file);
      fReader.onload = (ev) => {
        const url = ev.target.result;
        setImgURL(url);
      }
    }
    else {
      setDisabled(true);
      regform.setFields([{ name: 'profile', errors: ['File size must be less than 100KB'] }]);

    }
  }

  const onDelete = async (id) => {
    try {
      await axios.delete(`/api/${id}`);
      message.success('Record Deleted Successfully');
      mutate('/api');
    } catch(error) {
      console.log(error);
      message.error('Unable to delete data!');
    }
  }

  const onEdit = (obj) => {
    delete obj.profile;
    setModal(true);
    regform.setFieldsValue(obj);
    setId(obj._id);
  }

  const onFinish = async (values) => {
    imgURL ? values.profile = imgURL : values.profile = dummyProfile;
    try {
      await axios.post('/api', values);
      setModal(false);
      regform.resetFields();
      setImgURL(null);
      mutate('/api');
      message.success('Registration Successful');
    }
    catch(error) {
      if(error.response.data.error.code === 11000) {
        message.error('Email already exists!');
        return regform.setFields([{ name: 'email', errors: ['Email already exists'] }]);
      }
      message.error('Unable to insert data!');
  }
  }

  const onUpdate = async (values) => {
    imgURL ? values.profile = imgURL : delete values.profile;
    try {
      await axios.put(`/api/${id}`, values);
      setModal(false);
      regform.resetFields();
      setImgURL(null);
      setId(null);
      mutate('/api');
      message.success('Successfully Updated');
    }
    catch(error) {
      if (error?.response?.data?.error?.code === 11000) {
        message.error('Email already exists!');
        return regform.setFields([{ name: 'email', errors: ['Email already exists'] }]);
      }
      message.error('Unable to update data!');
  }
  }

const onClose = () => {
    setModal(false);
    setId(null);
    regform.resetFields();
    setImgURL(null);
}

  return (
    <div className='min-h-screen bg-rose-100 flex flex-col items-center md:p-4'>
      <div className='flex justify-between items-center bg-blue-600 w-10/12 my-5 p-4'>
        <h1 className='capitalize font-bold text-white text-2xl md:text-5xl '>MERN CRUD Operation</h1>
        <Button
          shape="circle"
          size="large"
          className="!bg-green-400 !text-white"
          type="text"
          icon={<PlusOutlined />}
          onClick={() => setModal(true)}
        />
      </div>

      <Table
        className="w-10/12"
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 5, placement: ['bottomCenter'] }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        open={modal}
        onCancel={onClose}
        footer={null}
        title={
          <h1 className="text-center font-bold text-2xl">
            {id ? 'Update Form' : 'Registration Form'}
          </h1>
        }
        width={720}
      >
        <Form layout="vertical"
          onFinish={id ? onUpdate : onFinish}
          form={regform}
          className="font-semibold"
        >
          <div className="mt-5 grid md:grid-cols-2 gap-x-2">
            <Form.Item
              label="Profile"
              name="profile"
            >
              <Input size="large"
                onChange={(e) => handleImage(e)}
                type="file"
                className="!p-0 file:bg-gray-200 file:border-0 file:cursor-pointer file:px-4 file:h-[39.6px] file:mr-4 hover:file:bg-gray-300"
                style={{ borderRadius: 0 }}
              />
            </Form.Item>
            <Form.Item
              label="FullName"
              name="fullname"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input size="large" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input size="large" type="email" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[{ required: true, message: 'Please input your mobile number!' }]}
            >
              <Input size="large" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="DOB"
              name="dob"
              rules={[{ required: true, message: 'Please input your date of birth!' }]}
            >
              <Input size="large" type="date" style={{ borderRadius: 0 }} />
            </Form.Item>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: 'Please select your gender!' }]}
            >
              <Select
                size="large"
                placeholder="Select Gender"
                style={{ borderRadius: 0 }}
                classNames={{ popup: '!rounded-none' }}
              >
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Please input your address!' }]}
          >
            <Input.TextArea size="large" rows={2} style={{ borderRadius: 0 }} >
            </Input.TextArea>
          </Form.Item>
          <Form.Item>
            {
              id ?
              <Button
                disabled={disabled}
                htmlType="submit"
                className="w-full font-semibold !bg-rose-600 !text-white"
                size="large"
                style={{ borderRadius: 0 }}
                icon={<PlusOutlined />}
              >
                Update Now
              </Button>
              :
              <Button
              disabled={disabled}
              htmlType="submit"
              className="w-full font-semibold !bg-blue-600 !text-white"
              size="large"
              style={{ borderRadius: 0 }}
              icon={<PlusOutlined />}
            >
              Register Now
              </Button>
            }
          </Form.Item>
        </Form>
      </Modal>

    </div>
  )
}

export default App