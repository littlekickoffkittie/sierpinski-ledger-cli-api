import argparse
import json
import os
import logging
from triangular_ledger.sierpinski_ledger import SierpinskiLedger, create_transaction, sign_transaction

LEDGER_STATE_FILE = "ledger_state.json"

# Configure logging
logger = logging.getLogger("cli")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

def save_ledger_state(ledger: SierpinskiLedger):
    data = ledger.to_dict()
    with open(LEDGER_STATE_FILE, "w") as f:
        json.dump(data, f, indent=2)
    logger.info(f"Ledger state saved to {LEDGER_STATE_FILE}")

def load_ledger_state(ledger: SierpinskiLedger):
    if os.path.exists(LEDGER_STATE_FILE):
        with open(LEDGER_STATE_FILE, "r") as f:
            data = json.load(f)
            ledger.load_from_dict(data)
        logger.info(f"Ledger state loaded from {LEDGER_STATE_FILE}")

def add_transaction(ledger: SierpinskiLedger, sender: str, receiver: str, amount: float):
    tx = create_transaction(sender, receiver, amount)
    tx = sign_transaction(tx, private_key=sender)
    ledger.add_transactions([tx])
    logger.info(f"Transaction added and signed: {tx.get('id', 'unknown')}")
    save_ledger_state(ledger)

def query_transactions(ledger: SierpinskiLedger, wallet: str):
    txs = ledger.query_transactions_by_wallet(wallet)
    if txs:
        logger.info(f"Transactions found for wallet {wallet}: {len(txs)}")
        print(f"Transactions involving {wallet}:")
        for tx in txs:
            print(json.dumps(tx, indent=2))
    else:
        logger.info(f"No transactions found for wallet {wallet}")
        print("No transactions found.")

def get_balance(ledger: SierpinskiLedger, wallet: str):
    balance = ledger.get_wallet_balance(wallet)
    logger.info(f"Balance for wallet {wallet}: {balance}")
    print(f"Balance of {wallet}: {balance}")

def verify_ledger(ledger: SierpinskiLedger):
    valid = ledger.verify_ledger()
    logger.info(f"Ledger verification result: {valid}")
    print(f"Ledger valid: {valid}")

def visualize_ledger(ledger: SierpinskiLedger):
    logger.info("Visualizing ledger structure")
    print("Ledger structure:")
    ledger.visualize_ledger()

def export_ledger(ledger: SierpinskiLedger, filename: str):
    data = ledger.to_dict()
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    logger.info(f"Ledger exported to {filename}")
    print(f"Ledger exported to {filename}")

def import_ledger(ledger: SierpinskiLedger, filename: str):
    if os.path.exists(filename):
        with open(filename, "r") as f:
            data = json.load(f)
            ledger.load_from_dict(data)
        logger.info(f"Ledger imported from {filename}")
        print(f"Ledger imported from {filename}")
    else:
        logger.error(f"File {filename} does not exist.")
        print(f"File {filename} does not exist.")

def main():
    parser = argparse.ArgumentParser(description="Sierpinski Ledger CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    parser_add = subparsers.add_parser("add-transaction", help="Add a transaction")
    parser_add.add_argument("--sender", required=True, help="Sender wallet address")
    parser_add.add_argument("--receiver", required=True, help="Receiver wallet address")
    parser_add.add_argument("--amount", type=float, required=True, help="Amount to transfer")

    parser_query = subparsers.add_parser("query-transactions", help="Query transactions by wallet")
    parser_query.add_argument("--wallet", required=True, help="Wallet address to query")

    parser_balance = subparsers.add_parser("get-balance", help="Get wallet balance")
    parser_balance.add_argument("--wallet", required=True, help="Wallet address to get balance")

    parser_verify = subparsers.add_parser("verify-ledger", help="Verify ledger integrity")

    parser_visualize = subparsers.add_parser("visualize-ledger", help="Visualize ledger structure")

    parser_export = subparsers.add_parser("export-ledger", help="Export ledger to JSON file")
    parser_export.add_argument("--file", required=True, help="Filename to export ledger")

    parser_import = subparsers.add_parser("import-ledger", help="Import ledger from JSON file")
    parser_import.add_argument("--file", required=True, help="Filename to import ledger from")

    parser_create_wallet = subparsers.add_parser("create-wallet", help="Create a new fractal wallet address")
    parser_create_wallet.add_argument("--level", type=int, default=0, help="Fractal level (default: 0)")
    parser_create_wallet.add_argument("--index", type=int, default=0, help="Fractal index (default: 0)")

    parser_founder_onboarding = subparsers.add_parser("founder-onboarding", help="Perform founder onboarding (only once)")

    parser_standard_onboarding = subparsers.add_parser("standard-onboarding", help="Perform standard onboarding for new users")

    args = parser.parse_args()

    ledger = SierpinskiLedger()
    load_ledger_state(ledger)

    if args.command == "add-transaction":
        add_transaction(ledger, args.sender, args.receiver, args.amount)
    elif args.command == "query-transactions":
        query_transactions(ledger, args.wallet)
    elif args.command == "get-balance":
        get_balance(ledger, args.wallet)
    elif args.command == "verify-ledger":
        verify_ledger(ledger)
    elif args.command == "visualize-ledger":
        visualize_ledger(ledger)
    elif args.command == "export-ledger":
        export_ledger(ledger, args.file)
    elif args.command == "import-ledger":
        import_ledger(ledger, args.file)
    elif args.command == "create-wallet":
        wallet_address = generate_fractal_wallet_address(args.level, args.index)
        print(f"Generated wallet address: {wallet_address}")
    elif args.command == "founder-onboarding":
        try:
            result = ledger.founder_onboarding()
            print(result["message"])
            print(f"Foundational wallet: {result['foundational_wallet']}")
        except Exception as e:
            print(f"Error: {e}")
    elif args.command == "standard-onboarding":
        result = ledger.standard_onboarding()
        print(result["message"])
        print(f"New wallet: {result['wallet']}")
        print(f"Initial balance: {result['initial_balance']}")

if __name__ == "__main__":
    main()
