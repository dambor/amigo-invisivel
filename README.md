## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Google Cloud Run

**Prerequisites:** [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install)

1. **Authentication**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Build and Deploy**:
   We use Cloud Build to handle environment variables securely. Run the following script (replace the keys with your actual values):

   ```bash
   gcloud builds submit --config cloudbuild.yaml \
     --substitutions=_IMAGE_NAME=gcr.io/YOUR_PROJECT_ID/amigo-invisivel,_VITE_SUPABASE_URL=your_url,_VITE_SUPABASE_KEY=your_key,_VITE_GEMINI_API_KEY=your_key \
     .
   ```

3. **Deploy Service**:
   ```bash
   gcloud run deploy amigo-invisivel \
     --image gcr.io/YOUR_PROJECT_ID/amigo-invisivel \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```
