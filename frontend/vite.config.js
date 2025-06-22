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
      'cc241070-10748.node.fhstp.cc', // Also add the specific hostname from your error
      'cc241070-10749.node.fhstp.cc', // Add the frontend hostname
      // Add any other hostnames your frontend might be accessed from (e.g., your local machine's IP if you use it directly)
    ],
    // Fix HMR WebSocket issues by using polling instead
    hmr: {
      // Use polling to avoid mixed content issues
      port: 5173,
      overlay: false // Disable error overlay for HMR issues
    }
  }
})
