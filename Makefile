# Makefile - Comandos Docker MatchJob (Windows)
# Use: make help

.PHONY: help build up down logs restart shell-backend shell-frontend clean

help:
	@echo ========================================
	@echo Docker MatchJob - Comandos Disponíveis
	@echo ========================================
	@echo.
	@echo make build              - Fazer build das imagens
	@echo make build-prod         - Build para produção (sem cache)
	@echo make up                 - Iniciar containers
	@echo make down               - Parar containers
	@echo make down-clean         - Parar e remover volumes
	@echo make logs               - Ver logs de todos os serviços
	@echo make logs-backend       - Ver logs do backend
	@echo make logs-frontend      - Ver logs do frontend
	@echo make restart            - Reiniciar containers
	@echo make restart-backend    - Reiniciar backend
	@echo make restart-frontend   - Reiniciar frontend
	@echo make ps                 - Ver status dos containers
	@echo make shell-backend      - Acessar shell do backend
	@echo make shell-frontend     - Acessar shell do frontend
	@echo make clean              - Limpar tudo (parar, remover volumes)
	@echo.

build:
	docker-compose build

build-prod:
	docker-compose build --no-cache

up:
	docker-compose up -d

down:
	docker-compose down

down-clean:
	docker-compose down -v

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f sqlserver

logs-redis:
	docker-compose logs -f redis

restart:
	docker-compose restart

restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend

ps:
	docker-compose ps

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

shell-db:
	docker-compose exec sqlserver bash

status:
	docker-compose ps && echo. && echo === Uso de Recursos === && docker stats --no-stream

clean: down-clean
	@echo Limpeza completa realizada!

pull:
	docker-compose pull

test-backend:
	docker-compose exec backend dotnet test

test-frontend:
	docker-compose exec frontend npm test

prune:
	docker system prune -f

prune-all:
	docker system prune -af --volumes
