import os
import json
import re
from typing import TypedDict, List, Dict, Any, Optional
from dotenv import load_dotenv
from pydantic import BaseModel
from supabase import create_client, Client

load_dotenv()

# --- INITIALIZATION & MODEL ROUTING ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY) if (SUPABASE_URL and SUPABASE_KEY) else None

def get_strategist_llm():
    from langchain_openai import ChatOpenAI
    model = os.getenv("AI_MODEL_STRATEGIST", "gpt-4o")
    return ChatOpenAI(model=model, temperature=0.8)

def get_coder_llm():
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key and anthropic_key.startswith("sk-ant"):
        from langchain_anthropic import ChatAnthropic
        model = os.getenv("AI_MODEL_CODER", "claude-3-5-sonnet-20241022")
        return ChatAnthropic(model=model, temperature=0.2)
    else:
        # Graceful fallback to OpenAI if Anthropic key is not configured
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model=os.getenv("AI_MODEL_STRATEGIST", "gpt-4o"), temperature=0.2)

def get_content_llm():
    from langchain_openai import ChatOpenAI
    model = os.getenv("AI_MODEL_CONTENT", "gpt-4o")
    return ChatOpenAI(model=model, temperature=0.7)

# --- STATE DEFINITION ---
class AgentState(TypedDict):
    existing_niches: List[str]
    new_niche: str
    niche_description: str
    tool_name: str
    tool_spec: str
    tool_code: str
    articles: List[Dict[str, str]]
    domain_suggestion: str
    error: str

# Helper to extract clean JSON from LLM markdown responses
def extract_json_payload(raw_content: str) -> Any:
    cleaned = raw_content.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()
    
    # Locate outermost bracket or brace if conversational fluff surrounds it
    first_brace = cleaned.find("{")
    first_bracket = cleaned.find("[")
    
    if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
        last_brace = cleaned.rfind("}")
        if last_brace != -1:
            cleaned = cleaned[first_brace : last_brace + 1]
    elif first_bracket != -1:
        last_bracket = cleaned.rfind("]")
        if last_bracket != -1:
            cleaned = cleaned[first_bracket : last_bracket + 1]

    return json.loads(cleaned)

# --- AGENT 1: THE STRATEGIST ---
def strategist_node(state: AgentState) -> AgentState:
    """Brainstorms an untapped, hyper-specific crypto niche and brandable domain."""
    print("🧠 [Strategist] Analyzing market gaps and existing registry...")
    
    existing = state.get("existing_niches", [])
    existing_str = ", ".join(existing) if existing else "None yet (this is the genesis node)"
    
    prompt = f"""You are an elite crypto market strategist and programmatic SEO architect.
Your job is to find a HYPER-SPECIFIC, high-search-intent, underserved niche in crypto that solves a real operational problem.

EXISTING NICHES ALREADY COVERED (DO NOT DUPLICATE):
{existing_str}

REQUIREMENTS:
- Narrow enough to dominate organic search (e.g., "DeFi Liquidity Impairment Loss & Yield Tax", "Ethereum Restaking APY & Slashing Risk Estimator", "NFT Royalty & Secondary Sales Tax Calculator", "Crypto Staking 1099-MISC Income Estimator")
- High affiliate monetization potential (crypto tax software, specialized hardware wallets, institutional DEXs)
- Must be deliverable via an interactive web tool (calculator, tracker, simulator)

Respond ONLY with valid JSON in this exact structure:
{{
  "niche": "The specific niche title",
  "description": "2-3 sentences explaining the user pain point and why this tool is needed",
  "domain_suggestion": "A short, brandable .com or .io domain suggestion (lowercase, letters only, no hyphens, max 16 chars)"
}}"""
    
    try:
        llm = get_strategist_llm()
        response = llm.invoke(prompt)
        data = extract_json_payload(response.content)
        return {
            **state,
            "new_niche": data["niche"],
            "niche_description": data["description"],
            "domain_suggestion": data.get("domain_suggestion", "cryptotool.com").lower()
        }
    except Exception as e:
        print(f"❌ [Strategist Error]: {e}")
        return {**state, "error": f"Strategist failed: {str(e)}"}

