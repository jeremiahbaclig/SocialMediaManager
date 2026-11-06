# Personal Social Media Publisher — Implementation Specification

## 1. Project Overview

Build a personal-use web application that allows a user to prepare social media posts for multiple platforms from one centralized interface.

The application will support:
- YouTube
- TikTok
- Instagram
- X (Twitter)

The primary goal is to create content once, customize it for individual platforms, and manually publish it through each platform's native interface.

**Publishing workflow:**

1. Create a post in the application.
2. Upload one or more images or videos.
3. Write a shared caption or description.
4. Select the social media platforms where the content should be published.
5. Customize the content for individual platforms when necessary.
6. Copy text and download media using the application's publishing tools.
7. Open the native social media publishing interface.
8. Manually upload the media, paste the content, and publish.
9. Mark the platform as published in the application.

The application is a personal publishing assistant, not an automated social media management service.

## 2. Technical Requirements

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Responsive design

### Hosting
- GitHub Pages
- GitHub Actions for automated deployment
- No backend server
- No paid hosting services

### Data Storage
Use IndexedDB for client-side persistence.

Store:
- Created posts
- Uploaded media
- Platform-specific captions and descriptions
- Publishing statuses
- Post creation and modification dates

Media should be stored as Blob objects rather than base64 strings to avoid unnecessary storage overhead.

The application must work without an account or authentication system.

### External Integrations

Do not implement:
- Social media API integrations
- OAuth authentication
- API key management
- Automated publishing
- Backend services
- Server-side media processing

The application must not attempt to embed authenticated social media interfaces in iframes.

Instead, provide links that open each platform's native publishing interface in a new browser tab.

The user is responsible for authenticating directly with each platform.

## 3. Application Structure

The application should have three primary pages.

### Page 1: Create Post

This is the primary landing page.

It should provide a centralized interface for creating and preparing social media posts.

#### Media Upload

Allow users to:
- Upload images.
- Upload videos.
- Upload multiple media files.
- Drag and drop files into the upload area.
- Preview uploaded media.
- Remove individual media files.
- Reorder uploaded media.

Display appropriate previews based on media type.

For videos, include a video player with basic playback controls.

Preserve the original uploaded files. Do not automatically compress, convert, or alter media.

#### Original Post Content

Provide a shared caption/content editor.

This acts as the master version of the post.

Users should be able to:
- Write captions.
- Include hashtags.
- Include URLs.
- Edit content before assigning it to platforms.

#### Platform Selection

Allow users to select any combination of:
- YouTube
- TikTok
- Instagram
- X (Twitter)

Each platform should have an enabled/disabled state.

Only enabled platforms should appear in the publishing workflow.

#### Platform-Specific Content

When a platform is selected, generate its initial content from the original post.

Allow users to independently customize the content for each platform.

Examples:

YouTube:
- Video title
- Video description

TikTok:
- Caption

Instagram:
- Caption

X:
- Post text

Editing a platform-specific version must not modify the original content or other platform versions.

Provide a reset option to restore the platform's content to the original shared content.

#### Platform Content Validation

Display helpful warnings for platform-specific content.

Examples:
- Character limits exceeded.
- Missing required title.
- Unsupported media format.
- Media file exceeds a known platform upload constraint.

Validation should be advisory. Do not block the user from preparing a post unless the content is structurally invalid.

Keep platform constraints centralized so they can be updated independently.

### Page 2: My Posts

Display all previously created posts.

Each post should show:
- Media thumbnail.
- Original caption.
- Creation date.
- Selected platforms.
- Publishing progress.

Allow users to:
- Open an existing post.
- Edit a post.
- Duplicate a post.
- Delete a post.
- Resume an unfinished publishing workflow.

Provide filters:
- All posts
- Drafts
- Partially published
- Fully published

Use the publishing statuses of individual platforms to determine the overall post status.

### Page 3: Media Library

Provide a centralized library of previously uploaded media.

Display:
- Image thumbnails.
- Video thumbnails/previews.
- File names.
- File types.
- File sizes.
- Upload dates.

Allow users to:
- Preview media.
- Delete media.
- Reuse existing media when creating a new post.

Deleting media should account for references from existing posts. Avoid accidentally breaking previously created posts.

## 4. Publishing Interface

This is a critical part of the application.

Each enabled platform should have an individual publishing card.

Every card should contain:

1. Platform name and icon.
2. Platform-specific content.
3. Copy buttons.
4. Media download controls.
5. Open platform button.
6. Publishing status.
7. Mark as published button.

### YouTube

Content:
- Title
- Description
- Uploaded video

Actions:
- Copy title.
- Copy description.
- Download video.
- Open YouTube Studio.

Publishing URL:
https://studio.youtube.com/

### TikTok

Content:
- Caption
- Uploaded image/video

