# Makefile for SteamKeyVault project

.PHONY: help backend frontend migrate makemigrations install-backend install-frontend install-all start-all

help:
	@echo "Available targets:"
	@echo "  dev-backend     Start Django backend server"
	@echo "  dev-frontend    Start Vue frontend dev server"
	@echo "  migrate         Run Django migrations"
	@echo "  migrate-backend  Make new Django migrations"
	@echo "  install-backend Install backend Python dependencies"
	@echo "  install-frontend Install frontend JS dependencies (pnpm)"
	@echo "  install         Install all dependencies (backend + frontend)"
	@echo "  dev             Start both backend and frontend (concurrently)"

dev-backend:
	cd apps/backend && \
		venv/bin/python manage.py runserver

dev-frontend:
	cd apps/frontend && \
		pnpm run dev

migrate:
	cd apps/backend && \
		venv/bin/python manage.py migrate

migrate-backend:
	cd apps/backend && \
		venv/bin/python manage.py makemigrations

install-backend:
	cd apps/backend && \
		python -m venv venv && \
		. venv/bin/activate && pip install -r requirements.txt

install-frontend:
	cd apps/frontend && \
		pnpm install

install: install-backend install-frontend

dev:
	make -j2 dev-backend dev-frontend