# --- AGENT 2: THE ARCHITECT ---
def architect_node(state: AgentState) -> AgentState:
    """Designs the functional specification and exact mathematical formulas for the tool."""
    if state.get("error"):
        return state
        
    print(f"🏗️  [Architect] Designing functional spec for: {state['new_niche']}...")
    
    prompt = f"""You are a principal Web3 product architect and quantitative financial engineer.

TARGET NICHE: {state["new_niche"]}
PROBLEM CONTEXT: {state["niche_description"]}

Design an INTERACTIVE, high-utility web tool for this exact niche.
The tool must:
1. Define 3-5 intuitive user inputs (with sensible default numbers and field labels).
2. Define the exact mathematical formulas and edge-case handling.
3. Define the key outputs, metric summary cards, and visual feedback (ROI, tax liabilities, thresholds).
4. Be implementable as a clean, single-file Next.js React component using Tailwind CSS and shadcn/ui.

Respond ONLY with valid JSON in this exact structure:
{{
  "tool_name": "Concise, descriptive name (e.g., 'Impermanent Loss & Yield Tax Calculator')",
  "tool_spec": "Comprehensive specification detailing inputs, formula step-by-step, formulas for net values, edge cases (zero division, negative profit), and output metrics."
}}"""
    
    try:
        llm = get_strategist_llm()
        response = llm.invoke(prompt)
        data = extract_json_payload(response.content)
        return {
            **state,
            "tool_name": data["tool_name"],
            "tool_spec": data["tool_spec"]
        }
    except Exception as e:
        print(f"❌ [Architect Error]: {e}")
        return {**state, "error": f"Architect failed: {str(e)}"}

# --- AGENT 3: THE CODER ---
def coder_node(state: AgentState) -> AgentState:
    """Writes the complete, production-ready Next.js / React component code."""
    if state.get("error"):
        return state
        
    print(f"💻 [Coder] Writing production Next.js component for {state['tool_name']}...")
    
    prompt = f"""You are a principal full-stack Web3 engineer. Write a COMPLETE, RUNNABLE, PRODUCTION-GRADE React component in TypeScript for Next.js App Router.

TOOL NAME: {state["tool_name"]}
NICHE: {state["new_niche"]}
SPECIFICATION & MATH: {state["tool_spec"]}

STRICT REQUIREMENTS:
- Use "use client"; directive at the very top.
- Include all necessary React hooks (useState, useMemo).
- Style entirely with Tailwind CSS utility classes (responsive grid, sleek dark/light design).
- Build accessible UI cards with standard elements: clean number inputs, dropdowns/selects, result highlight badges, breakdown tables, and a 'Copy Report' or 'Export' button.
- Integrate a contextual affiliate callout box recommending CoinTracker / Koinly (tax automation) or Binance / Bybit (trading) with a clear CTA button.
- Do not import missing custom hooks. Keep the component fully self-contained.
- Use Lucide React icons (e.g., Calculator, TrendingUp, TrendingDown, Copy, Check, ArrowRight, ShieldCheck, Sparkles).
- Export as default function ToolComponent().

OUTPUT FORMAT:
Return ONLY the raw TypeScript React code block. Start with ```tsx and end with ```."""
    
    try:
        llm = get_coder_llm()
        response = llm.invoke(prompt)
        content = response.content
        
        # Clean extracted code
        if "```tsx" in content:
            code = content.split("```tsx")[1].split("```")[0].strip()
        elif "```typescript" in content:
            code = content.split("```typescript")[1].split("```")[0].strip()
        elif "```" in content:
            code = content.split("```")[1].split("```")[0].strip()
        else:
            code = content.strip()
            
        return {**state, "tool_code": code}
    except Exception as e:
        print(f"❌ [Coder Error]: {e}")
        return {**state, "error": f"Coder failed: {str(e)}"}

