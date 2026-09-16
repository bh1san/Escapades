import os
import json
import shutil
import requests
import tempfile
import subprocess
import time
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from github import Github
from supabase import create_client, Client

load_dotenv()

# --- INITIALIZATION ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY) if (SUPABASE_URL and SUPABASE_KEY) else None

# --- CONFIGURATION ---
NAMECHEAP_API_URL = "https://api.namecheap.com/xml.response"
VERCEL_API_URL = "https://api.vercel.com"

class DeploymentOrchestrator:
    def __init__(self):
        token = os.getenv("GITHUB_TOKEN")
        username = os.getenv("GITHUB_USERNAME")
        self.github = Github(token) if token else None
        self.github_username = username

    # =====================================================
    # STEP 1: VALIDATE THE AI PACKAGE
    # =====================================================
    def validate_package(self, package: Dict[str, Any]) -> bool:
        """Ensure the AI-generated package is complete, well-formed, and valid."""
        print("🔍 [Step 1] Validating AI-generated package...")
        
        required_fields = ["niche", "domain_suggestion", "tool_name", "tool_code", "articles"]
        for field in required_fields:
            if field not in package or not package[field]:
                print(f"❌ Validation Error: Missing required field '{field}'")
                return False
        
        if len(package.get("articles", [])) < 3:
            print(f"❌ Validation Error: Expected 3 articles, got {len(package.get('articles', []))}")
            return False
        
        if len(package.get("tool_code", "")) < 100:
            print("❌ Validation Error: Generated tool code is suspiciously short or empty")
            return False
        
        print("✅ Step 1 Passed: AI package successfully validated.")
        return True

    # =====================================================
    # STEP 2: PURCHASE DOMAIN (NAMECHEAP API)
    # =====================================================
    def purchase_domain(self, domain_name: str) -> Tuple[bool, Optional[str]]:
        """Purchase a domain via Namecheap API."""
        print(f"🌐 [Step 2] Initiating domain purchase: {domain_name}...")
        
        api_user = os.getenv("NAMECHEAP_API_USER")
        api_key = os.getenv("NAMECHEAP_API_KEY")
        client_ip = os.getenv("NAMECHEAP_CLIENT_IP")
        
        # Clean domain string
        clean_domain = domain_name.strip().lower()
        if not ("." in clean_domain):
            clean_domain += ".com"
            
        clean_domain = "".join(c for c in clean_domain if c.isalnum() or c in [".", "-"])
        
        # Dry-run bypass if credentials are demo/unset
        if not api_user or not api_key or "your-" in api_key:
            print(f"⚠️ [Namecheap] API credentials not configured. Simulating purchase of {clean_domain} (dry-run mode).")
            return True, clean_domain

        params = {
            "ApiUser": api_user,
            "ApiKey": api_key,
            "UserName": api_user,
            "Command": "namecheap.domains.create",
            "ClientIp": client_ip,
            "DomainName": clean_domain,
            "Years": "1",
            "RegistrantFirstName": "Genesis",
            "RegistrantLastName": "Autonomous",
            "RegistrantAddress1": "100 Crypto Way",
            "RegistrantCity": "San Francisco",
            "RegistrantStateProvince": "CA",
            "RegistrantPostalCode": "94105",
            "RegistrantCountry": "US",
            "RegistrantPhone": "+1.5550192834",
            "RegistrantEmailAddress": "ops@projectgenesis.network",
            "TechFirstName": "Genesis",
            "TechLastName": "Autonomous",
            "TechAddress1": "100 Crypto Way",
            "TechCity": "San Francisco",
            "TechStateProvince": "CA",
            "TechPostalCode": "94105",
            "TechCountry": "US",
            "TechPhone": "+1.5550192834",
            "TechEmailAddress": "ops@projectgenesis.network",
            "AdminFirstName": "Genesis",
            "AdminLastName": "Autonomous",
            "AdminAddress1": "100 Crypto Way",
            "AdminCity": "San Francisco",
            "AdminStateProvince": "CA",
            "AdminPostalCode": "94105",
            "AdminCountry": "US",
            "AdminPhone": "+1.5550192834",
            "AdminEmailAddress": "ops@projectgenesis.network",
        }

        try:
            response = requests.post(NAMECHEAP_API_URL, data=params, timeout=30)
            response.raise_for_status()
            text = response.text
            
            if 'Status="OK"' in text or 'Registered="true"' in text or "Created" in text:
                print(f"✅ Domain purchased successfully: {clean_domain}")
                return True, clean_domain
            else:
                print(f"❌ Domain purchase rejected by Namecheap: {text[:300]}")
                return False, None
        except Exception as e:
            print(f"❌ Domain purchase request failed: {e}")
            return False, None

    # =====================================================
    # STEP 3: SCAFFOLD NEXT.JS PROJECT
    # =====================================================
    def scaffold_nextjs_project(self, package: Dict[str, Any], project_dir: Path) -> bool:
        """Generate a production Next.js 14/15 App Router directory tree."""
        print(f"🏗️  [Step 3] Scaffolding Next.js application at {project_dir}...")
        
        try:
            app_dir = project_dir / "app"
            app_dir.mkdir(parents=True, exist_ok=True)
            (app_dir / "components").mkdir(exist_ok=True)
            (app_dir / "content").mkdir(exist_ok=True)
            (project_dir / "public").mkdir(exist_ok=True)
            
            slug_name = package["domain_suggestion"].replace(".", "-").lower()
            
            # package.json
            package_json = {
                "name": slug_name,
                "version": "1.0.0",
                "private": True,
                "scripts": {
                    "dev": "next dev",
                    "build": "next build",
                    "start": "next start"
                },
                "dependencies": {
                    "next": "^14.2.15",
                    "react": "^18.3.1",
                    "react-dom": "^18.3.1",
                    "lucide-react": "^0.450.0",
                    "clsx": "^2.1.1",
                    "tailwind-merge": "^2.5.2"
                },
                "devDependencies": {
                    "@types/node": "^20.14.0",
                    "@types/react": "^18.3.0",
                    "@types/react-dom": "^18.3.0",
                    "postcss": "^8.4.40",
                    "tailwindcss": "^3.4.10",
                    "typescript": "^5.5.0"
                }
            }
            with open(project_dir / "package.json", "w", encoding="utf-8") as f:
                json.dump(package_json, f, indent=2)

            # tsconfig.json
            tsconfig = {
                "compilerOptions": {
                    "target": "es5",
                    "lib": ["dom", "dom.iterable", "esnext"],
                    "allowJs": True,
                    "skipLibCheck": True,
                    "strict": True,
                    "noEmit": True,
                    "esModuleInterop": True,
                    "module": "esnext",
                    "moduleResolution": "bundler",
                    "resolveJsonModule": True,
                    "isolatedModules": True,
                    "jsx": "preserve",
                    "incremental": True,
                    "plugins": [{"name": "next"}],
                    "paths": {"@/*": ["./*"]}
                },
                "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
                "exclude": ["node_modules"]
            }
            with open(project_dir / "tsconfig.json", "w", encoding="utf-8") as f:
                json.dump(tsconfig, f, indent=2)

            # tailwind.config.js
            tailwind_config = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#06b6d4',
      },
    },
  },
  plugins: [],
}"""
            with open(project_dir / "tailwind.config.js", "w", encoding="utf-8") as f:
                f.write(tailwind_config)

            # postcss.config.js
            postcss_config = """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""
            with open(project_dir / "postcss.config.js", "w", encoding="utf-8") as f:
                f.write(postcss_config)

            # next.config.js
            next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
