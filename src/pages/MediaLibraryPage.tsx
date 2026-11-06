import { EmptyState } from "../components/EmptyState";
import { PageHeading } from "../components/PageHeading";

export function MediaLibraryPage() {
  return (
    <>
      <PageHeading title="Media Library" />
      <EmptyState
        icon="image"
        title="No media"
        description="Media uploads will be added later."
      />
    </>
  );
}
