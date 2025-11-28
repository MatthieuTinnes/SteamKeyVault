# Environment Configuration

## Local Development

For local development, copy `.env.local` to `.env` or set the environment variables directly:

```bash
cp .env.local .env
```

Then edit `.env` with your actual database credentials and API keys.

## Environment Variables

### Required Variables

- `SECRET_KEY`: Django secret key (generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- `DB_PASSWORD`: PostgreSQL database password

### Optional Variables

- `DEBUG`: Enable debug mode (default: `True`)
- `LOG_LEVEL`: Logging level (default: `DEBUG`)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `CSRF_TRUSTED_ORIGINS`: Comma-separated list of trusted CSRF origins
- `STEAM_API_KEY`: Steam API key for Steam integration
- Email configuration: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`

## Production Deployment

Production environment variables are set in `docker-compose.yml` and read from the `.env` file in the project root.

See the main repository's `.env.example` for production configuration template.
