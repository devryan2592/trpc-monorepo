"use client";
import { FC } from "react";

interface DashboardPageLayoutProps {
  // Add your props here
  children?: React.ReactNode;
}

const DashboardPageLayout: FC<DashboardPageLayoutProps> = ({ children }) => {
  return (
    <main className="relative h-full max-h-[calc(100vh-4rem)] group-has-data-[collapsible=icon]/sidebar-wrapper:max-h-[calc(100vh-3rem)] mt-16 group-has-data-[collapsible=icon]/sidebar-wrapper:mt-12 transition-[height] ease-linear ">
      <div className="absolute top-0 right-0 bottom-0 left-0 overflow-y-auto no-scrollbar m-4 ">
        {children}
      </div>
    </main>
  );
};

export default DashboardPageLayout;
