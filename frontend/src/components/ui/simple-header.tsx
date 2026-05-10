import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LogOut, User as UserIcon, Calendar as CalendarIcon, LayoutGrid, Home, Compass, MapPin, Plus, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import NavHeader from '@/components/ui/nav-header';
import { GlassCalendar } from '@/components/ui/glass-calendar';
import CircularNavigation from '@/components/ui/circular-navigation-bar';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggle } from '@/components/ui/menu-toggle';

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr && userStr !== 'undefined') {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setOpen(false);
    navigate('/login');
  };

  const links = token ? [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Trips', href: '/trips' },
    { label: 'Explore', href: '/explore' },
    { label: 'Billing', href: '/billing/default' },
  ] : [
    { label: 'Features', href: '/#features' },
    { label: 'Explore', href: '/#features' },
  ];

  return (
    <header className="bg-white/95 supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 w-full border-b border-gray-100 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-purple-600 font-bold text-lg">
          <Plane className="w-7 h-7" />
          <span className="font-sans font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600">
            Traveloop
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-4 lg:flex flex-1 justify-center px-4">
          <NavHeader links={links} />
        </div>

        <div className="hidden items-center gap-4 lg:flex">

          {token ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              {/* Profile Pill Button */}
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-2 py-1.5 pr-4 rounded-full bg-white border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white rounded-full shadow-inner group-hover:scale-105 transition-transform">
                  <UserIcon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-black text-gray-800 group-hover:text-purple-700 transition-colors leading-tight">{user?.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 leading-tight">{user?.email}</span>
                </div>
              </Link>

              {/* Utility Tools Pill */}
              <div className="flex items-center gap-1 p-1 bg-gray-50/80 border border-gray-200/60 rounded-full shadow-inner backdrop-blur-sm">
                <div className="relative" ref={calendarRef}>
                  <button 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-white rounded-full transition-all hover:shadow-sm focus:outline-none"
                    title="Calendar"
                  >
                     <CalendarIcon className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  {isCalendarOpen && (
                    <div className="absolute right-0 mt-4 z-50 origin-top-right">
                      <GlassCalendar />
                    </div>
                  )}
                </div>

                <div className="w-[1px] h-4 bg-gray-300 mx-1 rounded-full"></div>

                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-full transition-all hover:shadow-sm focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ variant: 'ghost', className: 'font-semibold text-gray-600 hover:text-purple-600 text-sm' })}>
                Sign In
              </Link>
              <Link to="/signup" className={buttonVariants({ className: 'bg-purple-600 text-white font-semibold hover:bg-purple-700 text-sm' })}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu sheet toggle */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
              className="bg-white/95 supports-[backdrop-filter]:bg-white/80 gap-0 backdrop-blur-lg border-r border-gray-100 flex flex-col justify-between"
              showClose={false}
              side="left"
            >
              <div className="grid gap-y-3 overflow-y-auto px-4 pt-12 pb-5">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-lg mb-4">
                  <Plane className="w-6 h-6" />
                  <span>Traveloop Menu</span>
                </div>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    onClick={() => setOpen(false)}
                    className={buttonVariants({
                      variant: 'ghost',
                      className: 'justify-start font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl',
                    })}
                    to={link.href}
                  >
                    {link.label}
                  </Link>
                ))}

                {token && (
                  <Link
                    onClick={() => setOpen(false)}
                    className={buttonVariants({
                      variant: 'ghost',
                      className: 'justify-start font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl',
                    })}
                    to="/profile"
                  >
                    My Profile Settings
                  </Link>
                )}
              </div>

              <SheetFooter className="p-6 border-t border-gray-100 flex flex-col gap-3">
                {token ? (
                  <div className="flex flex-col gap-3">
                    <div className="px-4 py-2 bg-gray-50 rounded-2xl">
                      <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-[10px] text-gray-500">{user?.email}</p>
                    </div>
                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" onClick={() => setOpen(false)} className={buttonVariants({ variant: 'outline', className: 'flex-1 font-semibold rounded-xl' })}>
                      Sign In
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className={buttonVariants({ className: 'flex-1 bg-purple-600 text-white font-semibold hover:bg-purple-700 rounded-xl' })}>
                      Get Started
                    </Link>
                  </div>
                )}
              </SheetFooter>
            </SheetContent>

            {/* Standard Button trigger to toggle Open state of mobile drawer */}
            <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="border-gray-200 hover:bg-purple-50 hover:text-purple-600 rounded-xl">
              <MenuToggle
                strokeWidth={2.5}
                open={open}
                onOpenChange={setOpen}
                className="size-5"
              />
            </Button>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