Actions:
- Copy caption.
- Download selected media.
- Open TikTok Studio.

Publishing URL:
https://www.tiktok.com/tiktokstudio/upload

### Instagram

Content:
- Caption
- Uploaded image/video

Actions:
- Copy caption.
- Download selected media.
- Open Instagram.

Publishing URL:
https://www.instagram.com/

### X (Twitter)

Content:
- Post text
- Uploaded image/video

Actions:
- Copy post text.
- Download selected media.
- Open X's post composer.

Publishing URL:
https://x.com/compose/post

### Publishing Status

Each platform should independently maintain one of these statuses:

- Not Started
- In Progress
- Published

The user manually updates the status.

The application must never assume a post was published simply because the user opened a platform.

Provide a checkbox or button to mark a platform as published.

Display an overall progress indicator, such as:

2 / 4 Platforms Published

## 5. User Experience Requirements

### General Design

Use a clean, modern dashboard design.

Prioritize:
- Minimal visual clutter.
- Simple navigation.
- Clear publishing actions.
- Consistent spacing.
- Responsive layouts.
- Dark mode support if practical.

The application should feel like a lightweight personal productivity tool rather than a complicated enterprise dashboard.

### Navigation

Provide persistent navigation with:

- Create Post
- My Posts
- Media Library

The Create Post page should be the default landing page.

### Feedback

Provide clear feedback when:
- Media uploads successfully.
- Content is copied.
- Media downloads.
- A post is saved.
- A publishing status changes.
- A post is deleted.

Use toast notifications or equivalent feedback.

### Draft Persistence

Automatically save changes.

Users should not lose their work if they refresh the browser or navigate between pages.

Implement appropriate loading and error states for IndexedDB operations.

## 6. Data Architecture

Use a centralized data layer with IndexedDB.

Suggested database stores:

### posts

```ts
interface Post {
  id: string;
  originalContent: string;
  mediaIds: string[];
  platforms: PlatformContent;
  createdAt: number;
  updatedAt: number;
}
```

### media

```ts
interface Media {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: number;
}
```

### Platform Content

```ts
type PlatformStatus =
  | "not_started"
  | "in_progress"
  | "published";

interface PlatformContent {
  youtube: {
    enabled: boolean;
    title: string;
    description: string;
    status: PlatformStatus;
  };

  tiktok: {
    enabled: boolean;
    caption: string;
    status: PlatformStatus;
  };

  instagram: {
    enabled: boolean;
    caption: string;
    status: PlatformStatus;
  };

  twitter: {
    enabled: boolean;
    caption: string;
    status: PlatformStatus;
  };
}
```

The architecture should be extensible so additional platforms can be introduced without significant changes to the core data model.

Implement database versioning to support future schema migrations.

## 7. GitHub Pages Deployment

GitHub Pages is the initial hosting platform.

The application must be designed to deploy as a static site.

### Vite Configuration

Configure the Vite base path correctly.

The project must support deployment under a GitHub repository subpath rather than assuming it is hosted at the root domain.

Use a configurable base path:

```ts
export default defineConfig({
  base: process.env.GITHUB_ACTIONS
    ? "/REPOSITORY_NAME/"
    : "/",
});
```

Replace `REPOSITORY_NAME` with the actual GitHub repository name.

Ensure all asset references use Vite-compatible paths.

### Routing

Avoid server-dependent routing.

Use hash-based routing or another GitHub Pages-compatible approach so refreshing a nested route does not produce a 404.

### GitHub Actions

Create a GitHub Actions workflow that:

1. Checks out the repository.
2. Installs dependencies.
3. Builds the application.
4. Uploads the generated `dist` directory.
5. Deploys the build to GitHub Pages.

The workflow should trigger automatically when changes are pushed to the main branch.

### Deployment Documentation

Include a README with:
- Local development instructions.
- Build instructions.
- GitHub repository configuration.
- GitHub Pages setup.
- GitHub Actions deployment instructions.
- How to update the application.

The application must be deployable without any secrets or environment variables containing credentials.

### Persistence Considerations

IndexedDB is browser-specific.

Data is stored in the browser and is not automatically synchronized across devices.

The application should:
- Preserve data across refreshes.
- Handle browser storage errors.
- Warn users that clearing browser data can delete saved posts and media.
- Provide a future-compatible data export/import architecture.

## 8. Important Technical Considerations

### Clipboard

Use the browser Clipboard API to copy platform-specific text.

Provide a fallback or clear error message when clipboard permissions are unavailable.

### Media Downloads

Use Blob URLs to download stored media.

Support downloading individual files.

Use original file names where possible.

Revoke generated object URLs after downloads when appropriate.

### Browser Storage

Monitor storage usage where supported.

Large video files can consume significant browser storage.

