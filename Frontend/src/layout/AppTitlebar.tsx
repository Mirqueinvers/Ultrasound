function AppTitlebar() {
  const handleMinimize = () => window.windowAPI?.minimize();
  const handleMaximize = () => window.windowAPI?.maximize();
  const handleClose = () => window.windowAPI?.close();

  return (
    <div className="app-titlebar">
      <div className="app-titlebar-buttons">
        <button
          type="button"
          className="app-titlebar-button"
          onClick={handleMinimize}
        >
          &#8211;
        </button>
        <button
          type="button"
          className="app-titlebar-button"
          onClick={handleMaximize}
        >
          &#9633;
        </button>
        <button
          type="button"
          className="app-titlebar-button close"
          onClick={handleClose}
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
