# How to Add Your Logo

## Step 1: Create the Images Folder
Create a folder called `images` inside the `public` folder:
```
FinUp/public/images/
```

## Step 2: Add Your Logo Image
1. Save your logo image file as `logo.png` (or `logo.jpg`, `logo.svg`, etc.)
2. Place it in the `FinUp/public/images/` folder
3. Recommended size: 40-50px height (width will scale automatically)
4. Recommended formats: PNG (with transparency) or SVG (for best quality)

## Step 3: Update the File Path (if needed)
If you named your logo something other than `logo.png`, you'll need to update the path in:
- `FinUp/public/js/nav.js` - Line 15

Change:
```javascript
<img src="images/logo.png" alt="BudgetBrew Logo" ...>
```

To match your filename, for example:
```javascript
<img src="images/my-logo.png" alt="BudgetBrew Logo" ...>
```

## Step 4: Test It
1. Start your server: `node server.js`
2. Navigate to any page
3. The logo should appear in the top-left corner of the navigation bar
4. If the logo doesn't load, the emoji fallback (🧙‍♂️) will show instead

## Tips:
- **PNG with transparency** works best for logos
- **SVG format** is ideal for crisp display at any size
- Keep file size under 100KB for fast loading
- The logo will automatically scale on mobile devices

## Current Setup:
The navigation is already configured to:
- Display your logo image
- Fall back to the emoji icon if the image doesn't load
- Scale appropriately on mobile devices
- Maintain proper spacing and alignment

