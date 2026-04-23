# Final Exam - Customer Management

This repository contains the final exam solution for a full stack customer management task.

## Project structure

```text
final-exam/
├── app.js
├── docker-compose.yml
├── Dockerfile
├── init.sql
├── package.json
└── public/
    ├── index.html
    ├── index.js
    └── styles.css
```

## Implemented functionality

- Add a new customer from the Customer Management form
- Load selected customer data into the form by clicking a customer card
- Update selected customer
- Delete selected customer
- Refresh customer records after each create, update, and delete operation

## Supported fields

- First name
- Last name
- Email
- Phone
- Birth date

## Run with Docker

From the `final-exam` folder:

```bash
docker compose up --build
```

Open:

- `http://localhost:3000` for the web app

## AI usage note

Primary AI tool used: Cursor AI.

How it was used:
- help with frontend CRUD wiring in `index.js`
- help with form/UI structure and styling updates
- debugging API integration and workflow verification