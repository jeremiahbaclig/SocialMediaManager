import { EmptyState } from "../components/EmptyState";
import { PageHeading } from "../components/PageHeading";

export function CreatePostPage() {
  return (
    <>
      <PageHeading title="Create Post" />
      <EmptyState
        icon="sparkles"
        title="Not implemented yet"
        description="Post creation will be added later."
      />
    </>
  );
}
