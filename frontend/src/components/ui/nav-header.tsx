import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function NavHeader({ links }: { links: { label: string; href: string }[] }) {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const location = useLocation();
  const tabsRef = useRef<Map<string, HTMLLIElement>>(new Map());

  const updatePosition = (href: string) => {
    const activeTab = tabsRef.current.get(href);
    if (activeTab) {
      const { width } = activeTab.getBoundingClientRect();
      setPosition({
        width,
        opacity: 1,
        left: activeTab.offsetLeft,
      });
    }
  };

  React.useEffect(() => {
    updatePosition(location.pathname);
  }, [location.pathname]);

  return (
    <ul
      className="relative mx-auto flex w-fit rounded-full border border-purple-100 bg-white p-1.5 shadow-sm"
      onMouseLeave={() => updatePosition(location.pathname)}
    >
      {links.map((link) => (
        <Tab 
          key={link.label} 
          setPosition={setPosition} 
          href={link.href}
          onRef={(el) => el && tabsRef.current.set(link.href, el)}
        >
          {link.label}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({
  children,
  setPosition,
  href,
  onRef,
}: {
  children: React.ReactNode;
  setPosition: any;
  href: string;
  onRef: (el: HTMLLIElement | null) => void;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <li
      ref={(el) => {
        (ref as any).current = el;
        onRef(el);
      }}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative z-10 block cursor-pointer px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors duration-300 ${
        isHovered || isActive ? "text-white" : "text-gray-900"
      }`}
    >
      <Link to={href} className="block w-full h-full whitespace-nowrap">{children}</Link>
    </li>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className="absolute z-0 h-9 rounded-full bg-purple-600 shadow-lg shadow-purple-200"
      style={{ top: "6px" }}
    />
  );
};