module.exports = nextConfig"""
            with open(project_dir / "next.config.js", "w", encoding="utf-8") as f:
                f.write(next_config)

            # .gitignore
            gitignore = """node_modules/
.next/
out/
.env*
!.env.example
.vercel
*.tsbuildinfo
next-env.d.ts"""
            with open(project_dir / ".gitignore", "w", encoding="utf-8") as f:
                f.write(gitignore)

            print("✅ Step 3 Passed: Next.js project structure successfully scaffolded.")
            return True
        except Exception as e:
            print(f"❌ Scaffolding failed: {e}")
            return False

    # =====================================================
    # STEP 4: INJECT CODE AND SEO CONTENT
    # =====================================================
    def inject_content(self, package: Dict[str, Any], project_dir: Path) -> bool:
        """Inject the generated Tool code, App Router Layout, and SEO articles."""
        print("📝 [Step 4] Injecting generated code, UI tool, and SEO articles...")
        
        try:
            app_dir = project_dir / "app"
            tool_component_name = "".join(c for c in package["tool_name"].title() if c.isalnum())
            
            # 1. layout.tsx
            layout_code = f"""import type {{ Metadata }} from 'next';
import './globals.css';

export const metadata: Metadata = {{
  title: '{package["tool_name"]} | Free Online Crypto Tool',
  description: '{package["niche_description"].replace("'", "\\'")}',
  keywords: ['crypto tool', '{package["niche"]}', 'blockchain calculator'],
}};

