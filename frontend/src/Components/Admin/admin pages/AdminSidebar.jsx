import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { label: 'Manage Users', icon: '👥', path: '/admin/users' },
  { label: 'Manage Vendors', icon: '🧑‍💼', path: '/admin/vendors' },
  { label: 'Product Requests', icon: '📝', path: '/admin/product-requests' },
  { label: 'My Profile', icon: '🙍‍♂️', path: '/admin/profile' },
  { label: 'Logout', icon: '🚪', path: '/logout' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col shadow-lg fixed top-0 left-0 z-30">
      <div className="text-2xl font-bold px-6 py-4 border-b border-gray-700">Admin</div>
      <nav className="flex-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-6 py-3 hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            onClick={() => {
              if (item.label === 'Logout') {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                navigate('/admin/signin');
              } else {
                navigate(item.path);
              }
            }}
          >
            <span>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-all"
          onClick={() => window.location.href = '/'}
        >
          Back to Site
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;