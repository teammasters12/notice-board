import React, { useState, useEffect } from 'react';
import { Heart, Download, Search, Plus, Edit2, Trash2, EyeOff, Eye, X, Calendar, File, Bell, Sparkles, Zap, Upload, RefreshCw } from 'lucide-react';

const NoticeBoard = () => {
  const [view, setView] = useState('visitor');
  const [notices, setNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
    attachmentName: '',
    imageUrl: ''
  });

  const categories = ['Exam', 'Event', 'Announcement', 'General'];
  const ADMIN_PASSWORD = 'cdc2024';

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const result = await window.storage.get('bc_notices', true);
      if (result) {
        setNotices(JSON.parse(result.value));
      } else {
        const sampleNotices = [
          {
            id: Date.now(),
            title: 'Mid-Term Examination Schedule 2025',
            description: 'Mid-term examinations will be held from January 15-20, 2025. All students must report to their respective examination halls 15 minutes before the scheduled time.',
            category: 'Exam',
            date: '2025-01-10',
            reactions: 24,
            visible: true,
            attachmentName: 'exam_schedule.pdf',
            imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'
          },
          {
            id: Date.now() + 1,
            title: 'Annual Sports Meet 2025',
            description: 'Join us for the Annual Sports Meet on February 5th! Registration is now open for all athletic events. Show your school spirit!',
            category: 'Event',
            date: '2025-01-08',
            reactions: 18,
            visible: true,
            imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'
          },
          {
            id: Date.now() + 2,
            title: 'School Reopening Announcement',
            description: 'School will reopen on January 2nd, 2025 after the holiday break. All students are expected to attend in full uniform.',
            category: 'Announcement',
            date: '2024-12-28',
            reactions: 42,
            visible: true
          }
        ];
        setNotices(sampleNotices);
        await window.storage.set('bc_notices', JSON.stringify(sampleNotices), true);
      }
    } catch (error) {
      console.error('Error loading notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveNotices = async (updatedNotices) => {
    try {
      await window.storage.set('bc_notices', JSON.stringify(updatedNotices), true);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setView('admin');
      setShowLoginModal(false);
      setAdminPassword('');
      showToast('Welcome back, Admin! 🎉');
    } else {
      showToast('Access Denied - Invalid Credentials', 'error');
      setAdminPassword('');
    }
  };

  const handleAddNotice = async () => {
    if (!formData.title || !formData.description) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    const newNotice = {
      id: editingNotice ? editingNotice.id : Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      attachmentName: formData.attachmentName,
      imageUrl: formData.imageUrl,
      reactions: editingNotice ? editingNotice.reactions : 0,
      visible: true
    };

    let updatedNotices;
    if (editingNotice) {
      updatedNotices = notices.map(n => n.id === editingNotice.id ? newNotice : n);
      showToast('Notice updated successfully! ✨');
    } else {
      updatedNotices = [newNotice, ...notices];
      showToast('Notice published successfully! 🎉');
    }

    setNotices(updatedNotices);
    await saveNotices(updatedNotices);
    setShowModal(false);
    resetForm();
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'General',
      date: new Date().toISOString().split('T')[0],
      attachmentName: '',
      imageUrl: ''
    });
    setEditingNotice(null);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      category: notice.category,
      date: notice.date,
      attachmentName: notice.attachmentName || '',
      imageUrl: notice.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const updatedNotices = notices.filter(n => n.id !== id);
    setNotices(updatedNotices);
    await saveNotices(updatedNotices);
    showToast('Notice deleted! 🗑️');
    setLoading(false);
  };

  const toggleVisibility = async (id) => {
    setLoading(true);
    const updatedNotices = notices.map(n => 
      n.id === id ? { ...n, visible: !n.visible } : n
    );
    setNotices(updatedNotices);
    await saveNotices(updatedNotices);
    const notice = updatedNotices.find(n => n.id === id);
    showToast(notice.visible ? 'Notice visible! 👁️' : 'Notice hidden! 🔒');
    setLoading(false);
  };

  const handleReact = async (id) => {
    const updatedNotices = notices.map(n => 
      n.id === id ? { ...n, reactions: n.reactions + 1 } : n
    );
    setNotices(updatedNotices);
    await saveNotices(updatedNotices);
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || notice.category === filterCategory;
    const isVisible = view === 'admin' || notice.visible;
    return matchesSearch && matchesCategory && isVisible;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-100">
      <header className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-3xl">
                <Bell className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Bandaranayake College
                </h1>
                <p className="text-red-100 text-base md:text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gampaha - Coding Club
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadNotices}
                className="p-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full hover:bg-opacity-30 transition-all duration-300"
                title="Refresh notices"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => {
                  if (view === 'admin' && isAuthenticated) {
                    setView('visitor');
                    setIsAuthenticated(false);
                    showToast('Logged out successfully');
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="px-6 py-3 bg-white bg-opacity-90 backdrop-blur-sm text-red-700 rounded-full font-bold hover:bg-opacity-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {view === 'admin' ? 'Exit Admin' : 'Admin Login'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none transition-all duration-300 shadow-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-6 py-3 bg-white rounded-full border-2 border-gray-200 text-gray-800 font-bold focus:border-red-400 focus:outline-none transition-all duration-300 cursor-pointer shadow-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {view === 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              Add Notice
            </button>
          )}
        </div>

        {loading && filteredNotices.length === 0 ? (
          <div className="text-center py-20">
            <RefreshCw className="w-16 h-16 text-red-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 text-xl font-bold">Loading notices...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotices.map((notice, idx) => (
                <div
                  key={notice.id}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                  style={{animation: 'fadeInUp 0.6s ease-out forwards', animationDelay: `${idx * 100}ms`, opacity: 0}}
                >
                  {notice.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={notice.imageUrl} 
                        alt={notice.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                        notice.category === 'Exam' ? 'bg-red-100 text-red-700' :
                        notice.category === 'Event' ? 'bg-blue-100 text-blue-700' :
                        notice.category === 'Announcement' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {notice.category}
                      </span>
                      {!notice.visible && view === 'admin' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                          Hidden
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-gray-800 mb-2 line-clamp-2">
                      {notice.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {notice.description}
                    </p>

                    <div className="flex items-center gap-3 mb-4 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-semibold text-gray-700">{notice.date}</span>
                      </div>
                      {notice.attachmentName && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-red-500">
                          <File className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[100px] font-semibold text-xs">{notice.attachmentName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleReact(notice.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all duration-300 transform hover:scale-105 font-bold text-sm"
                        disabled={view === 'admin'}
                      >
                        <Heart className="w-4 h-4" fill="currentColor" />
                        <span>{notice.reactions}</span>
                      </button>

                      {view === 'admin' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-all duration-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleVisibility(notice.id)}
                            className="p-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-full transition-all duration-300"
                          >
                            {notice.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(notice.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        notice.attachmentName && (
                          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-all duration-300 font-semibold text-sm">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNotices.length === 0 && !loading && (
              <div className="text-center py-20">
                <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-xl font-bold">No notices found</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-16 bg-gradient-to-r from-red-600 via-red-700 to-red-800 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white font-bold text-lg mb-2">
            Made by Bandaranayake College Coding Club
          </p>
          <p className="text-red-200 font-black text-xl tracking-wider">#teamCDC</p>
        </div>
      </footer>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{animation: 'fadeIn 0.3s ease-out'}}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" style={{animation: 'scaleIn 0.3s ease-out'}}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800">Admin Login</h2>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setAdminPassword('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <input
              type="password"
              placeholder="Enter password..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105"
            >
              Login to Admin Panel
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" style={{animation: 'fadeIn 0.3s ease-out'}}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8" style={{animation: 'scaleIn 0.3s ease-out'}}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Notice Title *"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none"
              />

              <textarea
                placeholder="Description *"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none resize-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-red-400 focus:outline-none cursor-pointer font-semibold"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-red-400 focus:outline-none"
                />
              </div>

              <input
                type="text"
                placeholder="Attachment filename (optional)"
                value={formData.attachmentName}
                onChange={(e) => setFormData({...formData, attachmentName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none"
              />

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <Upload className="w-4 h-4" />
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-red-400 focus:outline-none"
                />
                <p className="text-xs text-gray-500">💡 Tip: Use images from Unsplash, Imgur, or any image hosting service</p>
              </div>

              <button
                onClick={handleAddNotice}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (editingNotice ? 'Update Notice' : 'Publish Notice')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-full shadow-2xl z-50 font-bold ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        } text-white`} style={{animation: 'slideUp 0.3s ease-out'}}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default NoticeBoard;