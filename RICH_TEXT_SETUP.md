# 🚀 Complete Setup Guide - NewsOS Rich Text Editor

**Date:** 2026-01-24  
**Goal:** Add rich text editing with image upload + EN/BN tabs

---

## 🔧 **Step 1: Fix npm Install Errors**

Run these commands in WSL Ubuntu:

```bash
cd ~/project/news-portal-v2

# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Install Tiptap (try this first)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-image @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-color @tiptap/extension-text-style

# Install Lucide Icons
npm install lucide-react
```

**If you still get errors**, try this alternative:

```bash
# Install with --legacy-peer-deps flag
npm install --legacy-peer-deps @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-image @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-color @tiptap/extension-text-style lucide-react
```

**If THAT doesn't work**, try installing one-by-one:

```bash
npm install --legacy-peer-deps @tiptap/react
npm install --legacy-peer-deps @tiptap/starter-kit  
npm install --legacy-peer-deps @tiptap/extension-placeholder
npm install --legacy-peer-deps @tiptap/extension-link
npm install --legacy-peer-deps @tiptap/extension-image
npm install --legacy-peer-deps @tiptap/extension-text-align
npm install --legacy-peer-deps @tiptap/extension-underline
npm install --legacy-peer-deps @tiptap/extension-color
npm install --legacy-peer-deps @tiptap/extension-text-style
npm install --legacy-peer-deps lucide-react
```

---

## ✅ **Step 2: What's Already Done**

Good news! I checked your code and **media upload is already implemented**:

### ✅ API Client (`src/lib/api-client.ts`)
- Already supports FormData uploads
- Handles multipart/form-data automatically

### ✅ API Hooks (`src/hooks/api-hooks.ts`)
- `useUploadMedia()` hook exists (line 311-333)
- Handles file upload with FormData
- Supports alt text, folder, tags
- Auto-invalidates media library cache

### ✅ Media Library Hook
- `useMediaLibrary()` exists
- Will automatically show uploaded images

---

## 🎯 **Step 3: What I'll Build**

Once you confirm the packages are installed, I'll create:

### 1. **Rich Text Editor Component** (`src/components/editor/RichTextEditor.tsx`)
```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Write your article..."
  onImageUpload={(file) => uploadMutation.mutateAsync(file)}
/>
```

**Features:**
- ✅ Bold, Italic, Underline
- ✅ Headings (H1, H2, H3)
- ✅ Lists (bullets, numbers)
- ✅ Links (insert/edit)
- ✅ **Image Upload** (drag-drop or button)
- ✅ Text alignment
- ✅ Undo/Redo
- ✅ NewsOS styling (square, dense toolbar)

### 2. **Language Tabs Component** (`src/components/editor/LanguageTabs.tsx`)
```tsx
<LanguageTabs
  tabs={[
    { label: 'English', value: 'en', content: <RichTextEditor ... /> },
    { label: 'বাংলা', value: 'bn', content: <RichTextEditor ... /> }
  ]}
/>
```

### 3. **Updated Articles Page**
- Excerpt section with EN/BN tabs + Rich Editor
- Content section with EN/BN tabs + Rich Editor
- Image upload button in toolbar
- Auto-save to media library

---

## 📸 **Step 4: Image Upload Flow**

```
User clicks "Image" button in toolbar
         ↓
File picker opens
         ↓
User selects image
         ↓
useUploadMedia() uploads to /media/upload
         ↓
Backend saves to /uploads/ folder
         ↓
Returns {url: "/uploads/image.jpg", id: "..."}
         ↓
Image inserted into editor
         ↓
Also appears in Media library page
```

---

## 🎨 **Step 5: Final Layout**

```
┌─── EDIT ARTICLE ────────────────────────────────────┐
│ Title (EN): [___________]  Title (BN): [_________] │
│ Slug: [___________]  Category: [▼]  Status: [▼]    │
├─────────────────────────────────────────────────────┤
│ ┌─ EXCERPT ─────────────────────────────────────┐  │
│ │  ┌──────┬──────┐                              │  │
│ │  │ EN ✓ │  BN  │  ← Tabs                      │  │
│ │  └──────┴──────┘                              │  │
│ │  ┌────────────────────────────────────────┐   │  │
│ │  │ [B] [I] [U] [Link] [Image↑] [List]     │   │  │
│ │  ├────────────────────────────────────────┤   │  │
│ │  │ Brief summary with formatting...        │   │  │
│ │  │                                         │   │  │
│ │  └────────────────────────────────────────┘   │  │
│ └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ ┌─ CONTENT ─────────────────────────────────────┐  │
│ │  ┌──────┬──────┐                              │  │
│ │  │ EN ✓ │  BN  │                              │  │
│ │  └──────┴──────┘                              │  │
│ │  ┌────────────────────────────────────────┐   │  │
│ │  │ [B] [I] [U] [H1] [H2] [Link] [Image↑]  │   │  │
│ │  ├────────────────────────────────────────┤   │  │
│ │  │ Full article content...                 │   │  │
│ │  │                                         │   │  │
│ │  │ [Uploaded images appear inline]         │   │  │
│ │  │                                         │   │  │
│ │  └────────────────────────────────────────┘   │  │
│ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ **Next Steps - Tell Me When Ready**

**Run the install commands above**, then reply with:
- ✅ **"packages installed"** - I'll build the rich text editor
- ❌ **"still errors"** + paste the error - I'll help debug

Once packages are installed, I'll create:
1. `src/components/editor/RichTextEditor.tsx`
2. `src/components/editor/LanguageTabs.tsx`
3. Updated `src/app/(admin)/admin/articles/page.tsx`

All with:
- ✅ Rich text formatting
- ✅ Image upload with drag-drop
- ✅ EN/BN language tabs
- ✅ NewsOS square styling
- ✅ Auto-save to media library

---

## 🐛 **Debugging npm Errors**

If you're still getting "Cannot read properties of null (reading 'matches')", try:

```bash
# Check Node version (should be 18+)
node --version

# If old, update Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clear everything and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

**Ready to proceed once you run the install commands!** 🚀
