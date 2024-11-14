import { h, FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { generateOrder } from './api';

import { Toast } from './toast';

interface FormComponentProps {
  onSubmit: (onSubmit: boolean) => void;
  id: string | null;
}

interface FormValues {
  comments: string;
  sentences: string[];
}

export const FormComponent: FunctionalComponent<FormComponentProps> = ({ onSubmit, id }) => {
  const [values, setValues] = useState<FormValues>({ comments: '', sentences: [] });
  const [errors, setErrors] = useState<FormValues>({ comments: '', sentences: [] });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const sentences = value
      .split(/(?<=[。！？,.，?])/)
      .filter(Boolean)
      .map((sentence: string) => sentence.replace(/[。！？,.，?]/g, '')); // Remove punctuation
    setValues({
      ...values,
      [name]: value,
      sentences,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const newErrors: FormValues = { comments: '', sentences: [] };

    if (!values.comments) {
      setToastMessage('留言是必填项');
      newErrors.comments = '留言是必填项';
    }

    setErrors(newErrors);

    if (newErrors.comments) return;

    if (!id) {
      setToastMessage('无效id');
      return;
    }

    const v = values.sentences.join(',');
    generateOrder(id, v)
      .then(response => {
        if (response.code === 0) {
          onSubmit(true);
        } else if (response.code === 10000) {
          setToastMessage('输入已经超过4次，无法再次编辑');
        } else {
          setToastMessage('提交失败，返回异常');
        }
      })
      .catch(() => {
        setToastMessage('提交失败，网络异常');
      });
  };


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
          <p>1. 此留言仅支持<span style={{ color: 'red' }}>修改4次</span>，若要修改留言，请在特效界面三击屏幕修改。</p>
          <p>2. 自定义输入您的留言，留言将根据标点符号自动进行拆分，作为烟花短句。</p>
        </div>
      </form>
      <div style={styles.sentencesContainer}>
        {values.sentences.map((sentence, index) => (
          <div key={index} style={styles.sentence}>
            {sentence}
          </div>
        ))}
      </div>
      {toastMessage && <Toast message={toastMessage} />}
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
  sentencesContainer: {
    marginTop: '20px',
  },
  sentence: {
    padding: '8px',
    borderBottom: '1px solid #ddd',
  },
  instructions: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#555',
  },
};