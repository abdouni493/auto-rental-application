# 🚀 Vercel Deployment Guide

Your application has been pushed to GitHub and is ready to deploy on Vercel!

## Quick Deploy (2 minutes)

### Option 1: Automatic Deployment (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find: `abdouni493/auto-rental-application`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (already configured)
   - Output Directory: `dist` (already configured)
   - Install Command: `npm install`

4. **Environment Variables** (Important!)
   ```
   VITE_SUPABASE_URL=https://nwgryklsfevvnprspoed.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Z3J5a2xzZmV2dm5wcnNwb2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODEyNDcsImV4cCI6MjA4Njg1NzI0N30.P8iA_-IKlJxpY89FtHpo2Fc98Ve2sOaZXY2XikKQ4tg
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Visit your live URL! 🎉

### Option 2: Using Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to project
cd "c:\Users\Admin\Desktop\rental\auto rental application"

# 3. Deploy
vercel

# 4. Follow prompts:
#    - Set project name
#    - Set directory: . (current)
#    - Override build settings: No (use defaults)
#    - Add environment variables: Yes
#      Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 5. Get your live URL!
```

---

## Environment Variables Setup

### In Vercel Dashboard

1. Go to your project settings
2. Click "Environment Variables"
3. Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://nwgryklsfevvnprspoed.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (Your anon key from Supabase) |

⚠️ **Important**: These must start with `VITE_` to be available in frontend code.

---

## Update Your Config File

Make sure [vite.config.ts](vite.config.ts) has environment variables configured:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  }
})
```

---

## Update Supabase Client

Update [config/supabase.ts](config/supabase.ts) to use environment variables:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nwgryklsfevvnprspoed.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase database setup (SUPABASE_SETUP.sql executed)
- [ ] Environment variables configured
- [ ] Package.json has all dependencies
- [ ] Build command works locally: `npm run build`
- [ ] No TypeScript errors: `npm run build`

---

## After Deployment

### Verify Everything Works

1. **Check Build Logs**
   - In Vercel Dashboard → Deployments
   - Click latest deployment
   - View build logs for errors

2. **Test Pages**
   - VehiclesPage → Should load vehicles
   - CustomersPage → Should load customers
   - AgenciesPage → Should load agencies
   - WorkersPage → Should load workers
   - ExpensesPage → Should load expenses
   - OperationsPage → Should load inspections/damages

3. **Monitor Errors**
   - Vercel Dashboard → Monitoring
   - Check for runtime errors

---

## Automatic Deployments

Every time you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel automatically:
1. Detects the push
2. Runs build (`npm run build`)
3. Deploys to production
4. Updates your live URL

---

## Troubleshooting

### "Build Failed"
- Check Vercel build logs
- Run locally: `npm run build`
- Fix errors and push again

### "Environment variables not found"
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Redeploy after adding variables

### "Supabase connection error"
- Verify credentials in Supabase console
- Check RLS policies are set to allow reads
- Test connection locally first

### "Page loads but data doesn't show"
- Check browser console for errors
- Verify Supabase tables have data
- Check RLS policies in Supabase

---

## Performance Tips

### Enable Caching
In Vercel Settings → Git:
- Auto commit messages for deployments
- Automatically fail deployment on errors

### Monitor Build Time
- Current: ~30-60 seconds (Vite is fast!)
- Check Vercel Analytics for performance

### Database Performance
- Supabase indexes already created
- Connection pooling enabled
- RLS policies optimized

---

## Custom Domain (Optional)

1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records with Vercel instructions
4. Automatic SSL certificate

---

## Rollback Previous Deployment

If something breaks:

1. Go to Vercel Dashboard
2. Click Deployments
3. Find previous working deployment
4. Click "..." → Promote to Production
5. Done! (Takes 30 seconds)

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/
- **GitHub**: https://github.com/abdouni493/auto-rental-application

---

## Next Steps

1. ✅ GitHub push complete
2. 📋 Follow deployment steps above
3. 🚀 Your app goes live!
4. 📊 Monitor performance in Vercel dashboard
5. 🔄 Future updates: Push to main → Auto deploy

---

## Your Live URLs

Once deployed:
- **Production URL**: https://auto-rental-application.vercel.app (or your custom domain)
- **GitHub Repo**: https://github.com/abdouni493/auto-rental-application
- **Vercel Dashboard**: https://vercel.com/abdouni493/auto-rental-application

---

**Questions?** Check the Vercel dashboard build logs first! 🚀

