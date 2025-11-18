# Proxy Configuration

The proxy server is configured via the `proxy.ron` file located in the `proxy/` directory.

## Configuration File: proxy.ron

```ron
(
    country_api_url: "https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population",
    proxy_port: 3000,
    upstream_host: "127.0.0.1",
    upstream_port: 8081,
    asset_dir: "dist/client",
)
```

## Configuration Options

### country_api_url (String, required)
The REST Countries API endpoint URL for fetching country data.

**Default**: `"https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population"`

### proxy_port (u16, optional)
The port on which the proxy server listens for incoming connections.

**Default**: `3000`  
**Validation**: Must be non-zero

### upstream_host (String, optional)
The hostname or IP address of the upstream SSR server (Bun server).

**Default**: `"127.0.0.1"`  
**Validation**: Cannot be empty

### upstream_port (u16, optional)
The port of the upstream SSR server.

**Default**: `8081`  
**Validation**: Must be non-zero

### asset_dir (String, optional)
The directory containing built static assets (client bundle).

**Default**: `"dist/client"`  
**Validation**: 
- Must exist
- Must be a directory
- Checked at startup

## Validation

The configuration is validated when the proxy server starts:

1. **Asset Directory**: Verified to exist and be a directory
2. **Port Numbers**: Must be non-zero
3. **Upstream Host**: Cannot be empty
4. **API URL**: Cannot be empty

If validation fails, the server will exit with a clear error message indicating the problem.

## Example Configurations

### Development
```ron
(
    country_api_url: "https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population",
    proxy_port: 3000,
    upstream_host: "127.0.0.1",
    upstream_port: 8081,
    asset_dir: "dist/client",
)
```

### Production
```ron
(
    country_api_url: "https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population",
    proxy_port: 80,
    upstream_host: "127.0.0.1",
    upstream_port: 8081,
    asset_dir: "/app/dist/client",
)
```

### Docker
```ron
(
    country_api_url: "https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population",
    proxy_port: 3000,
    upstream_host: "127.0.0.1",
    upstream_port: 8081,
    asset_dir: "dist/client",
)
```

## Troubleshooting

### "Asset directory does not exist"
Run `bun run build` to generate the client assets before starting the proxy.

### "proxy_port cannot be 0"
Ensure `proxy_port` is set to a valid port number (1-65535).

### "upstream_host cannot be empty"
Set a valid hostname or IP address for the upstream SSR server.

## Notes

- All optional fields have sensible defaults
- Configuration is loaded and validated at startup
- Invalid configuration will prevent the server from starting
- Changes require a server restart to take effect
