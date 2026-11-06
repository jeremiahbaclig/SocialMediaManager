import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { CreatePostPage } from "./pages/CreatePostPage";
import { MediaLibraryPage } from "./pages/MediaLibraryPage";
import { MyPostsPage } from "./pages/MyPostsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<CreatePostPage />} />
        <Route path="posts" element={<MyPostsPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
