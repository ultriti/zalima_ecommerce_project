import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { label: 'Manage Admins', icon: '👤', path: '/dashboard/admins' },
  { label: 'Manage Vendors', icon: '🧑‍💼', path: '/dashboard/vendors' },
  { label: 'Manage Users', icon: '👥', path: '/dashboard/users' },
  { label: 'Manage Products', icon: '📦', path: '/dashboard/products' },
  { label: 'Analytics', icon: '📈', path: '/dashboard/metrics' },
  { label: 'Profile Settings', icon: '⚙️', path: '/dashboard/profile' },
  { label: 'Logout', icon: '🚪', path: '/logout' },
];

const SuperAdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 flex flex-col shadow-lg">
      <div className="text-2xl font-bold px-6 py-4 border-b border-gray-700">SuperAdmin</div>
      <nav className="flex-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-6 py-3 hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SuperAdminSidebar;
