import { h, FunctionalComponent } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { css, StyleSheet } from 'aphrodite';
import { useStore } from './effects/store';
import { SoundHandler } from './soundhandler';
import { getComments } from './api';
import { Toast } from './toast';

interface FormComponentProps {
  id: string | null;
}

export const StartPlay: FunctionalComponent<FormComponentProps> = ({ id }) => {
  const store = useStore();
  const { update, state } = store;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // SoundHandler
  const soundHandler = new SoundHandler();

  if (!id) {
    setToastMessage('无效id');
    return null;
  }
  const handleClick = useCallback(() => {
    getComments(id)
      .then((response: any) => {
        if (response.code === 0) {
          update(state => ({
            isPaused: false,
            comments: response.data,
            showStartPlay: false,
          }));
        } else {
          setToastMessage('获取留言失败');
        }
      }).catch((error: any) => {
      setToastMessage('获取留言失败 ' + error);
    });

    // play Background
    soundHandler.PlayBackground(0.3);
  }, [update]);

  if (!state.showStartPlay) {
    return null; // 如果状态为 false，则不渲染组件
  }

  return (
    <button className={css(styles.button)} onClick={handleClick}>
      <div className={css(styles.triangle)} />
      {toastMessage && <Toast message={toastMessage} />}
    </button>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '20px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '3px',
    transform: 'rotate(90deg)',
  },
});