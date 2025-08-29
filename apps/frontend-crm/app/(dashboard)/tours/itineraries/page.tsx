import PageHeader from "@/components/common/page-header";
import { NextPage } from "next";
import ItineraryDataTable from "./_components/table";
import ItineraryDialog from "@/components/dialog/itinerary-dialog";

const ItineraryPage: NextPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <PageHeader title="Itinerary" description="Manage your itinerary items">
          <ItineraryDialog />
        </PageHeader>
      </div>
      <ItineraryDataTable />
    </div>
  );
};

export default ItineraryPage;
