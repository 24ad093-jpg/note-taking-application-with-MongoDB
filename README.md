# My Notes

A responsive notes application built with React 19, Vite, Express 5, MongoDB, and Mongoose. Notes are persisted in MongoDB and can be created, searched, edited, pinned, and deleted.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Setup

Open two terminals from the `notes-taking-app` directory.

1. Configure the server environment. A local-development `server/.env` is included; review its values. If it is missing, create it from the example:

   ```powershell
   if (-not (Test-Path server/.env)) { Copy-Item server/.env.example server/.env }
   ```

   Set `MONGO_URI` in `server/.env`. The local value targets `mongodb://127.0.0.1:27017/notes_app`. For Atlas, use the connection URI from your cluster and keep credentials only in this ignored `.env` file.

2. Install the backend and frontend dependencies:

   ```powershell
   cd server
   npm install
   cd ../client
   npm install
   ```

3. Start MongoDB if using a local installation. On Windows, start the MongoDB service from an elevated PowerShell when installed as a service:

   ```powershell
   Start-Service MongoDB
   ```

   If MongoDB is not registered as a service, start `mongod` using your installation's configured data directory.

4. Start the backend in the first terminal:

   ```powershell
   cd server
   npm run dev
   ```

5. Start the Vite frontend in a second terminal:

   ```powershell
   cd client
   npm run dev
   ```

   Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build

Build the frontend and run the Express server, which serves the built client from `client/dist`:

```powershell
cd client
npm run build
cd ../server
npm start
```

Open `http://localhost:5000`. Set `PORT`, `MONGO_URI`, and optionally `CLIENT_ORIGIN` in `server/.env` for the target environment.

## API

All successful list and single-note responses use `{ "notes": [...] }` and `{ "note": {...} }` respectively. Errors return `{ "error": "..." }`.

```powershell
# List all notes
curl.exe http://localhost:5000/api/notes

# Search titles and content (case-insensitive)
curl.exe "http://localhost:5000/api/notes?search=biology"

# Create a note
curl.exe -X POST http://localhost:5000/api/notes `
  -H "Content-Type: application/json" `
  -d '{"title":"Study plan","content":"Review chapter 4","color":"mint","pinned":true}'

# Get one note; replace NOTE_ID with the returned MongoDB ID
curl.exe http://localhost:5000/api/notes/NOTE_ID

# Update a note
curl.exe -X PUT http://localhost:5000/api/notes/NOTE_ID `
  -H "Content-Type: application/json" `
  -d '{"title":"Study plan","content":"Review chapters 4 and 5","color":"sky","pinned":false}'

# Delete a note
curl.exe -X DELETE http://localhost:5000/api/notes/NOTE_ID
```

Invalid ObjectIds return HTTP 400; missing notes return HTTP 404. Search waits 250 ms after typing before requesting the API. The database text index is defined on `title` and `content`; API search uses escaped case-insensitive matching so partial words are searchable too.
