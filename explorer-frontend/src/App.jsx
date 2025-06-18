"use client";

import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000";

const Triangle = ({ node, onClick, isSelected }) => {
  const size = 200 / (node.level + 1);
  const style = {
    border: isSelected ? "2px solid black" : "1px solid gray",
    padding: "8px",
    margin: "4px",
    cursor: "pointer",
    backgroundColor: isSelected ? "#f0f0f0" : "white",
    width: size,
    height: size,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
    borderRadius: 8,
    boxShadow: isSelected ? "0 0 10px rgba(0,0,0,0.3)" : "none",
    transition: "all 0.3s ease",
  };

  return (
    <div style={style} onClick={() => onClick(node)} title={`Level: ${node.level}, Index: ${node.index}`}>
      <div>
        <strong>Lvl:</strong> {node.level} <strong>Idx:</strong> {node.index}
      </div>
      <div>
        <strong>Hash:</strong> {node.hash.substring(0, 8)}...
      </div>
      <div>
        <strong>Txns:</strong> {node.transactions.length}
      </div>
    </div>
  );
};

const App = () => {
  const [ledger, setLedger] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [walletQuery, setWalletQuery] = useState("");
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [ledgerValid, setLedgerValid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchLedger();
    fetchLedgerValidity();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/ledger`);
      const data = await response.json();
      setLedger(data);
      setSelectedNode(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
      setErrorMsg("Failed to fetch ledger data.");
      setLoading(false);
    }
  };

  const fetchLedgerValidity = async () => {
    try {
      const response = await fetch(`${API_BASE}/verify`);
      const data = await response.json();
      setLedgerValid(data.valid);
    } catch (error) {
      console.error("Failed to verify ledger:", error);
      setLedgerValid(null);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const renderChildren = (node) => {
    if (!node.children || node.children.length === 0) return null;
    return (
      <div className="flex justify-center flex-wrap gap-2 mt-2">
        {node.children.map((child, idx) => (
          <Triangle
            key={idx}
            node={child}
            onClick={handleNodeClick}
            isSelected={selectedNode?.index === child.index && selectedNode?.level === child.level}
          />
        ))}
      </div>
    );
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!sender || !receiver || !amount) {
      setErrorMsg("Please fill all transaction fields.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg("Amount must be a positive number.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, receiver, amount: amt }),
      });
      if (!response.ok) {
        const errData = await response.json();
        setErrorMsg(errData.detail || "Failed to add transaction.");
        return;
      }
      await fetchLedger();
      setSender("");
      setReceiver("");
      setAmount("");
    } catch (error) {
      setErrorMsg("Failed to add transaction.");
    }
  };

  const handleWalletQuery = async () => {
    if (!walletQuery) return;
    try {
      const txResponse = await fetch(`${API_BASE}/transactions/${walletQuery}`);
      const txData = await txResponse.json();
      setWalletTransactions(txData.transactions || []);

      const balResponse = await fetch(`${API_BASE}/balance/${walletQuery}`);
      const balData = await balResponse.json();
      setWalletBalance(balData.balance);
    } catch (error) {
      setWalletTransactions([]);
      setWalletBalance(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">Fractal Ledger Explorer</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add Transaction</h2>
        <form onSubmit={handleAddTransaction} className="flex flex-col gap-4 max-w-md">
          <input
            type="text"
            placeholder="Sender Wallet Address"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="border border-gray-400 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Receiver Wallet Address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="border border-gray-400 rounded px-3 py-2"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-400 rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-black text-white rounded px-4 py-2 hover:bg-gray-800 transition"
          >
            Submit Transaction
          </button>
          {errorMsg && <p className="text-red-600 mt-2">{errorMsg}</p>}
        </form>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Query Wallet</h2>
        <div className="flex gap-4 max-w-md">
          <input
            type="text"
            placeholder="Wallet Address"
            value={walletQuery}
            onChange={(e) => setWalletQuery(e.target.value)}
            className="border border-gray-400 rounded px-3 py-2 flex-grow"
          />
          <button
            onClick={handleWalletQuery}
            className="bg-black text-white rounded px-4 py-2 hover:bg-gray-800 transition"
          >
            Query
          </button>
        </div>
        {walletBalance !== null && (
          <p className="mt-4 font-semibold">Balance: {walletBalance.toFixed(4)}</p>
        )}
        {walletTransactions.length > 0 && (
          <ul className="mt-4 max-w-md space-y-2">
            {walletTransactions.map((tx) => (
              <li key={tx.id} className="border p-2 rounded">
                <div><strong>Sender:</strong> {tx.sender}</div>
                <div><strong>Receiver:</strong> {tx.receiver}</div>
                <div><strong>Amount:</strong> {tx.amount}</div>
                <div><strong>Timestamp:</strong> {new Date(tx.timestamp * 1000).toLocaleString()}</div>
                <div><strong>Signature:</strong> {tx.signature}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ledger Visualization</h2>
        {loading ? (
          <p>Loading ledger...</p>
        ) : selectedNode ? (
          <div>
            <Triangle node={selectedNode} onClick={handleNodeClick} isSelected={true} />
            {renderChildren(selectedNode)}
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Transactions</h3>
              {selectedNode.transactions.length > 0 ? (
                <ul>
                  {selectedNode.transactions.map((tx) => (
                    <li key={tx.id} className="border p-2 my-2 rounded">
                      <div><strong>Sender:</strong> {tx.sender}</div>
                      <div><strong>Receiver:</strong> {tx.receiver}</div>
                      <div><strong>Amount:</strong> {tx.amount}</div>
                      <div><strong>Timestamp:</strong> {new Date(tx.timestamp * 1000).toLocaleString()}</div>
                      <div><strong>Signature:</strong> {tx.signature}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No transactions in this triangle.</p>
              )}
            </div>
          </div>
        ) : (
          <p>No ledger data available.</p>
        )}
        {ledgerValid !== null && (
          <p className={`mt-4 font-semibold ${ledgerValid ? "text-green-600" : "text-red-600"}`}>
            Ledger Integrity: {ledgerValid ? "Valid" : "Invalid"}
          </p>
        )}
      </section>
    </div>
  );
};

export default App;
