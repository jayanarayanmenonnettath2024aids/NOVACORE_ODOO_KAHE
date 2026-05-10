import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
 
interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}
 
interface CircularNavigationProps {
  navItems: NavItem[];
  isOpen: boolean;
  toggleMenu: () => void;
}
 
export default function CircularNavigation({
  navItems,
  isOpen,
  toggleMenu,
}: CircularNavigationProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
 
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 h-screen w-full flex items-center justify-center bg-transparent z-[9000]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000]"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, type: "spring", damping: 20, stiffness: 200 }}
              className="relative aspect-square w-[420px] max-w-[90vw] rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow:
                  "inset 2px 2px 2px rgba(255,255,255,0.2), inset -1px -1px 1px rgba(255,255,255,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={toggleMenu}
                className="absolute aspect-square flex items-center justify-center w-14 h-14 rounded-full bg-white text-black z-10 shadow-xl hover:scale-110 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
 
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const angle = (360 / navItems.length) * index;
                // Calculate position on the circle (radius ~150px)
                const radius = 150;
                
                return (
                  <div
                    key={item.name}
                    className="absolute"
                    style={{
                      transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                    }}
                  >
                    <Link
                      to={item.href}
                      className={`flex flex-col items-center justify-center w-20 h-20 aspect-square rounded-full transition-all duration-300 ${
                        hoveredItem === item.name
                          ? "bg-white text-purple-600 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-110"
                          : "text-white hover:bg-white/10"
                      }`}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={toggleMenu}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold tracking-wider uppercase">
                        {item.name}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
