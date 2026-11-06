import { EmptyState } from "../components/EmptyState";
import { PageHeading } from "../components/PageHeading";

export function MyPostsPage() {
  return (
    <>
      <PageHeading title="My Posts" />
      <EmptyState
        icon="file"
        title="No posts"
        description="Post management will be added later."
      />
    </>
  );
}
