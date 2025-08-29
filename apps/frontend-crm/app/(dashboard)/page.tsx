import { NextPage } from "next";
import PageHeader from "@/components/common/page-header";

interface DashboardHomeProps {
  // Add your page props here
}

const DashboardHome: NextPage<DashboardHomeProps> = (props) => {
  return (
    <div>
      <PageHeader
        title="Dashboard Home"
        description="Welcome to the dashboard home page"
      />
    </div>
  );
};

export default DashboardHome;