# --- AGENT 4: THE CONTENT WRITER ---
def content_node(state: AgentState) -> AgentState:
    """Generates 3 in-depth programmatic SEO articles supporting the tool."""
    if state.get("error"):
        return state
        
    print(f"📝 [Content Writer] Generating 3 technical SEO articles for {state['new_niche']}...")
    
    prompt = f"""You are a world-class technical SEO strategist and crypto tax researcher.

NICHE: {state["new_niche"]}
TOOL NAME: {state["tool_name"]}
CONTEXT: {state["niche_description"]}

Write THREE comprehensive, authoritative markdown articles (800-1200 words each) designed to rank on Google for transactional and informational search queries surrounding this tool.

ARTICLE 1: "The Ultimate Guide" - Definitive breakdown of the concepts, tax codes, mathematical models, and common pitfalls.
ARTICLE 2: "Step-by-Step Tutorial" - Practical workflow using the '{state["tool_name"]}' to solve the problem and maintain compliance.
ARTICLE 3: "Optimization & Strategy" - Advanced tactics, comparison of accounting methods (FIFO vs LIFO vs Specific ID), and tax reduction strategies.

SEO REQUIREMENTS:
- Proper Markdown heading hierarchy (H1, H2, H3).
- Naturally integrate the interactive tool into the copy.
- Embed 2-3 affiliate placeholders per article formatted as [AFFILIATE:cointracker] or [AFFILIATE:binance] or [AFFILIATE:ledger].
- High information density, concrete examples, and zero fluff.

OUTPUT FORMAT:
Return ONLY a valid JSON array of 3 objects in this exact structure:
[
  {{
    "title": "SEO Optimized Article Title",
    "slug": "seo-friendly-url-slug",
    "summary": "Brief 150-char meta description",
    "content": "Full markdown content of the article..."
  }}
]"""
    
    try:
        llm = get_content_llm()
        response = llm.invoke(prompt)
        articles = extract_json_payload(response.content)
        return {**state, "articles": articles}
    except Exception as e:
        print(f"❌ [Content Writer Error]: {e}")
        return {**state, "error": f"Content writer failed: {str(e)}"}

# --- COMPOSE THE LANGGRAPH PIPELINE ---
def create_agent_workflow():
    """Builds and compiles the 4-agent LangGraph workflow."""
    from langgraph.graph import StateGraph, END
    
    workflow = StateGraph(AgentState)
    
    # Register agent nodes
    workflow.add_node("strategist", strategist_node)
    workflow.add_node("architect", architect_node)
    workflow.add_node("coder", coder_node)
    workflow.add_node("content", content_node)
    
    # Define linear execution chain
    workflow.set_entry_point("strategist")
    workflow.add_edge("strategist", "architect")
    workflow.add_edge("architect", "coder")
    workflow.add_edge("coder", "content")
    workflow.add_edge("content", END)
    
    return workflow.compile()

# --- MAIN ORCHESTRATOR ENTRYPOINT ---
def generate_new_site() -> Dict[str, Any]:
    """
    Executes the multi-agent engine to produce a complete site blueprint:
    Niche specification, Domain suggestion, Component Code, and SEO articles.
    """
    print("🚀 [Project Genesis] Initializing AI Generation Engine...")
    
    # 1. Fetch already deployed niches to ensure zero cannibalization or duplicate sites
    existing_niches: List[str] = []
    if supabase:
        try:
            res = supabase.table("site_registry").select("niche").execute()
            if res.data:
                existing_niches = [item["niche"] for item in res.data if "niche" in item]
        except Exception as e:
            print(f"⚠️ Could not fetch existing niches from Supabase: {e}")
            
    # 2. Build initial state
    initial_state: AgentState = {
        "existing_niches": existing_niches,
        "new_niche": "",
        "niche_description": "",
        "tool_name": "",
        "tool_spec": "",
        "tool_code": "",
        "articles": [],
        "domain_suggestion": "",
        "error": ""
    }
    
    # 3. Execute LangGraph flow
    pipeline = create_agent_workflow()
    final_state = pipeline.invoke(initial_state)
    
    # 4. Handle pipeline outcome
    if final_state.get("error"):
        return {
            "success": False,
            "error": final_state["error"]
        }
        
    return {
        "success": True,
        "niche": final_state["new_niche"],
        "niche_description": final_state["niche_description"],
        "domain_suggestion": final_state["domain_suggestion"],
        "tool_name": final_state["tool_name"],
        "tool_code": final_state["tool_code"],
        "articles": final_state["articles"]
    }

if __name__ == "__main__":
    print("Executing manual test of AI Generation Engine...")
    result = generate_new_site()
    
    if result.get("success"):
        print("\n✨ Site Generation Complete!")
        print(f"Niche: {result['niche']}")
        print(f"Domain: {result['domain_suggestion']}")
        print(f"Tool: {result['tool_name']}")
        print(f"Articles Generated: {len(result['articles'])}")
        
        output_file = "generated_site_package.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)
        print(f"📁 Blueprint saved to {output_file}")
    else:
        print(f"\n❌ Pipeline execution failed: {result.get('error')}")
