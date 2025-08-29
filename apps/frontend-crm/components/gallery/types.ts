export interface SelectedFile {
  id: string;
  fileName: string;
  bucketName: string;
  mimeType?: string;
  size?: number;
  url?: string;
}

export interface ImageGalleryFolder {
  id: string;
  name: string;
  bucketName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageSEOData {
  fileName: string;
  alt: string;
  keywords: string;
}

export interface GalleryFile extends SelectedFile {
  thumbnailUrl?: string;
  isSelected?: boolean;
}

export type SelectionMode = "single" | "multiple";

export interface ImageGalleryProps {
  selectionMode?: SelectionMode;
  onSelectionChange?: (selectedFiles: SelectedFile[]) => void;
  initialSelectedFiles?: SelectedFile[];
  files?: GalleryFile[];
  maxSelections?: number;
  allowEdit?: boolean;
  trigger?: React.ReactNode;
}

export interface GalleryItemProps {
  file: GalleryFile;
  isSelected: boolean;
  selectionMode: SelectionMode;
  onSelect: (file: GalleryFile) => void;
  onDeselect: (file: GalleryFile) => void;
  onDelete?: (fileId: string) => void;
  onRefreshUrl?: (fileId: string) => Promise<string | null>;
}

export interface SelectedImagePreviewProps {
  selectedFiles: SelectedFile[];
  onEdit?: (file: SelectedFile) => void;
  onRemove?: (file: SelectedFile) => void;
}

export interface ImageEditDialogProps {
  file: SelectedFile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: SelectedFile, seoData: ImageSEOData) => void;
}
