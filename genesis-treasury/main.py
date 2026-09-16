import os
import asyncio
from contextlib import asynccontextmanager
from decimal import Decimal
from fastapi import FastAPI, HTTPException
from web3 import AsyncWeb3
from web3.providers.async_rpc import AsyncHTTPProvider
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# --- INITIALIZATION & CONFIGURATION ---
POLYGON_RPC_URL = os.getenv("POLYGON_RPC_URL", "https://polygon-rpc.com")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TREASURY_WALLET = os.getenv("TREASURY_WALLET_ADDRESS", "").lower()
USDT_CONTRACT = os.getenv("USDT_CONTRACT_ADDRESS", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F")
EXPANSION_THRESHOLD = 1000.0  # $1,000 USDT threshold
MAX_BLOCK_BATCH = int(os.getenv("MAX_BLOCK_BATCH_SIZE", "2000"))

# Initialize clients
w3 = AsyncWeb3(AsyncHTTPProvider(POLYGON_RPC_URL))
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if (SUPABASE_URL and SUPABASE_KEY) else None

# Minimal ERC-20 Transfer Event ABI
USDT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "from", "type": "address"},
            {"indexed": True, "name": "to", "type": "address"},
            {"indexed": False, "name": "value", "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    }
]
usdt_contract = w3.eth.contract(address=w3.to_checksum_address(USDT_CONTRACT), abi=USDT_ABI)

# --- CORE BLOCKCHAIN SCANNING ENGINE ---
async def scan_blockchain_batch():
    """Scans a batch of blocks for USDT transfers to the treasury wallet."""
    if not supabase or not TREASURY_WALLET:
        print("⚠️ Supabase or Treasury Wallet address not configured. Skipping scan.")
        return

    # 1. Fetch current recorded block from Supabase
    treasury_res = supabase.table("treasury").select("last_checked_block").eq("wallet_address", TREASURY_WALLET).execute()
    
    if not treasury_res.data:
        # Initialize treasury record if not present
        supabase.table("treasury").insert({
            "wallet_address": TREASURY_WALLET,
            "total_usdt_earned": 0,
            "available_for_expansion": 0,
            "expansion_ready": False,
            "last_checked_block": await w3.eth.block_number
        }).execute()
        last_block = await w3.eth.block_number
    else:
        last_block = treasury_res.data[0]["last_checked_block"]

    # First run fallback: start at current block
    current_block = await w3.eth.block_number
    if last_block == 0 or last_block > current_block:
        last_block = current_block

    if current_block <= last_block:
        return

    # Batch chunking to avoid RPC query range limits
    to_block = min(current_block, last_block + MAX_BLOCK_BATCH)

    # Filter logs specifically for USDT Transfer events to our wallet
    transfer_topic = w3.keccak(text="Transfer(address,address,uint256)").to_0x_hex()
    padded_recipient = f"0x000000000000000000000000{TREASURY_WALLET[2:]}"

    transfer_filter = {
        "fromBlock": last_block + 1,
        "toBlock": to_block,
        "address": w3.to_checksum_address(USDT_CONTRACT),
        "topics": [
            transfer_topic,
            None,              # 'from' address
            padded_recipient   # 'to' address (padded)
        ]
    }

    logs = await w3.eth.get_logs(transfer_filter)

    for log in logs:
        tx_hash = log["transactionHash"].to_0x_hex()
        from_addr = "0x" + log["topics"][1].to_0x_hex()[-40:]
        
        # Parse transfer event
        parsed_event = usdt_contract.events.Transfer().process_log(log)
        raw_amount = parsed_event["args"]["value"]
        
        # USDT has 6 decimals on Polygon
        amount_usdt = float(Decimal(raw_amount) / Decimal(10**6))
        block_num = log["blockNumber"]

        print(f"💰 INCOMING USDT: +${amount_usdt:.2f} from {from_addr} | Tx: {tx_hash}")

        # Idempotent insert into transactions log
        try:
            supabase.table("transactions").insert({
                "tx_hash": tx_hash,
                "from_address": from_addr,
                "amount_usdt": amount_usdt,
                "block_number": block_num
            }).execute()
        except Exception as insert_err:
            print(f"ℹ️ Transaction {tx_hash} already recorded: {insert_err}")

        # Update Treasury Totals in Supabase
        treasury_row = supabase.table("treasury").select("*").eq("wallet_address", TREASURY_WALLET).execute().data[0]
        new_total = float(treasury_row["total_usdt_earned"]) + amount_usdt
        new_available = float(treasury_row["available_for_expansion"]) + amount_usdt
        is_ready = new_available >= EXPANSION_THRESHOLD

        supabase.table("treasury").update({
            "total_usdt_earned": new_total,
            "available_for_expansion": new_available,
            "expansion_ready": is_ready,
            "last_checked_block": to_block
        }).eq("wallet_address", TREASURY_WALLET).execute()

        if is_ready:
            print(f"🚨 [EXPANSION TRIGGER ACTIVATED] Available Balance: ${new_available:.2f} >= ${EXPANSION_THRESHOLD:.2f}")
            try:
                import threading
                from deployment import run_auto_replication
                print("🚀 [Master Orchestrator] Spawning Auto-Replication Protocol in background thread...")
                thread = threading.Thread(target=run_auto_replication, daemon=True)
                thread.start()
            except Exception as repl_err:
                print(f"❌ Failed to spawn replication thread: {repl_err}")

    # If no logs in this batch, progress block pointer
    if not logs:
        supabase.table("treasury").update({
            "last_checked_block": to_block
        }).eq("wallet_address", TREASURY_WALLET).execute()

