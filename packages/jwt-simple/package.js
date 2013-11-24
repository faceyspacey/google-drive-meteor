Package.describe({
  summary: "jwt-simple"
});

Package.on_use(function (api) {
    if(api.export) {
        api.export('jwt');
    }
    api.add_files('index.js', 'server');
});
