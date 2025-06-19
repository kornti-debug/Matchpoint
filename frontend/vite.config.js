import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This makes Vite listen on all network interfaces
    port: 5173,      // Your frontend port
    // IMPORTANT: Add the allowedHosts array
    allowedHosts: [
      '.fhstp.cc', // Allow all subdomains of fhstp.cc, this is generally safer than specific subdomains if it's dynamic
      'cc241070-10734.node.fhstp.cc', // Also add the specific hostname from your error
      // Add any other hostnames your frontend might be accessed from (e.g., your local machine's IP if you use it directly)
    ],
    // If you're running backend on a different domain/port, you might need proxy rules here,
    // but we're handling API calls directly to process.env.REACT_APP_API_URL or similar,
    // so proxy is often not needed unless you're consolidating under one domain.
  }
})