Provide helpful feedback when an upload exceeds available storage capacity.

Do not silently discard media or posts.

### File Validation

Validate:
- File type.
- File size.
- Supported media formats.
- Empty uploads.

Do not assume all platforms accept identical formats or file sizes.

Keep validation rules configurable.

### Security

- Do not store social media passwords.
- Do not collect authentication cookies.
- Do not attempt to bypass platform restrictions.
- Do not inject scripts into external platforms.
- Do not embed authenticated interfaces.

## 9. Implementation Phases

Implement the project in the following phases.

Each phase must be completed and tested before moving to the next phase.

### Phase 1: Project Foundation

Goals:
- Initialize React, Vite, TypeScript, and Tailwind.
- Establish the application structure.
- Configure GitHub Pages compatibility.
- Configure GitHub Actions deployment.
- Create the primary dashboard layout.
- Implement navigation between the three pages.
- Establish reusable UI components.

Deliverables:
- Working application shell.
- Successful local development build.
- Successful production build.
- Successful GitHub Pages deployment.

Acceptance criteria:
- Application loads from its GitHub Pages URL.
- Assets load correctly under the repository subpath.
- Navigation works.
- Refreshing a page does not cause a 404.
- Deployment occurs automatically after pushing to main.

### Phase 2: Media Upload and Library

Goals:
- Implement IndexedDB.
- Create the media storage layer.
- Implement image and video uploads.
- Implement drag-and-drop functionality.
- Implement previews.
- Implement media removal and reordering.
- Build the Media Library page.

Acceptance criteria:
- Users can upload multiple images and videos.
- Media persists after refreshing the browser.
- Media can be previewed and downloaded.
- Existing media can be reused.
- Storage errors are handled gracefully.

### Phase 3: Post Composer

Goals:
- Build the Create Post page.
- Implement original content editing.
- Implement platform selection.
- Generate initial platform-specific content.
- Implement independent platform editing.
- Implement automatic draft persistence.

Acceptance criteria:
- Users can create a post with multiple media files.
- Users can select any combination of platforms.
- Each platform receives an editable copy of the original content.
- Editing one platform does not affect others.
- Drafts survive browser refreshes.

### Phase 4: Publishing Workflow

Goals:
- Implement individual publishing cards.
- Add platform-specific copy buttons.
- Add media download actions.
- Add native platform links.
- Implement publishing statuses.
- Implement overall publishing progress.

Acceptance criteria:
- Every selected platform has its own publishing card.
- Text copies correctly.
- Media downloads correctly.
- Platform links open in new tabs.
- Users can manually mark posts as published.
- Publishing progress updates correctly.

### Phase 5: Post Management

Goals:
- Build My Posts.
- Implement post history.
- Implement editing and duplication.
- Implement deletion.
- Implement status filters.
- Improve draft management.

Acceptance criteria:
- All posts appear in the history.
- Users can resume unfinished posts.
- Users can duplicate existing posts.
- Users can delete posts safely.
- Status filters work correctly.

### Phase 6: Polish and Final Testing

Goals:
- Improve responsive design.
- Add loading states.
- Add error handling.
- Add toast notifications.
- Add empty states.
- Test large media uploads.
- Test IndexedDB persistence.
- Test GitHub Pages production deployment.
- Write final documentation.

Acceptance criteria:
- No critical console errors.
- No broken navigation.
- No accidental loss of saved posts during normal usage.
- All publishing actions work as intended.
- Application works on desktop and mobile browsers.

## 10. Development Guidelines

- Keep components modular and reusable.
- Separate UI components from database logic.
- Centralize platform-specific configurations.
- Use TypeScript types throughout.
- Avoid unnecessary dependencies.
- Avoid introducing backend infrastructure.
- Do not implement features outside the current phase.
- Keep each phase independently testable.
- Do not sacrifice maintainability for premature optimization.

After completing each phase:
1. Run the production build.
2. Run available tests.
3. Fix all errors.
4. Verify the acceptance criteria.
5. Summarize files created or modified.
6. Identify any remaining limitations.
7. Wait for approval before proceeding to the next phase.

## 11. MVP Definition of Done

The MVP is complete when a user can:

1. Open the application hosted on GitHub Pages.
2. Upload images and videos.
3. Create a post with original content.
4. Select YouTube, TikTok, Instagram, and/or X.
5. Customize content independently for each platform.
6. Save the post automatically.
7. Copy the appropriate text for each platform.
8. Download the appropriate media.
9. Open each platform's native publishing interface.
10. Manually publish the content.
11. Track publishing progress.
12. Return later and resume unfinished posts.

**The application should remain entirely client-side, with no social media API integrations, no authentication management, no backend, and no automated publishing.**

The priority is a reliable, simple, personal-use publishing dashboard that can be deployed and maintained through GitHub.