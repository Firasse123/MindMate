"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Filter,
  Search,
  ChevronDown,
  Grid,
  List,
  Loader2,
  Plus
} from "lucide-react";
import SheetCard from "..//../components/sheets/SheetCard";
import Navbar from "..//../components/Navbar"
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { getFilteredSheets,getAvailableDifficulties,getAvailableDomains } from "@/store/sheetStore";
// Custom hook for debounced search
const useDebounce = (value, delay) => {
const [debouncedValue, setDebouncedValue] = useState(value);
  
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SheetsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter metadata
  const [availableDomains, setAvailableDomains] = useState([]);
  const [availableDifficulties, setAvailableDifficulties] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const { token, isAuthenticated, isCheckingAuth, user, checkAuth } = useAuthStore();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (isAuthenticated && !user?.isVerified) {
        router.replace("/verify-email");
      }
    }
  }, [isAuthenticated, user, isCheckingAuth, router]);

  // Load filter metadata
  const loadFilterMetadata = useCallback(async () => {
    if (!token) return;
    
    setLoadingFilters(true);
    try{
    const [domainsRes, difficultiesRes] = await Promise.all([
  getAvailableDomains(),
  getAvailableDifficulties(),
]);
      setAvailableDomains(domainsRes.domains || []);
      setAvailableDifficulties(difficultiesRes.difficulties || []);
    } catch (error) {
      console.error('Error loading filter metadata:', error);
    } finally {
      setLoadingFilters(false);
    }
  }, [token]);

  // Load sheets with filters
  const loadSheets = useCallback(async (page = 1) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedDomain !== 'all') params.append('domain', selectedDomain);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await getFilteredSheets({
          page: page.toString(),
  limit: '20',
  ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
  ...(selectedDomain !== 'all' && { domain: selectedDomain }),
  ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty }),
  ...(sortBy && { sortBy })
});
      

      setSheets(response.sheets || []);
      setPagination(response.pagination || {});
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading sheets:', error);
      setSheets([]);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearchTerm, selectedDomain, selectedDifficulty, sortBy]);

  // Load data on component mount and token change
  useEffect(() => {
    if (token) {
      loadFilterMetadata();
      loadSheets(1);
    }
  }, [token, loadFilterMetadata, loadSheets]);

  // Reset to first page when filters change
  useEffect(() => {
    if (token) {
      loadSheets(1);
    }
  }, [debouncedSearchTerm, selectedDomain, selectedDifficulty, sortBy]);

  const handlePageChange = (newPage) => {
    loadSheets(newPage);
  };

  const handleCreateSheet = () => {
    router.push('/sheets/create');
  };

  const formatDomainName = (domain) => {
    return domain.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
 if (isCheckingAuth || !isAuthenticated || !user?.isVerified) {
    return null;
 }

  return (
    <>
      {/* Fixed Full-Screen Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(15, 23, 42, 1) 0%,
              rgba(30, 58, 138, 0.3) 25%,
              rgba(79, 70, 229, 0.2) 50%,
              rgba(168, 85, 247, 0.2) 75%,
              rgba(15, 23, 42, 1) 100%
            )
          `
        }}
      >
        {/* Animated Elements */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl animate-pulse animation-delay-500"></div>
      </div>

      {/* Main Page Content */}
      <div className="relative z-10" style={{ minHeight: '100vh' }}>
        
        {/* Navbar */}
        <Navbar />

        {/* Page Content Wrapper */}
        <div style={{ minHeight: 'calc(100vh - 80px)' }}>
          
          {/* Hero Section */}
          <div className="text-center py-16 px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your Study Universe
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Discover, organize, and master your AI-powered study materials in one beautiful space
            </p>
          </div>

          {/* Main Container */}
          <div className="container mx-auto px-6 pb-12">
            
            {/* Controls Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search your sheets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  {debouncedSearchTerm !== searchTerm && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* Create Sheet Button */}
                  <button
                    onClick={handleCreateSheet}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Sheet
                  </button>

                  {/* View Toggle */}
                  <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "grid"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filters */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                      showFilters
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                    }`}
                    disabled={loadingFilters}
                  >
                    {loadingFilters ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Filter className="w-4 h-4" />
                    )}
                    Filters
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-slate-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Domain Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Domain
                        {loadingFilters && <Loader2 className="inline w-3 h-3 ml-1 animate-spin" />}
                      </label>
                      <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        disabled={loadingFilters}
                      >
                        <option value="all">All Domains</option>
                        {availableDomains.map((domain) => (
                          <option key={domain} value={domain}>
                            {formatDomainName(domain)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Difficulty
                        {loadingFilters && <Loader2 className="inline w-3 h-3 ml-1 animate-spin" />}
                      </label>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        disabled={loadingFilters}
                      >
                        <option value="all">All Levels</option>
                        {availableDifficulties.map((difficulty) => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="title">Title A-Z</option>
                        <option value="quality">Quality Score</option>
                      </select>
                    </div>
                  </div>

            
                </div>
              )}
            </div>

            {/* Results Summary & Pagination */}
            {!loading && sheets.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <p className="text-slate-400">
                  Showing <span className="text-white font-medium">{sheets.length}</span> of{" "}
                  <span className="text-white font-medium">{pagination.totalCount || 0}</span> sheets
                  {debouncedSearchTerm && (
                    <span className="ml-2 text-blue-400">
                      for "{debouncedSearchTerm}"
                    </span>
                  )}
                </p>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev || loading}
                      className="px-3 py-1 text-sm bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-300 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    
                    <span className="text-slate-400 text-sm">
                      Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext || loading}
                      className="px-3 py-1 text-sm bg-slate-800/50 border border-slate-700/50 rounded-md text-slate-300 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Content Area */}
            <div style={{ minHeight: '400px' }}>
              {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading your sheets...</p>
                  </div>
                </div>
              ) : sheets.length > 0 ? (
                <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                  {sheets.map((sheet) => (
                    <SheetCard key={sheet._id} sheet={sheet} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {pagination.totalCount === 0 ? "No sheets yet" : "No matching sheets"}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {pagination.totalCount === 0 
                        ? "Create your first study sheet to get started on your learning journey"
                        : "Try adjusting your search or filter criteria to find what you're looking for"}
                    </p>
                    {pagination.totalCount === 0 && (
                      <button 
                        onClick={handleCreateSheet}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                      >
                        Create Your First Sheet
                      </button>
                    )}
                    {pagination.totalCount > 0 && (
                      <button 
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedDomain("all");
                          setSelectedDifficulty("all");
                        }}
                        className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-lg hover:border-slate-600 transition-all"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
};

export default SheetsPage;