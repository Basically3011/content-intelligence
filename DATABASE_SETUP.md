# Database Setup Guide

## PostgreSQL-Verbindung einrichten

### 1. Umgebungsvariablen konfigurieren

Öffnen Sie die Datei `.env.local` und ersetzen Sie die Platzhalter mit Ihren echten Datenbankzugangsdaten:

```env
# Ihre PostgreSQL-Verbindungsdetails
DATABASE_URL="postgresql://IHR_USERNAME:IHR_PASSWORT@IHR_HOST:5432/IHR_DATENBANKNAME?schema=public"

# Falls Sie Connection Pooling nutzen (z.B. PgBouncer):
DIRECT_URL="postgresql://IHR_USERNAME:IHR_PASSWORT@IHR_HOST:5432/IHR_DATENBANKNAME?schema=public"
```

**Beispiel:**
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/content_analytics?schema=public"
DIRECT_URL="postgresql://myuser:mypassword@localhost:5432/content_analytics?schema=public"
```

### 2. Schema-Synchronisation

#### Option A: Bestehende Datenbank introspektieren (empfohlen)

Wenn Sie bereits eine PostgreSQL-Datenbank mit Daten haben:

```bash
# Zieht das Schema aus Ihrer bestehenden Datenbank
npx prisma db pull

# Generiert den Prisma Client neu
npx prisma generate
```

Dies überschreibt das `prisma/schema.prisma` mit der tatsächlichen Struktur Ihrer Datenbank.

#### Option B: Neues Schema in die Datenbank pushen

Wenn Sie eine leere Datenbank haben und das PRD-Schema verwenden möchten:

```bash
# Erstellt die Tabellen in der Datenbank basierend auf schema.prisma
npx prisma db push

# Oder mit Migrations (für Production):
npx prisma migrate dev --name init
```

### 3. Datenbankverbindung testen

Nachdem Sie `.env.local` konfiguriert haben:

```bash
# Starten Sie den Dev-Server (falls noch nicht läuft)
npm run dev

# Testen Sie die Verbindung über die Health-Check API
curl http://localhost:3000/api/health
```

Erwartete Antwort bei erfolgreicher Verbindung:
```json
{
  "status": "ok",
  "database": "connected",
  "contentCount": 0,
  "timestamp": "2024-..."
}
```

### 4. Prisma Studio (Optional)

Prisma Studio ist ein grafisches Tool zum Durchsuchen und Bearbeiten Ihrer Daten:

```bash
npx prisma studio
```

Öffnet automatisch `http://localhost:5555` mit einer GUI für Ihre Datenbank.

---

## Bestehende Datenbankstruktur

Falls Ihre Tabellennamen oder Spaltennamen vom PRD-Schema abweichen:

### Tabellen-Mapping anpassen

Im `schema.prisma` können Sie mit `@@map` und `@map` die Modellnamen und Feldnamen anpassen:

```prisma
model ContentItem {
  id                Int       @id @default(autoincrement())
  inventory_id      Int       @unique @map("inventoryId")  // wenn Spalte anders heißt

  @@map("your_actual_table_name")  // wenn Tabelle anders heißt
}
```

### Nach Schema-Änderungen

Immer nach Änderungen am Schema:

```bash
npx prisma generate
```

---

## Troubleshooting

### "Can't reach database server"

- Prüfen Sie Host, Port und Credentials in `.env.local`
- Stellen Sie sicher, dass PostgreSQL läuft
- Prüfen Sie Firewall-Einstellungen

### "Database does not exist"

```bash
# Erstellen Sie die Datenbank manuell
createdb content_analytics

# Oder via psql:
psql -U postgres -c "CREATE DATABASE content_analytics;"
```

### "SSL connection required"

Fügen Sie `?sslmode=require` zur DATABASE_URL hinzu:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&sslmode=require"
```

### Schema-Konflikte

Wenn das generierte Schema nicht zu Ihrer DB passt:

1. Sichern Sie Ihr aktuelles `schema.prisma`
2. Führen Sie `npx prisma db pull` aus
3. Vergleichen und mergen Sie die Änderungen manuell

---

## API-Endpunkte

Nach erfolgreicher Verbindung stehen folgende Endpunkte zur Verfügung:

- `GET /api/health` - Datenbankstatus und Connection-Test
- `GET /api/content` - Content-Liste mit Filtern und Pagination
- `GET /api/content/:id` - Einzelnes Content-Item
- `GET /api/content?action=stats` - Content-Statistiken

### Beispiel-Requests

```bash
# Health Check
curl http://localhost:3000/api/health

# Alle Content-Items (erste Seite)
curl http://localhost:3000/api/content

# Mit Filtern
curl "http://localhost:3000/api/content?search=marketing&personas=CTO&page=1&limit=10"

# Statistiken
curl http://localhost:3000/api/content?action=stats
```

---

## Nächste Schritte

Nach erfolgreicher Datenbankverbindung:

1. Prüfen Sie, ob Daten korrekt geladen werden
2. Passen Sie das Schema bei Bedarf an Ihre Struktur an
3. Testen Sie die API-Endpunkte
4. Beginnen Sie mit der Feature-Entwicklung gemäß PRD
