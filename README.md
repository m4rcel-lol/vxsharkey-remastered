# 🦈 vxsharkey

A lightweight, stateless, Alpine-optimized Sharkey/Misskey embed frontend (vxtwitter-style transformer) built with standard, stable technologies.

## Features

- ✨ **Auto-detection**: Automatically detects and routes any Sharkey/Misskey URL
- 🔗 **Smart Redirects**: Redirects users to exactly where they intended to go
- 🖼️ **Rich OpenGraph Embeds**: Generates high-quality OpenGraph metadata
- 💬 **Revolutionary Discord Embeds**: Produces beautiful Discord webhook embeds
- 📝 **Proper Quote Rendering**: Fully renders quoted notes with context
- 📎 **Multiple Attachments**: Shows all attachments in embeds and pages
- 🎨 **Styled Pages**: Clean, modern UI with external CSS
- ⚡ **Alpine Optimized**: Runs efficiently on Alpine Linux servers
- 🐳 **Docker Ready**: Deploys cleanly via Docker Compose
- 🔒 **Secure**: Built-in sanitization, rate limiting, and security headers

## Tech Stack

- **Backend**: Node.js 20, Express.js
- **Template Engine**: EJS
- **Styling**: Vanilla CSS (linked stylesheet)
- **Caching**: LRU in-memory cache (optional Redis)
- **OG Images**: Puppeteer + Alpine Chromium
- **Reverse Proxy**: nginx:alpine

## Quick Start

### With Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/m4rcel-lol/vxsharkey-remastered.git
cd vxsharkey-remastered
```

2. Start the services:
```bash
docker compose up -d
```

3. Access the application:
- Web interface: http://localhost
- Direct API: http://localhost:3000

### Development Mode

```bash
docker compose -f docker-compose.dev.yml up
```

### Without Docker

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Usage

### Web Interface

Visit the home page and paste any Sharkey/Misskey URL:
- Note URLs: `https://instance.com/notes/abc123`
- Profile URLs: `https://instance.com/@username`
- Instance URLs: `https://instance.com`

### API Endpoints

#### URL Resolution
```
GET /resolve?url=https://instance.com/notes/abc123
GET /raw/https://instance.com/notes/abc123
```

#### Note Page (with OpenGraph)
```
GET /instance/:domain/notes/:noteId
```

#### Profile Page
```
GET /profile/:domain/:username
```

#### Instance Page
```
GET /instance/:domain
```

#### Discord Embed JSON
```
GET /api/discord-embed/:domain/notes/:noteId
```

Returns JSON formatted for Discord webhooks with the footer:
```
🦈 vxsharkey • by m5rcode
```

#### OG Image
```
GET /og-image/:domain/notes/:noteId
```

Returns a 1200x630 PNG image optimized for social media embeds.

## Features in Detail

### Auto URL Detection

The system accepts any Sharkey/Misskey URL and automatically:
1. Validates the URL
2. Extracts the domain
3. Detects content type (note, profile, instance)
4. Redirects to the appropriate page

### OpenGraph Embeds

Every note page includes comprehensive OpenGraph tags:
- `og:type`, `og:title`, `og:description`
- `og:image`, `og:url`, `og:site_name`
- `twitter:card` with large image support
- `theme-color` for mobile browsers

### Multiple File Support

- **Single image**: Used directly as `og:image`
- **Multiple images**: Generates composite 1200x630 grid image
- **Videos**: Uses thumbnail as `og:image`
- **No media**: Generates styled card with note content

### Quote Rendering

When a note quotes another note, the embed:
- Shows the original author
- Displays quote excerpt
- Includes visual indication
- Previews quoted attachments

### Discord Webhook Format

The `/api/discord-embed` endpoint returns properly formatted JSON:
```json
{
  "embeds": [{
    "author": {
      "name": "Username",
      "icon_url": "avatar_url"
    },
    "description": "Note content...",
    "color": 3447003,
    "timestamp": "2024-01-01T00:00:00Z",
    "footer": {
      "text": "🦈 vxsharkey • by m5rcode"
    }
  }]
}
```

## Security

The application includes multiple security features:
- Domain validation (blocks private IPs)
- HTML sanitization (strips scripts)
- Request timeouts
- Rate limiting per IP
- Strict CSP headers
- Referrer policy enforcement
- File size limits

## Performance

- In-memory LRU cache with configurable TTL
- Concurrent request limiting
- Efficient memory usage
- Fast TTFB (Time To First Byte)
- Optimized for <512MB RAM

## Configuration

Environment variables (see `.env.example`):

```env
PORT=3000
NODE_ENV=production
CACHE_TTL=900000              # 15 minutes
CACHE_MAX_SIZE=500
RATE_LIMIT_WINDOW_MS=60000    # 1 minute
RATE_LIMIT_MAX_REQUESTS=100
OG_IMAGE_ENABLED=true
CHROMIUM_PATH=/usr/bin/chromium-browser
REQUEST_TIMEOUT=10000         # 10 seconds
```

## Testing

Run tests:
```bash
npm test
```

Tests include:
- URL parser tests
- Route detection tests
- Sanitization tests
- Cache expiration tests

## Architecture

### Project Structure
```
vxsharkey/
├── src/
│   ├── server.js              # Main Express server
│   ├── routes/
│   │   └── index.js           # All route handlers
│   ├── middleware/
│   │   └── errorHandler.js   # Error handling
│   ├── services/
│   │   ├── misskeyClient.js  # Misskey API client
│   │   └── ogImageGenerator.js # OG image generation
│   └── utils/
│       ├── urlParser.js       # URL detection
│       └── sanitizer.js       # HTML sanitization
├── views/                     # EJS templates
│   ├── home.ejs
│   ├── note.ejs
│   ├── profile.ejs
│   ├── instance.ejs
│   ├── error.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
├── public/
│   └── style.css             # Linked stylesheet
├── test/                      # Test files
├── Dockerfile                 # Alpine-based image
├── docker-compose.yml         # Production compose
├── docker-compose.dev.yml     # Development compose
└── nginx.conf                 # Nginx reverse proxy
```

## Deployment

### Docker Deployment

The application is optimized for Docker deployment:

1. Build the image:
```bash
docker build -t vxsharkey .
```

2. Run with Docker Compose:
```bash
docker compose up -d
```

The final image is lightweight and runs under 512MB RAM.

### Alpine Linux

The application is specifically optimized for Alpine:
- Uses `node:20-alpine` base image
- Includes Alpine-compatible Chromium
- No glibc dependencies
- Minimal package footprint

### Health Checks

Docker Compose includes health checks:
- Checks every 30 seconds
- 3 retries before marking unhealthy
- 40-second startup grace period

## License

MIT

## Author

**m5rcode**

🦈 vxsharkey • by m5rcode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues, please open an issue on GitHub.
