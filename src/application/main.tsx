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
import { getTimes, fetchData } from './api';

export const Main: FunctionalComponent<{}> = props => {
  const stats = useStats();
  const store = useStore();
  const update = store.update;
  const { showStats } = store.state;

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isValidQR, setIsValidQR] = useState(false);
  const [times, setTimes] = useState(0);
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setId(id);
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
        .catch((error: any) => setIsValidQR(false));
      getTimes(id)
        .then((data: any) => {
          if (data.code === 0) {
            setTimes(data.data);
          }
        })
        .catch((error: any) => setTimes(0));
    } else {
      // 无效验证码
      setIsValidQR(false);
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
      {isValidQR ? (
        isFormSubmitted || times >= 3 ? (
          <div className={css(styles.container)} onContextMenu={togglePauseAndCameraRevolve}>
            <Screen />
            <Mount className={css(styles.stats, showStats && styles.statsShow)} dom={stats.dom} />
            <StartPlay />
          </div>
        ) : (
          <FormComponent onSubmit={handleFormSubmit} id={id} />
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
