import { h, FunctionalComponent } from 'preact';
import { useCallback } from 'preact/hooks';
import { css, StyleSheet } from 'aphrodite';
import { useStore } from './effects/store';
import { SoundHandler } from './soundhandler';

export const StartPlay: FunctionalComponent = () => {
  const store = useStore();
  const { update, state } = store;
  // SoundHandler
  const soundHandler = new SoundHandler();

  const handleClick = useCallback(() => {
    update(state => ({
      isPaused: false,
      showStartPlay: false, // 新增状态来控制组件显示
    }));
    // PlayBackground
    soundHandler.PlayBackground(0.3);
  }, [update]);

  if (!state.showStartPlay) {
    return null; // 如果状态为 false，则不渲染组件
  }

  return (
    <button className={css(styles.button)} onClick={handleClick}>
      <div className={css(styles.triangle)} />
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