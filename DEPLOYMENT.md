# Deployment Guide für Unraid (Docker Compose)

Dieser Guide beschreibt die Installation und Wartung der Content Intelligence App auf einem Unraid Server mit Docker Compose.

## Voraussetzungen

- Unraid Server mit Docker Compose Plugin installiert
- PostgreSQL Datenbank läuft bereits (separat)
- SSH Zugriff auf Unraid Server
- Git (sollte standardmäßig auf Unraid verfügbar sein)

## Initial Setup

### 1. Repository auf Unraid klonen

Verbinde dich per SSH mit deinem Unraid Server und navigiere zum gewünschten Speicherort (z.B. `/mnt/user/appdata/content-intelligence`):

```bash
cd /mnt/user/appdata
git clone https://github.com/Basically3011/content-intelligence.git
cd content-intelligence
```

### 2. Environment Variables konfigurieren

Erstelle eine `.env` Datei mit deinen Datenbank-Verbindungsdaten:

```bash
nano .env
```

Füge folgende Variablen ein (mit deinen tatsächlichen Werten):

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/content_intelligence?schema=public"
DIRECT_URL="postgresql://username:password@host:5432/content_intelligence?schema=public"

# Node Environment
NODE_ENV="production"
```

**Wichtig:** Ersetze `username`, `password`, `host`, und `content_intelligence` mit deinen tatsächlichen Datenbank-Credentials.

#### Database URL Format Erklärung:
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=[SCHEMA]
```

**Beispiele:**
- Lokale DB: `postgresql://postgres:mypassword@localhost:5432/content_db?schema=public`
- Netzwerk DB: `postgresql://dbuser:secret@192.168.1.100:5432/content_db?schema=public`
- Mit SSL: `postgresql://user:pass@host:5432/db?schema=public&sslmode=require`

Speichere die Datei (`Ctrl+X`, dann `Y`, dann `Enter`).

### 3. Prisma Migrationen ausführen

**Wichtig:** Führe die Datenbank-Migrationen aus, bevor du den Container startest:

```bash
# Option A: Mit Node lokal (falls installiert)
npx prisma migrate deploy

# Option B: Mit temporärem Docker Container
docker run --rm \
  -v $(pwd)/prisma:/app/prisma \
  --env-file .env \
  node:20-alpine \
  sh -c "npm install -g prisma && prisma migrate deploy"
```

### 4. Docker Image bauen und Container starten

```bash
# Image bauen (erster Build kann 5-10 Minuten dauern)
docker-compose build

# Container im Hintergrund starten
docker-compose up -d
```

### 5. Überprüfen ob alles läuft

```bash
# Container Status prüfen
docker-compose ps

# Logs anschauen
docker-compose logs -f

# Health Check
curl http://localhost:3000/api/health
```

Die App sollte nun unter `http://[UNRAID-IP]:3000` erreichbar sein.

## Updates durchführen

Wenn eine neue Version der App im GitHub Repository verfügbar ist:

### Methode 1: Schnelles Update (empfohlen)

```bash
cd /mnt/user/appdata/content-intelligence

# Container stoppen
docker-compose down

# Neues Image bauen (holt automatisch neueste Version von GitHub)
docker-compose build --no-cache

# Container neu starten
docker-compose up -d

# Logs prüfen
docker-compose logs -f
```

### Methode 2: Mit Git Pull (falls lokale Änderungen)

```bash
cd /mnt/user/appdata/content-intelligence

# Repository aktualisieren
git pull origin main

# Container neu bauen und starten
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Nach jedem Update: Datenbank-Migrationen prüfen

Falls das Update neue Datenbank-Änderungen enthält:

```bash
# Prüfe ob neue Migrationen vorhanden sind
docker-compose exec content-intelligence npx prisma migrate status

# Falls nötig, Migrationen ausführen
docker-compose exec content-intelligence npx prisma migrate deploy
```

## Wartung

### Container Logs anzeigen

```bash
# Alle Logs anzeigen
docker-compose logs

# Logs live verfolgen
docker-compose logs -f

# Nur die letzten 100 Zeilen
docker-compose logs --tail=100
```

### Container neu starten

```bash
# Graceful restart
docker-compose restart

# Oder: Stoppen und neu starten
docker-compose down
docker-compose up -d
```

### Container Status prüfen

```bash
# Status aller Services
docker-compose ps

# Detaillierte Container-Info
docker inspect content-intelligence
```

### In den Container einsteigen

```bash
# Shell im laufenden Container öffnen
docker-compose exec content-intelligence sh

# Prisma Befehle ausführen
docker-compose exec content-intelligence npx prisma studio
```

## Prisma Befehle

### Datenbank Schema prüfen

```bash
docker-compose exec content-intelligence npx prisma db pull
```

### Prisma Client neu generieren

```bash
docker-compose exec content-intelligence npx prisma generate
```

### Prisma Studio (Database GUI) starten

```bash
docker-compose exec content-intelligence npx prisma studio
```

Dann im Browser öffnen: `http://[UNRAID-IP]:5555`

## Backup & Restore

### Backup erstellen

```bash
# Docker Image als Backup speichern
docker save content-intelligence:latest | gzip > content-intelligence-backup.tar.gz

# Environment Variablen sichern
cp .env .env.backup
```

### Restore durchführen

```bash
# Image aus Backup laden
docker load < content-intelligence-backup.tar.gz

# Environment Variablen wiederherstellen
cp .env.backup .env

# Container starten
docker-compose up -d
```

## Troubleshooting

### Problem: Container startet nicht

