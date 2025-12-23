import React from 'react';

const ShopLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600/10">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Premium Header */}
            <header className="bg-michelinYellow sticky top-0 z-40 shadow-md border-b border-michelinBlue/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-black text-michelinBlue tracking-tight">
                            대동 - 미쉐린 검색
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-michelinYellow/20 rounded-full border border-michelinYellow/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-michelinBlue shadow-[0_0_8px_rgba(0,79,159,0.4)] animate-pulse"></div>
                            <span className="text-[10px] text-michelinBlue font-bold uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200 py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold mb-2">
                        Daedong Tire & Wheel
                    </div>
                    <div className="text-[9px] text-slate-500">
                        &copy; 2025 DDWT. ALL RIGHTS RESERVED. DATA SYNCED VIA MICHELIN-API.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ShopLayout;
