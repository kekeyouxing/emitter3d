import { h, FunctionalComponent } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { StyleSheet, css } from 'aphrodite';
import { Mount } from './components';
import { useStats } from './effects/stats';
import { useStore } from './effects/store';
import { Screen } from './screen';
import { useSystem } from './system';
import { StartPlay } from './startplay';
import { FormComponent } from './form';
import { fetchData } from './api';

export const Main: FunctionalComponent<{}> = props => {
  const stats = useStats();
  const store = useStore();
  const update = store.update;
  const { showStats } = store.state;

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isValidQR, setIsValidQR] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      fetchData(id)
        .then((data: any) => {
          if (data.code === 0) {
            // 有效验证码
            setIsValidQR(true);
          } else {
            // 无效验证码
            setIsValidQR(false);
          }
        })
        .catch((error: any) => setIsValidQR(false))
        .finally(() => setIsLoading(false));
    } else {
      // 无效验证码
      setIsValidQR(false);
      setIsLoading(false);
    }

  }, []);

  const handleFormSubmit = (submitted: boolean) => {
    setIsFormSubmitted(submitted);
  };
  const togglePauseAndCameraRevolve = useCallback(
    (ev: MouseEvent) => {
      ev.preventDefault();
      update(state => ({
        isPaused: !state.isPaused,
        cameraRevolve: !state.cameraRevolve,
      }));
    },
    [update],
  );

  useSystem();

  return (
    <div>
      {isLoading ? (
        <div></div>
      ) : isValidQR ? (
        isFormSubmitted ? (
          <div className={css(styles.container)} onContextMenu={togglePauseAndCameraRevolve}>
            <Screen />
            <Mount className={css(styles.stats, showStats && styles.statsShow)} dom={stats.dom} />
            <StartPlay />
          </div>
        ) : (
          <FormComponent onSubmit={handleFormSubmit} />
        )
      ) : (
        <div>无效验证码</div>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    fontSize: '12px',
    userSelect: 'none',
    MozUserSelect: 'none',
    MsUserSelect: 'none',
    position: 'fixed',
    background: '#000',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stats: {
    display: 'none',
  },
  statsShow: {
    display: 'block',
  },
});
