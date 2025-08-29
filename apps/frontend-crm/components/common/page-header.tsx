import { FC } from "react";

interface PageHeaderProps {
  // Add your props here
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold ">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
};

export default PageHeader;
