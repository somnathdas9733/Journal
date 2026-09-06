# Paradigm Journal — AI-Powered Cognitive Reflection & Brainstorming

Paradigm Journal is a high-performance cognitive journaling application crafted in the "Geometric Balance" design aesthetic, featuring deep Socratic AI reflection, structured brainstorming canvases (First Principles, SCAMPER, Six Thinking Hats), prompt generation, and mood tracking. Powered by Google Gemini AI and built with full-stack Express + React and Tailwind CSS.

---

## 1. Environment & Prerequisites

Ensure the Google Cloud CLI (`gcloud`) and Node.js (v18+) are installed on your workstation.

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required Google Cloud services
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Management Setup (Zero-Hardcoding Hygiene)

Create and populate the `GEMINI_API_KEY` secret in Google Cloud Secret Manager and grant access to the Cloud Run default runtime service account.

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Retrieve your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# 3. Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration

For cloud-backed multi-user setups using Cloud Firestore, deploy owner-bound security rules to ensure user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Local Development

```bash
# 1. Clone or navigate to the workspace
npm install

# 2. Configure environment variables in .env
cp .env.example .env
# Set GEMINI_API_KEY in .env

# 3. Start development server
npm run dev
```
The server will boot on `http://localhost:3000`.

---

## 5. Cloud Run Deployment Flow

Build and deploy the application container directly to Cloud Run:

```bash
# Build and deploy from source
gcloud run deploy paradigm-journal \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 6. Required Campaign Verification Labeling

Apply the mandatory challenge campaign resource label to register the service for automated verification:

```bash
gcloud run services update paradigm-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 7. Architecture & Threat Modeling Countermeasures

| Threat Zone | Identified Vector | Implemented Mitigation |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious injection in prompts or reflections | Strict request schema parsing, defensive null-checking, input length trimming |
| **Planning & Reasoning** | Prompt injection & system prompt override | Context segregation with clear boundary quotes, dedicated Socratic system instructions |
| **Tool Execution** | API credential exfiltration / SSRF | Server-side only execution, `@google/genai` never imported on client |
| **Memory & State** | Client state corruption / storage overflows | Strict undefined-stripping (`sanitizePayload`), transaction verification alerts |
| **Inter-System Communication**| Transient API outages & rate limits | 4-tier model fallback ladder (`gemini-3.6-flash` -> `gemini-3.1-flash-lite` -> `gemini-flash-latest` -> `gemini-3.7-flash`) |
