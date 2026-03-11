const handleClickUpdateMapLayer = async () => {
  try {
    const jwt = JSON.parse(sessionStorage.getItem('jwtToken') as string);
    const response = await fetch('/api/map-layer-generation-configs/trigger-update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      alert(`Erfolg: ${data.json.message}`);
      window.location.reload();
    } else {
      if (response.status === 401){
        alert('Fehler: Nur Admins können triggern.');
      } else {
        const data = await response.json();
        alert(`Fehler: ${data?.json?.error?.message}`);
      }
    }
  } catch (error) {
    alert('Netzwerkfehler beim Triggern.');
  }
};

export default {
  config: {
    locales: ['de'],
  },
  register(app: any) {
    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: 'UpdateMapLayerButton',
      Component: ({ slug }) => {
        if (slug !== 'api::map-layer-generation-config.map-layer-generation-config') {
          return undefined;
        }
        return (
          <button
            style={{
              width: '100%',
              height: '3.2rem',
              textDecoration: 'none',
              border: '1px solid #4945ff',
              background: '#4945ff',
              color: '#ffffff',
              borderRadius: '0.4rem',
              cursor: 'pointer',
            }}
            type="button"
            onClick={handleClickUpdateMapLayer}
          >
            <span
              style={{
                fontSize: '1.2rem',
                lineHeight: 1.33,
                fontWeight: 600,
              }}
            >
              Trigger update MapLayers
            </span>
          </button>
        );
      },
    });
  },
};