# --- CONTINUOUS BACKGROUND POLLER ---
async def listen_for_usdt():
    """Continuously polls the blockchain for incoming USDT transfers."""
    print("🚀 Treasury Autonomous Listener Started. Monitoring Polygon network for USDT...")
    while True:
        try:
            await scan_blockchain_batch()
            await asyncio.sleep(12)  # Polygon block time is ~2s, polling every 12s avoids rate limits
        except Exception as e:
            print(f"❌ Error in listener cycle: {e}")
            await asyncio.sleep(10)

# --- FASTAPI APPLICATION & ENDPOINTS ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(listen_for_usdt())
    yield
    task.cancel()

app = FastAPI(
    title="Project Genesis Treasury",
    description="Autonomous Web3 treasury service for monitoring USDT affiliate inflows and triggering replication protocols.",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Project Genesis Autonomous Treasury",
        "network": "Polygon",
        "currency": "USDT",
        "threshold": EXPANSION_THRESHOLD
    }

@app.get("/treasury/status")
def get_treasury_status():
    """Returns current treasury state, total earned, and expansion readiness."""
    if not supabase or not TREASURY_WALLET:
        raise HTTPException(status_code=500, detail="Supabase or Treasury Wallet not configured.")
    data = supabase.table("treasury").select("*").eq("wallet_address", TREASURY_WALLET).execute()
    if not data.data:
        raise HTTPException(status_code=404, detail="Treasury record not found.")
    return data.data[0]

@app.post("/treasury/reset-expansion")
def reset_expansion():
    """Invoked by Phase 4 orchestration after sub-site domain purchase and deployment."""
    if not supabase or not TREASURY_WALLET:
        raise HTTPException(status_code=500, detail="Supabase or Treasury Wallet not configured.")
    
    supabase.table("treasury").update({
        "available_for_expansion": 0,
        "expansion_ready": False
    }).eq("wallet_address", TREASURY_WALLET).execute()
    
    return {
        "status": "success",
        "message": "Expansion counter reset to $0. Ready for next replication cycle."
    }

@app.post("/ai/generate-site")
def trigger_ai_generation():
    """Manually trigger the LangGraph multi-agent system to synthesize a new niche, tool, and SEO suite."""
    from ai_engine import generate_new_site
    result = generate_new_site()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "AI generation failed"))
    return result

@app.post("/deployment/trigger-replication")
def trigger_replication_manually():
    """Manually trigger the full Auto-Replication Protocol (Phase 3 AI + Phase 4 Deployment)."""
    from deployment import run_auto_replication
    result = run_auto_replication()
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Auto-replication failed"))
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
