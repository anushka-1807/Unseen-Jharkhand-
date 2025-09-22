Guide Profile Photos

Place JPG or PNG files in this folder to show profile photos for guides.

Recommended naming convention:
- Use lowercase, letters only, and underscores for spaces
- Based on the guide's name, e.g.:
  Aman Kumar           -> aman_kumar.jpg
  Priya Soren          -> priya_soren.jpg
  Sanjay Munda         -> sanjay_munda.jpg

File path to use in JSON:
- /images/guides/<filename>
- Example: "/images/guides/aman_kumar.jpg"

How to link photos:
1) Copy your files into this folder.
2) Update backend/data/guides_40.json and add a "photo" field per guide, e.g.:
   {
     "name": "Aman Kumar",
     "email": "aman.ranchi@unseenjh.in",
     "city": "Ranchi",
     "specialties": "Nature,Waterfalls,Temples",
     "languages": "Hindi,English",
     "pricePerDay": 1900,
     "rating": 4.7,
     "photo": "/images/guides/aman_kumar.jpg"
   }
3) Re-import the dataset:
   Powershell:
     $headers = @{ "Content-Type" = "application/json"; "x-admin-key" = "your-secret-key" }
     $body = Get-Content ".\data\guides_40.json" -Raw
     Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/guide/replace-all" -Headers $headers -Body $body

Notes:
- If a photo is missing or fails to load, the UI falls back to /images/hl_guides.jpg
- Large images will be served as-is; consider keeping files under ~400 KB for performance.
