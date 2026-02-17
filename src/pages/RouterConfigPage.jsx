import { useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import ConfigHeader from '../components/config/ConfigHeader';
import KeyValueTable from '../components/config/KeyValueTable';

export default function RouterConfigPage() {
  const { routerConfig, loading, error, loadRouterConfig } = useConfig();

  useEffect(() => { loadRouterConfig(); }, []);

  if (loading && !routerConfig) return <div className="page"><p className="dash-loading">Loading configuration...</p></div>;
  if (error) return <div className="page"><div className="error-msg">{error}</div></div>;

  return (
    <div className="page config-page">
      <ConfigHeader title="Router Configuration" description="Domain classifier, Q-learning router, and training parameters." />

      {routerConfig ? (
        <>
          <KeyValueTable title="Language Config" data={routerConfig.language_config} />
          <KeyValueTable title="Domain Classifier" data={routerConfig.domain_config} />
          <KeyValueTable title="Q-Learning Router" data={routerConfig.qlearning_config} />
          <KeyValueTable title="Training" data={routerConfig.training} />
          <KeyValueTable title="Evaluation" data={routerConfig.evaluation} />
        </>
      ) : (
        <p className="dash-loading">Loading router config...</p>
      )}
    </div>
  );
}
