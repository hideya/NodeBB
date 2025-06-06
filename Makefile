# NOTES: 
# - The command lines (recipe lines) must start with a TAB character.
# - Each command line runs in a separate shell without .ONESHELL:

# https://dashboard.render.com/web/srv-d0rchf15pdvs73ds465g/settings

.ONESHELL:
.PHONY: build start

SHELL = /bin/sh
ENV_FILE = $(if $(RENDER),/etc/secrets/.env,.env)

# Build Command
build:
	now=$$(date -u "+%Y-%m-%d %H:%M:%S"); \
	last_commit=$$(git rev-parse HEAD); \
	echo "{\"commit\": \"$$last_commit\", \"build_time\": \"$$now\"}" \
		> public/uploads/system/version.json
	# Visible at https://.../assets/uploads/system/version.json
	set -a; . $(ENV_FILE); set +a
	set | grep -E "(NODEBB_|AWS_|S3_)" | sort
	node generate-config.js
	./nodebb build
	npm install @h1deya/nodebb-plugin-s3-uploads
	./nodebb activate @h1deya/nodebb-plugin-s3-uploads
	./nodebb build

# Start Command
start:
	set -a; . $(ENV_FILE); set +a
	set | grep -E "(NODEBB_|AWS_|S3_)" | sort
	cat config.json
	./nodebb dev