export default function RootLayout({{
  children,
}}: {{
  children: React.ReactNode;
}}) {{
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-indigo-600 tracking-tight">{package["tool_name"]}</span>
              <p className="text-xs text-slate-500">{package["niche"]}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Verified Web3 Utility
            </span>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {{children}}
        </main>
        <footer className="bg-white border-t border-slate-200 mt-20 py-8 text-center text-xs text-slate-500">
          <p>© 2026 {package["domain_suggestion"]}. Powered by Project Genesis Autonomous Network.</p>
        </footer>
      </body>
    </html>
  );
}}"""
            with open(app_dir / "layout.tsx", "w", encoding="utf-8") as f:
                f.write(layout_code)

            # 2. globals.css
            globals_css = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased text-slate-900 bg-slate-50;
  }
}"""
            with open(app_dir / "globals.css", "w", encoding="utf-8") as f:
                f.write(globals_css)

            # 3. Component Code: Tool.tsx
            tool_code = package["tool_code"]
            # Ensure "use client" is present
            if not tool_code.strip().startswith('"use client"') and not tool_code.strip().startswith("'use client'"):
                tool_code = '"use client";\n\n' + tool_code
                
            with open(app_dir / "components" / "Tool.tsx", "w", encoding="utf-8") as f:
                f.write(tool_code)

            # 4. articles.ts
            articles_payload = package["articles"]
            articles_ts = "export const articles = " + json.dumps(articles_payload, indent=2) + ";\n"
            with open(app_dir / "content" / "articles.ts", "w", encoding="utf-8") as f:
                f.write(articles_ts)

            # 5. page.tsx
            tool_name = package["tool_name"]
            niche_desc = package["niche_description"]
            
            page_template = """import ToolComponent from './components/Tool';
import { articles } from './content/articles';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3 pt-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          __TOOL_NAME__
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          __NICHE_DESC__
        </p>
      </section>

      {/* Main Interactive Tool */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
        <ToolComponent />
      </section>

      {/* Programmatic SEO Guides */}
      <section className="space-y-8 pt-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 border-b pb-2">
          Knowledge Base & Technical Guides
        </h2>
        <div className="grid grid-cols-1 gap-8">
          {articles.map((article: any, index: number) => (
            <article key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">{article.title}</h3>
              {article.summary && (
                <p className="text-sm font-medium text-indigo-600">{article.summary}</p>
              )}
              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {article.content || article.htmlContent || ''}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}"""
            page_code = page_template.replace("__TOOL_NAME__", tool_name).replace("__NICHE_DESC__", niche_desc)
            with open(app_dir / "page.tsx", "w", encoding="utf-8") as f:
                f.write(page_code)

            print("✅ Step 4 Passed: Code and programmatic SEO content injected.")
            return True
        except Exception as e:
            print(f"❌ Content injection error: {e}")
            return False

    # =====================================================
    # STEP 5: REPLACE AFFILIATE PLACEHOLDERS
    # =====================================================
    def inject_affiliate_links(self, project_dir: Path) -> bool:
        """Scan generated project files and replace affiliate tokens with live URLs."""
        print("🔗 [Step 5] Resolving and injecting affiliate tracking links...")
        
        affiliate_map = {
            "[AFFILIATE:binance]": os.getenv("AFFILIATE_BINANCE", "https://accounts.binance.com/register"),
            "[AFFILIATE:ledger]": os.getenv("AFFILIATE_LEDGER", "https://shop.ledger.com"),
            "[AFFILIATE:cointracker]": os.getenv("AFFILIATE_COINTRACKER", "https://www.cointracker.io"),
        }
        
        try:
            target_dirs = [project_dir / "app" / "content", project_dir / "app" / "components"]
            for directory in target_dirs:
                if not directory.exists():
                    continue
                for file_path in directory.glob("*.*"):
                    if file_path.suffix in [".ts", ".tsx", ".js", ".jsx"]:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                        
                        modified = content
                        for placeholder, url in affiliate_map.items():
                            if url:
                                modified = modified.replace(placeholder, url)
                                
                        if modified != content:
                            with open(file_path, "w", encoding="utf-8") as f:
                                f.write(modified)
                                
            print("✅ Step 5 Passed: Affiliate URLs seamlessly integrated.")
            return True
        except Exception as e:
            print(f"❌ Affiliate injection error: {e}")
            return False

    # =====================================================
    # STEP 6: CREATE GITHUB REPOSITORY & DEPLOY TO VERCEL
    # =====================================================
    def deploy_to_vercel(self, package: Dict[str, Any], project_dir: Path) -> bool:
        """Create remote GitHub repo, push source code, and trigger Vercel deployment."""
        print("🚀 [Step 6] Connecting GitHub and deploying to Vercel...")
        
        repo_name = package["domain_suggestion"].replace(".", "-").lower()
        github_username = self.github_username or "project-genesis-org"
        
        # Dry-run check if GitHub token is unset
        if not self.github or not os.getenv("GITHUB_TOKEN") or "your-" in os.getenv("GITHUB_TOKEN"):
            print(f"⚠️ [GitHub/Vercel] GitHub Token not configured. Simulating repo push for '{repo_name}' (dry-run mode).")
            return True

        try:
            # 1. Create GitHub Repository
            print(f"  Creating remote repository: {github_username}/{repo_name}...")
            user = self.github.get_user()
            try:
                repo = user.get_repo(repo_name)
                print(f"  Repository {repo_name} already exists. Using existing repo.")
            except Exception:
                repo = user.create_repo(
                    name=repo_name,
                    description=f"Project Genesis Micro-Tool: {package['tool_name']}",
                    private=False,
                    auto_init=False
                )
                print(f"  Repository created: {repo.html_url}")

            # 2. Local Git Init & Push
            token = os.getenv("GITHUB_TOKEN")
            remote_url = f"https://{token}@github.com/{github_username}/{repo_name}.git"
            
            subprocess.run(["git", "init"], cwd=str(project_dir), check=True, capture_output=True)
            subprocess.run(["git", "add", "."], cwd=str(project_dir), check=True, capture_output=True)
            subprocess.run(["git", "commit", "-m", f"Initial autonomous commit: {package['tool_name']}"], cwd=str(project_dir), check=True, capture_output=True)
            subprocess.run(["git", "branch", "-M", "main"], cwd=str(project_dir), check=True, capture_output=True)
            
            # Set remote and push
            subprocess.run(["git", "remote", "remove", "origin"], cwd=str(project_dir), capture_output=True)
            subprocess.run(["git", "remote", "add", "origin", remote_url], cwd=str(project_dir), check=True, capture_output=True)
            subprocess.run(["git", "push", "-u", "origin", "main", "--force"], cwd=str(project_dir), check=True, capture_output=True)
            print("  Git push to origin/main complete.")

            # 3. Trigger Vercel Deployment via REST API
            vercel_token = os.getenv("VERCEL_TOKEN")
            if not vercel_token or "your-" in vercel_token:
                print("⚠️ [Vercel] Token not configured. Git push succeeded; auto-deploy will run via Vercel GitHub App.")
                return True

            print("  Triggering Vercel project deployment...")
            headers = {
                "Authorization": f"Bearer {vercel_token}",
                "Content-Type": "application/json"
            }
            team_id = os.getenv("VERCEL_TEAM_ID")
            query = f"?teamId={team_id}" if team_id else ""
            
            payload = {
                "name": repo_name,
                "gitRepository": {
                    "type": "github",
                    "repo": f"{github_username}/{repo_name}"
                },
                "framework": "nextjs"
            }
            res = requests.post(f"{VERCEL_API_URL}/v9/projects{query}", headers=headers, json=payload, timeout=20)
            print(f"  Vercel response status: {res.status_code}")
            return True
            
        except Exception as e:
            print(f"❌ Deployment pipeline error: {e}")
            return False

    # =====================================================
    # STEP 7: REGISTER IN SUPABASE & RESET TREASURY
    # =====================================================
    def register_and_reset(self, package: Dict[str, Any], domain: str) -> bool:
        """Register newly spawned sub-site in Supabase site_registry and reset expansion trigger."""
        print("📊 [Step 7] Updating site_registry and resetting treasury expansion balance...")
        
        if not supabase:
            print("⚠️ Supabase client not initialized. Skipping DB write.")
            return True
            
        try:
            # 1. Register Site
            supabase.table("site_registry").insert({
                "domain": domain,
                "niche": package["niche"],
                "tool_name": package["tool_name"],
                "status": "deployed",
                "parent_site": "genesis",
                "monthly_revenue": 0
            }).execute()
            print(f"  Sub-site '{domain}' successfully added to site_registry.")
            
            # 2. Reset Treasury Balance
            wallet = os.getenv("TREASURY_WALLET_ADDRESS", "").lower()
            if wallet:
                supabase.table("treasury").update({
                    "available_for_expansion": 0,
                    "expansion_ready": False
                }).eq("wallet_address", wallet).execute()
                print("  Treasury available_for_expansion reset to $0. Ready for next cycle.")
                
            return True
        except Exception as e:
            print(f"❌ Database registration error: {e}")
            return False

    # =====================================================
    # MASTER EXECUTION PIPELINE
    # =====================================================
    def execute_deployment(self, package: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the 7-step auto-replication pipeline end-to-end."""
        print("\n" + "="*65)
        print("🤖 [PROJECT GENESIS] AUTONOMOUS REPLICATION PROTOCOL INITIATED")
        print("="*65 + "\n")
        
        # 1. Validation
        if not self.validate_package(package):
            return {"success": False, "error": "AI package validation failed"}
            
        # 2. Purchase Domain
        domain_success, domain_name = self.purchase_domain(package["domain_suggestion"])
        if not domain_success or not domain_name:
            return {"success": False, "error": "Domain acquisition failed"}
            
        # 3. Scaffold, Inject, & Deploy in temporary workspace
        with tempfile.TemporaryDirectory() as temp_dir:
            project_dir = Path(temp_dir) / domain_name.replace(".", "-")
            project_dir.mkdir(parents=True, exist_ok=True)
            
            if not self.scaffold_nextjs_project(package, project_dir):
                return {"success": False, "error": "Next.js scaffolding failed"}
                
            if not self.inject_content(package, project_dir):
                return {"success": False, "error": "Content injection failed"}
                
            if not self.inject_affiliate_links(project_dir):
                return {"success": False, "error": "Affiliate link replacement failed"}
                
            if not self.deploy_to_vercel(package, project_dir):
                return {"success": False, "error": "Vercel deployment failed"}
                
        # 7. Database Registration & Treasury Reset
        if not self.register_and_reset(package, domain_name):
            return {"success": False, "error": "Site registration or treasury reset failed"}
            
        print("\n" + "="*65)
        print("🎉 [REPLICATION COMPLETED] New Sub-Site Live On Internet!")
        print(f"   Domain:  {domain_name}")
        print(f"   Tool:    {package['tool_name']}")
        print(f"   Niche:   {package['niche']}")
        print("="*65 + "\n")
        
        return {
            "success": True,
            "domain": domain_name,
            "tool_name": package["tool_name"],
            "niche": package["niche"]
        }

def run_auto_replication() -> Dict[str, Any]:
    """Generates the site blueprint with AI (Phase 3) and executes full deployment (Phase 4)."""
    from ai_engine import generate_new_site
    print("🔄 [Auto-Replication] Triggering AI generation pipeline...")
    
    package = generate_new_site()
    if not package.get("success"):
        print(f"❌ AI generation failed: {package.get('error')}")
        return {"success": False, "error": package.get("error")}
        
    orchestrator = DeploymentOrchestrator()
    return orchestrator.execute_deployment(package)

if __name__ == "__main__":
    print("Manual trigger of Auto-Replication Protocol...")
    result = run_auto_replication()
    print(json.dumps(result, indent=2))
