import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminTopbar from './SuperAdminTopbar';
import DashboardContent from './DashboardContent';
const DashboardLayout = () => {
  return (
    <div>
      <SuperAdminSidebar />
      <SuperAdminTopbar username="John Doe" />
      <DashboardContent/>
    </div>
  );
};

export default DashboardLayout;
