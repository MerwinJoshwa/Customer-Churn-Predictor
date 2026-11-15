import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { customerService } from '../services/customerService';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerForm } from '../components/customers/CustomerForm';
import { 
  Search, 
  Filter, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Users
} from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [contract, setContract] = useState('ALL');
  const [churnStatus, setChurnStatus] = useState('ALL');

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers(page, limit, search, contract, churnStatus);
      setCustomers(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, contract, churnStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setContract('ALL');
    setChurnStatus('ALL');
    setPage(1);
  };

  const handleCreateCustomer = async (data: Partial<Customer>) => {
    await customerService.createCustomer(data);
    fetchCustomers();
  };

  const handleUpdateCustomer = async (data: Partial<Customer>) => {
    if (!editingCustomer) return;
    await customerService.updateCustomer(editingCustomer.id, data);
    fetchCustomers();
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      await customerService.deleteCustomer(id);
      fetchCustomers();
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Customer Directory</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Search, filter, manage telecom subscribers, and trigger instant risk assessments
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Customer ID (e.g. 7590-VHVEG)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Contract Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Contract:</span>
            <select
              value={contract}
              onChange={(e) => {
                setContract(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-hidden"
            >
              <option value="ALL">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          {/* Churn Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>Status:</span>
            <select
              value={churnStatus}
              onChange={(e) => {
                setChurnStatus(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-hidden"
            >
              <option value="ALL">All Status</option>
              <option value="CHURNED">Churned (1)</option>
              <option value="RETAINED">Retained (0)</option>
              <option value="UNKNOWN">Unknown Outcome</option>
            </select>
          </div>

          {(search || contract !== 'ALL' || churnStatus !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-semibold text-slate-500">Querying database records...</p>
          </div>
        ) : (
          <>
            <CustomerTable
              customers={customers}
              onEdit={(cust) => {
                setEditingCustomer(cust);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteCustomer}
            />

            {/* Pagination footer */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                Showing {customers.length} of {total.toLocaleString()} total accounts (Page {page} of {totalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for Add / Edit */}
      <CustomerForm
        isOpen={isFormOpen}
        initialData={editingCustomer}
        title={editingCustomer ? `Edit Customer (${editingCustomer.customer_code})` : 'Register New Customer'}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
      />
    </div>
  );
};
