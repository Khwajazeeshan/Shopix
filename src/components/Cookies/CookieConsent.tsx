"use client"
import React, { useState, useEffect } from 'react';
import { FiX, FiInfo } from 'react-icons/fi';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('shopix_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('shopix_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('shopix_cookie_consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-2 sm:p-4 md:p-6 animate-in slide-in-from-bottom-10 duration-700 pointer-events-none">
            <div className="max-w-4xl mx-auto bg-surface/90 backdrop-blur-xl border border-border shadow-2xl rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-8 flex flex-col md:flex-row items-center gap-3 sm:gap-4 md:gap-6 pointer-events-auto relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                
                <button onClick={() => setIsVisible(false)} className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors z-10">
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex-1 flex gap-3 sm:gap-5 items-start sm:items-center pr-6 sm:pr-0">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                        <FiInfo className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-0.5 sm:mb-1">We respect your privacy</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Shopix uses cookies to enhance your shopping experience, personalize content, and analyze our traffic. By clicking &quot;Accept&quot;, you agree to our use of cookies.
                        </p>
                    </div>
                </div>

                <div className="flex w-full md:w-auto items-center gap-2 sm:gap-3 shrink-0">
                    <button 
                        onClick={handleDecline} 
                        className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-border text-foreground font-semibold rounded-lg sm:rounded-xl hover:bg-muted transition-colors text-xs sm:text-sm"
                    >
                        Decline
                    </button>
                    <button 
                        onClick={handleAccept} 
                        className="flex-1 md:flex-none px-5 sm:px-8 py-2.5 sm:py-3 bg-primary text-white font-bold rounded-lg sm:rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 active:scale-[0.98] text-xs sm:text-sm"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
