import React from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LogOut, User as UserIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggle } from '@/components/ui/menu-toggle';

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
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
        <div className="hidden items-center gap-4 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              className={buttonVariants({ variant: 'ghost', className: 'text-gray-600 hover:text-purple-600 font-semibold text-sm' })}
              to={link.href}
            >
              {link.label}
            </Link>
          ))}

          {token ? (
            <div className="flex items-center gap-4 pl-4 border-l">
              <Link to="/profile" className="text-right hover:opacity-80 transition-opacity">
                <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
                <p className="text-[10px] text-gray-500">{user?.email}</p>
              </Link>
              <Link to="/profile" className="p-2 bg-gray-50 rounded-full hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-all">
                 <UserIcon className="w-4 h-4" />
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
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
