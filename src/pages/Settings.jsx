const Settings = () => {
  return (
    <div className="page-content">
      <h1>Settings</h1>
      <div className="content-grid">
        <div className="settings-section">
          <h2>App Settings</h2>
          <div className="content-cards">
            <div className="card">Display Settings</div>
            <div className="card">Audio Settings</div>
            <div className="card">Network Settings</div>
            <div className="card">Account Settings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;