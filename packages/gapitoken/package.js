Package.describe({
  summary: "Google Api"
});

Package.on_use(function (api) {
    if(api.export) {
        api.export('GAPI');
    }
    api.add_files('gapitoken.js', 'server');
});