**Lösung 1: Logs prüfen**
```bash
docker-compose logs content-intelligence
```

**Lösung 2: Datenbank-Verbindung testen**
```bash
# Teste die DATABASE_URL
docker-compose exec content-intelligence sh -c 'npx prisma db execute --stdin < /dev/null'
```

**Lösung 3: Container von Grund auf neu bauen**
```bash
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Problem: "Can't reach database server"

**Ursache:** Falsche DATABASE_URL oder Datenbank nicht erreichbar

**Lösung:**
```bash
# Prüfe .env Datei
cat .env

# Teste Datenbank-Verbindung manuell
docker run --rm \
  --env-file .env \
  postgres:15-alpine \
  psql $DATABASE_URL -c "SELECT 1"
```

### Problem: Health Check failed

**Ursache:** `/api/health` Endpoint antwortet nicht

**Lösung:**
```bash
# Prüfe ob der Port verfügbar ist
netstat -tuln | grep 3000

# Teste den Endpoint direkt
docker-compose exec content-intelligence wget -O- http://localhost:3000/api/health
```

### Problem: Port 3000 bereits belegt

**Lösung:** Ändere den Port in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Ändere 3000 auf einen freien Port
```

### Problem: Build dauert sehr lange

**Ursache:** Langsame Internetverbindung oder npm Registry Issues

**Lösung:**
```bash
# Build mit verbose output
docker-compose build --progress=plain

# Oder: npm Registry ändern (im Dockerfile)
# RUN npm config set registry https://registry.npmjs.org/
```

### Problem: Prisma Client Fehler

**Ursache:** Prisma Client nicht korrekt generiert

**Lösung:**
```bash
# Prisma Client neu generieren
docker-compose exec content-intelligence npx prisma generate

# Container neu starten
docker-compose restart
```

### Problem: "ECONNREFUSED" beim Datenbank-Zugriff

**Ursache:** Container kann die Datenbank nicht erreichen

**Lösung:**
```bash
# Prüfe ob Datenbank läuft
docker ps | grep postgres

# Prüfe Network Verbindung
docker network inspect content-intelligence_content-intelligence-network

# Falls Datenbank in anderem Docker Network: Füge Network hinzu
docker network connect [DB-NETWORK] content-intelligence
```

## Performance Optimierung

### Memory Limits setzen

Füge in `docker-compose.yml` hinzu:

```yaml
services:
  content-intelligence:
    # ... andere Konfiguration
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 512M
```

### Build Cache nutzen

```bash
# Rebuild mit Cache
docker-compose build

# Nur bei Problemen: Build ohne Cache
docker-compose build --no-cache
```

## Sicherheit

### Best Practices

1. **Nicht als Root ausführen**: Das Dockerfile verwendet bereits einen non-root User (`nextjs`)
2. **Environment Variablen**: Niemals `.env` ins Git Repository committen
3. **Firewall**: Öffne Port 3000 nur für vertrauenswürdige Netzwerke
4. **SSL/TLS**: Verwende einen Reverse Proxy (z.B. Nginx Proxy Manager) für HTTPS
5. **Updates**: Halte das Base Image aktuell

### Reverse Proxy Setup (optional)

Für HTTPS-Zugriff über einen Reverse Proxy:

**Nginx Proxy Manager Beispiel:**
- Proxy Host: `content-intelligence.yourdomain.com`
- Forward Hostname/IP: `content-intelligence` (Container Name)
- Forward Port: `3000`
- SSL: Let's Encrypt aktivieren

## Monitoring

### Container Ressourcen überwachen

```bash
# CPU und Memory Usage
docker stats content-intelligence

# Disk Usage
docker system df
```

### Application Logs

```bash
# Kontinuierlich Logs anzeigen
docker-compose logs -f --tail=50 content-intelligence

# Logs in Datei speichern
docker-compose logs > app-logs.txt
```

## Automatisierung

### Auto-Update Script (optional)

Erstelle ein Script `/mnt/user/appdata/scripts/update-content-intelligence.sh`:

```bash
#!/bin/bash
cd /mnt/user/appdata/content-intelligence
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose logs --tail=50
```

Mache es ausführbar und erstelle einen Cron Job:

```bash
chmod +x /mnt/user/appdata/scripts/update-content-intelligence.sh

# Füge zu Unraid User Scripts hinzu für wöchentliches Update
```

## Support & Dokumentation

- **GitHub Repository**: https://github.com/Basically3011/content-intelligence
- **Next.js Dokumentation**: https://nextjs.org/docs
- **Prisma Dokumentation**: https://www.prisma.io/docs
- **Docker Compose Dokumentation**: https://docs.docker.com/compose/

## Checkliste für neues Deployment

- [ ] Unraid Server vorbereitet
- [ ] PostgreSQL Datenbank läuft
- [ ] Repository geklont
- [ ] `.env` Datei erstellt mit korrekten Credentials
- [ ] Prisma Migrationen ausgeführt
- [ ] Docker Image gebaut
- [ ] Container gestartet
- [ ] Health Check erfolgreich
- [ ] App im Browser erreichbar
- [ ] Logs auf Fehler geprüft
- [ ] Backup-Strategie definiert

## Nützliche Kommandos - Quick Reference

```bash
# Starten
docker-compose up -d

# Stoppen
docker-compose down

# Neu starten
docker-compose restart

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps

# Update durchführen
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Prisma Migrationen
docker-compose exec content-intelligence npx prisma migrate deploy

# In Container einsteigen
docker-compose exec content-intelligence sh
```

---

**Version:** 1.0  
**Zuletzt aktualisiert:** November 2025

