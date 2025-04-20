import React, { useEffect, useState } from 'react';
import {
  getAllTransactions,
  createTransaction,
  deleteTransaction,
  Transaction,
  getAllCategories,
  Category
} from '../services/budgetbuddy';

import { useAuthContext } from '../context/AuthContext';

const BudgetBuddyApp: React.FC = () => {
  const { user } = useAuthContext();
  const userId = user?.id;
  if (!userId) {
    return <div>Please log in to use BudgetBuddy.</div>;
  }
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const txRes = await getAllTransactions(userId);
    setTransactions(txRes.data);
    const catRes = await getAllCategories(userId);
    setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTransaction({
      user_id: userId,
      amount: parseFloat(amount),
      category_id: categoryId,
      date,
      description: desc
    });
    setAmount('');
    setCategoryId('');
    setDate('');
    setDesc('');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    fetchData();
  };

  return (
    <div>
      <h2>BudgetBuddy</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description"
        />
        <button type="submit">Add Transaction</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.amount}</td>
                <td>{categories.find(cat => cat.id === tx.category_id)?.name || tx.category_id}</td>
                <td>{tx.date}</td>
                <td>{tx.description}</td>
                <td>
                  <button onClick={() => tx.id && handleDelete(tx.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BudgetBuddyApp;
