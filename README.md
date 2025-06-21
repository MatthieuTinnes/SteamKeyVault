# SteamKeyVault Backend

This project is a Django REST API using Django Ninja and PostgreSQL. It provides endpoints for user management (CRUD) using Django Ninja.

## Setup

1. Create a PostgreSQL database and user.
2. Copy your database credentials into `steamkeyvault/settings.py` under the `DATABASES` section.
3. Create a Python virtual environment and install dependencies:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```sh
   python manage.py migrate
   ```
5. Start the development server:
   ```sh
   python manage.py runserver
   ```

## API

- User management endpoints are available at `/api/users/`.

## Requirements
- Django
- Django Ninja
- psycopg2-binary

---

For more details, see the code and comments in the project.
