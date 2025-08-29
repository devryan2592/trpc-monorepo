import PageHeader from "@/components/common/page-header";
import { NextPage } from "next";
import DestinationDataTable from "./_components/table";
import DestinationDialog from "@/components/dialog/destination-dialog";

const DestinationsPage: NextPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <PageHeader title="Destinations" description="Manage your destination items">
          <DestinationDialog />
        </PageHeader>
      </div>
      <DestinationDataTable />
    </div>
  );
};

export default DestinationsPage;
