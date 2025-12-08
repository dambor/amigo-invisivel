gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_IMAGE_NAME=gcr.io/hyperspace-409419/amigo-invisivel,_VITE_SUPABASE_URL=https://eialseqcakhtczizukqr.supabase.co,_VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYWxzZXFjYWtodGN6aXp1a3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MjQzOTgsImV4cCI6MjA3ODQwMDM5OH0.1yLUr_r4zvKTwE5XQuQLzeBT_gyzRBGPHDP8VIebvAs \
  .

gcloud run deploy amigo-invisivel \
  --image gcr.io/hyperspace-409419/amigo-invisivel \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated