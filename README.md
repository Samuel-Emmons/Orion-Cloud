# Orion-Cloud
A google drive clone created for me to learn full stack development.

Orion Cloud is a file storage application built with Node.js, React, and Typescript.
The frontend is created using Tailwind CSS and Shadcn/ui components.
The backend runs through Next.js Server Actions and connects to Appwrite using its Node.js SDK. Appwrite handles authentication, email verification codes, and database storage for user profiles.

Functionality so far:

Browser: React UI and forms
          ↓
Next.js Server Actions
          ↓
Appwrite: Authentication and user database
          ↓
Server sets session cookie
          ↓
Browser navigates to homepage
