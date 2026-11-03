export const CLOUDFLARE_REDIRECTS = `/* /index.html 200`;

export const WRANGLER_TOML = `name = "hospital-chc-dispatch-tracker"
compatibility_date = "2026-11-01"
pages_build_output_dir = "dist"

[vars]
# Add your environment variables in Cloudflare Dashboard under
# Settings -> Environment Variables for security.
# VITE_SUPABASE_URL = "https://your-project.supabase.co"
# VITE_SUPABASE_ANON_KEY = "your-anon-key"
`;

export const CLOUDFLARE_DEPLOYMENT_STEPS = [
  {
    step: 1,
    title: 'Push Code to GitHub / GitLab',
    detail: 'Initialize Git, commit files, and push to your GitHub or GitLab repository.'
  },
  {
    step: 2,
    title: 'Create Cloudflare Pages Project',
    detail: 'In the Cloudflare Dashboard, go to Workers & Pages > Create application > Pages > Connect to Git and select your repository.'
  },
  {
    step: 3,
    title: 'Configure Build Settings',
    detail: 'Framework preset: "Vite", Build command: "npm run build", Build output directory: "dist".'
  },
  {
    step: 4,
    title: 'Set Environment Variables',
    detail: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY under Environment Variables.'
  },
  {
    step: 5,
    title: 'Deploy & Bind Custom Domain',
    detail: 'Click "Save and Deploy". Cloudflare will automatically build and distribute your applet across its Indian edge nodes (Kolkata, Mumbai, Delhi) for near-instant access in Guwahati and Assam districts.'
  }
];
