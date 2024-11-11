import { h, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';

// 定义样式（可以使用自己的CSS或其他库）
interface FormComponentProps {
  onSubmit: (onSubmit: boolean) => void;
}

interface FormValues {
  comments: string;
}

export const FormComponent: FunctionalComponent<FormComponentProps> = ({ onSubmit }) => {
  const [values, setValues] = useState<FormValues>({ comments: '' });
  const [errors, setErrors] = useState<FormValues>({ comments: '' });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // 简单的验证逻辑
    const newErrors: FormValues = { comments: '' };

    if (!values.comments) {
      newErrors.comments = '留言是必填项';
    }

    if (newErrors.comments) {
      setErrors(newErrors);
    } else {
      // 处理提交
      console.log('提交数据：', values);
    }
  };


  // const handleSubmit = async (e: Event) => {
  //   e.preventDefault();
  //   await validateForm();
  //
  //   if (Object.keys(errors).length > 0) {
  //     return;
  //   }
  //
  //   setIsSubmitting(true);
  //   try {
  //     // await axios.post('http://192.168.10.39:8080/api/orders', formData);
  //     alert('提交成功，请等待商家发货');
  //     // resetForm();
  //   } catch (error) {
  //     console.log(error);
  //     alert('提交失败,请联系商家');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  //   onSubmit(true);
  // };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            name="comments"
            value={values.comments}
            placeholder="请输入留言"
            onInput={handleChange}
            style={styles.textarea}
          />
          {errors.comments && <div style={styles.errorText}>{errors.comments}</div>}
        </div>
        <button type="submit" style={styles.submitButton}>
          提交
        </button>
        <div style={styles.instructions}>
          说明：<br />
          <p>1. 自定义输入您的留言，留言将自动进行拆分，作为烟花短句。</p>
          <p>2. 若要修改留言，请在动态视频界面双击屏幕修改，此留言仅支持修改3次。</p>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',  // 限制最大宽度
    margin: '0 auto',   // 水平居中
    padding: '20px',
    boxSizing: 'border-box',
    display: 'block',   // 默认 block 布局，可以省略
  },

  textarea: {
    padding: '12px',
    width: '100%',   // 宽度为父容器的 100%
    height: '180px', // 增加高度
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  submitButton: {
    padding: '14px 30px',
    backgroundColor: '#FF4500', // 修改为红色（Tomato）
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    width: '100%',
    textAlign: 'center',
    marginTop: '20px', // 增加间距
  },
  errorText: {
    color: 'red',
    fontSize: '12px',
  },
  '@media (max-width: 600px)': {
    container: {
      padding: '10px',
    },
    label: {
      fontSize: '14px',
    },
    input: {
      fontSize: '14px',
    },
    textarea: {
      fontSize: '14px',
      height: '120px', // 手机屏幕上调整文本框的高度
    },
    submitButton: {
      fontSize: '16px',
    },
    instructions: {
      fontSize: '12px',
    },
  },
  instructions: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#555',
  },
};