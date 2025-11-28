# SteamKeyVault Backend

This project is a Django REST API using Django Ninja and PostgreSQL. It provides endpoints for user management, game library, and Steam key management.

## Setup

### 1. Environment Configuration

Copy the local environment template and configure it:
```sh
cp .env.local .env
```

Edit `.env` with your actual configuration:
- Database credentials (PostgreSQL)
- Django SECRET_KEY (generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- Steam API key (optional, for Steam integration)
- Email configuration (optional, for email verification)

See [ENV.md](ENV.md) for detailed documentation of all available environment variables.

### 2. Database Setup

Create a PostgreSQL database and user matching your `.env` configuration:
```sql
CREATE DATABASE steamkeyvault_db;
CREATE USER steamkeyvault_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE steamkeyvault_db TO steamkeyvault_user;
```

### 3. Install Dependencies

Create a Python virtual environment and install dependencies:
```sh
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Run Migrations

Apply database migrations:
```sh
python manage.py migrate
```

### 5. Create Superuser (Optional)

Create an admin user:
```sh
python manage.py createsuperuser
```

### 6. Start Development Server

```sh
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

- **Authentication**: `/api/auth/` - Login, logout, registration
- **Users**: `/api/users/` - User management
- **Games**: `/api/games/` - Game library management
- **Keys**: `/api/keys/` - Steam key management
- **Steam**: `/api/steam/` - Steam integration
- **Admin**: `/admin/` - Django admin panel

## Requirements

- Python 3.10+
- PostgreSQL 12+
- Django 5.2+
- Django Ninja
- psycopg2-binary
- python-dotenv

See `requirements.txt` for complete list.

## Production Deployment

For production deployment with Docker, see the main repository's [DEPLOYMENT.md](../DEPLOYMENT.md).

---

For more details, see the code and [ENV.md](ENV.md) for environment configuration.
