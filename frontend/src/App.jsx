import { useState } from "react";
import { Button, Table, Image, Modal, Form, Select, Input, message, Spin, Popconfirm } from "antd";
import { DeleteFilled, EditFilled, PlusOutlined, CloseOutlined, CloseCircleOutlined } from "@ant-design/icons";
import api from "./api/axios";
import useSwr, { mutate } from "swr";

const App = () => {
  const [form] = Form.useForm();
  const [modal, setModal] = useState(false);
  const [id, setId] = useState(null);
  const [imgURL, setImgURL] = useState(null);
  const [serverDown, setServerDown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // console.log("Code360 | API: ", import.meta.env.VITE_API_URL);

  const genderAvatarMap = {
    Male: "/male-avatar-gray.jpg",
    Female: "/female-avatar-gray.jpg",
    Other: "/other-avatar-gray.jpg",
  };

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  // const todayString = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

  const fetcher = async (url) => {
    try {
      const res = await api.get(url);

      if (typeof res.data === 'string') {
        // throw new Error('Received HTML instead of JSON');
        setServerDown(true);
      }

      return res.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error; // ✅ Required for SWR
    }
  };


  // const { data, error, isLoading } = useSwr('/api', fetcher);
  const { data, error, isLoading } = useSwr('/api', fetcher, {shouldRetryOnError: false});

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

  if (serverDown || error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg font-semibold">
        🚫 Server is down. Please try again later.
      </div>
    );
  }

  const dataSource = Array.isArray(data) ? data.map(item => ({ ...item, key: item._id })) : [];
  // console.log("Code360 | dataSource: ", dataSource);

  // Table Column
  const columns = [
    {
      title: 'Profile',
      key: 'profile',
      dataIndex: 'profile',
      render: (_, obj) => {
        const hasProfile =
          typeof obj.profile === "string" && obj.profile.trim() !== "";

        const src = hasProfile
          ? obj.profile
          : genderAvatarMap[obj.gender];

        return (
          <Image
            src={src}
            alt="Profile"
            width={50}
            height={50}
            className="rounded-full"
            // preview={false}
          />
        );
      },
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
      // width: 100,
      // fixed: 'right',    // freeze column
      // align: 'center',   // centers title + cell content
      render: (_,obj) => (
        <div>
          <Button
            className="!text-green-500"
            icon={<EditFilled />}
            shape='circle'
            type="text"
            onClick={()=>(onEdit(obj))}
          />
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => onDelete(obj._id)}
              // onCancel={() => message.info('Delete cancelled')}
              okText="Yes"
              cancelText="No"
            >
              <Button
                className="!text-rose-500"
                icon={<DeleteFilled />}
                shape='circle'
                type="text"
              />
            </Popconfirm>
        </div>
      )
    },
  ]
  
  const onSubmit = async (values) => {
    values.profile = imgURL || "";

    try {
      setSubmitting(true); // 🔒 disable button
      await api.post('/', values);

      setModal(false);
      form.resetFields();
      setImgURL(null);
      mutate('/');
      message.success('Registration Successful');
    } catch (error) {
      if (error?.response?.data?.error?.code === 11000) {
        message.error('Email already exists!');
        form.setFields([{ name: 'email', errors: ['Email already exists'] }]);
      } else {
        message.error('Unable to insert data!');
      }
    } finally {
      setSubmitting(false); // 🔓 enable button
    }
  };

  const onUpdate = async (values) => {
    values.profile = imgURL || "";

    try {
      setSubmitting(true);
      await api.put(`/${id}`, values);

      setModal(false);
      form.resetFields();
      setImgURL(null);
      setId(null);
      mutate('/');
      message.success('Successfully Updated');
    } catch (error) {
      if (error?.response?.data?.error?.code === 11000) {
        message.error('Email already exists!');
        form.setFields([{ name: 'email', errors: ['Email already exists'] }]);
      } else {
        message.error('Unable to update data!');
      }
    } finally {
      setSubmitting(false);
    }
  };


  const onEdit = (obj) => {
    setModal(true);
    setId(obj._id);

    form.setFieldsValue({
      fullname: obj.fullname,
      email: obj.email,
      mobile: obj.mobile,
      dob: obj.dob,
      gender: obj.gender,
      address: obj.address,
    });

    setImgURL(obj.profile || null); // ✅ base64 or null
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/${id}`);
      message.success('Record Deleted Successfully');
      mutate('/');
    } catch(error) {
      console.log(error);
      message.error('Unable to delete data!');
    }
  }

  const onClose = () => {
    setModal(false);
    setId(null);
    form.resetFields();
    setImgURL(null);
  }

  // Handle Image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: File size validation
    if (file.size > 100000) {
      message.error("File size must be less than 100KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImgURL(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImgURL(null);
    form.setFieldsValue({ profile: null });
  };

  return (
    <div className="min-h-screen bg-rose-100 flex flex-col items-center px-1 sm:px-2 md:px-4">
      {/* COMMON WIDTH CONTAINER */}
      <div className="w-full px-1 sm:w-full md:w-11/12 lg:w-10/12">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-600 my-3 sm:my-5 p-3 sm:p-4 rounded-sm ">
          <h1 className="capitalize font-bold text-white text-lg sm:text-xl md:text-5xl">
            MERN CRUD Operation
          </h1>

          <Button
            shape="circle"
            size="large"
            className="!bg-green-400 !text-white"
            icon={<PlusOutlined />}
            onClick={() => setModal(true)}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 5, placement: ['bottomCenter'] }}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <Modal
        open={modal}
        onCancel={onClose}
        closeIcon={<CloseCircleOutlined className="text-2xl" />}
        footer={null}
        width="95%"
        style={{ maxWidth: 720 }}
        title={
          <h1 className="text-center font-bold text-xl sm:text-2xl">
            {id ? 'Update Form' : 'Registration Form'}
          </h1>
        }
      >
        <Form layout="vertical"
          onFinish={id ? onUpdate : onSubmit}
          form={form}
          className="font-semibold"
        >

          {imgURL && (
            <div className="flex align-center justify-center gap-4 mb-3 ml-6">
              <Image
                src={imgURL}
                alt="Profile Preview"
                width={90}
                height={90}
                className="rounded-full border"
              />

              <CloseOutlined onClick={removeImage}/>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item
              label="Profile"
              name="profile"
            >
              <Input size="large"
                onChange={handleImageChange}
                type="file"
                className="!p-0 file:bg-gray-200 file:border-0 file:cursor-pointer file:px-4 file:h-[38px] file:mr-4 hover:file:bg-gray-300"
              />
            </Form.Item>

            <Form.Item
              label="Name"
              name="fullname"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input size="large" type="email" />
            </Form.Item>

            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[{ required: true, message: 'Please input your mobile number!' }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="DOB"
              name="dob"
              rules={[
                { required: true, message: "Please input your date of birth!" },
                () => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve(); // allow empty check via required rule

                    // compare as strings (YYYY-MM-DD)
                    if (value > todayString) {
                      return Promise.reject(new Error("Future date is not allowed"));
                    }

                    return Promise.resolve();
                  },
                })
              ]}
            >
              <Input
                size="large"
                type="date"
                max={todayString} // ✅ correct max today
              />
            </Form.Item>


            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: 'Please select your gender!' }]}
            >
              <Select
                size="large"
                placeholder="Select Gender"
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
            <Input.TextArea size="large" rows={2} >
            </Input.TextArea>
          </Form.Item>
          
          <Form.Item>
            {id ? (
              <Button
                htmlType="submit"
                size="large"
                loading={submitting}
                disabled={submitting}
                className="w-full font-semibold !bg-rose-600 !text-white"
                icon={!submitting && <PlusOutlined />}
              >
                {!submitting ? "Update Now" : "Updating..."}
              </Button>
            ) : (
              <Button
                htmlType="submit"
                size="large"
                loading={submitting}
                disabled={submitting}
                className="w-full font-semibold !bg-blue-600 !text-white"
                icon={!submitting && <PlusOutlined />}
              >
                {!submitting ? "Register Now" : "Submitting..."}
              </Button>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default App