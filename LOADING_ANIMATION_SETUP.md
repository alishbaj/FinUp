# Loading Animation Setup Instructions

## Step 1: Add Your Animation Frames

Place your bubble popping animation frames in the following directory:
```
FinUp/public/images/loading/
```

### File Naming:
- If you have **6 frames**: Name them `bubble-frame-1.png`, `bubble-frame-2.png`, ... `bubble-frame-6.png`
- If you have **5 frames**: Name them `bubble-frame-1.png`, `bubble-frame-2.png`, ... `bubble-frame-5.png`

### Example:
```
FinUp/public/images/loading/
  ├── bubble-frame-1.png
  ├── bubble-frame-2.png
  ├── bubble-frame-3.png
  ├── bubble-frame-4.png
  ├── bubble-frame-5.png
  └── bubble-frame-6.png  (if you have 6 frames)
```

## Step 2: Configure the Animation

### For 6 Frames (Default):
The CSS is already configured for 6 frames. No changes needed!

### For 5 Frames:
If you have 5 frames instead of 6, open `FinUp/public/css/loading.css` and replace the `@keyframes bubblePopFrames` section with:

```css
@keyframes bubblePopFrames {
    0% {
        background-image: url('/images/loading/bubble-frame-1.png');
    }
    25% {
        background-image: url('/images/loading/bubble-frame-2.png');
    }
    50% {
        background-image: url('/images/loading/bubble-frame-3.png');
    }
    75% {
        background-image: url('/images/loading/bubble-frame-4.png');
    }
    100% {
        background-image: url('/images/loading/bubble-frame-5.png');
    }
}
```

## Step 3: Adjust Animation Speed (Optional)

To change how fast the animation plays, edit `FinUp/public/css/loading.css`:

Find this line:
```css
animation: bubblePopFrames 0.8s steps(5) infinite;
```

- Change `0.8s` to adjust duration (lower = faster, higher = slower)
- Change `steps(5)` to `steps(6)` if you have 6 frames, or keep `steps(5)` for 5 frames

## Step 4: Adjust Animation Size (Optional)

To change the size of the bubble animation, edit `FinUp/public/css/loading.css`:

Find:
```css
.bubble-pop-animation {
    width: 200px;
    height: 200px;
    ...
}
```

Adjust the `width` and `height` values to your desired size.

## How It Works

1. **Automatic Detection**: The loading screen automatically appears when you click any navigation link
2. **Page Transitions**: It shows during page transitions between:
   - Brew
   - Ingredients
   - Potions
   - Academy
   - Leaderboard
   - Quiz
   - Landing page

3. **Animation**: The bubble frames cycle continuously while loading
4. **Auto-Hide**: The loading screen automatically hides when the new page finishes loading

## Testing

1. Start your server: `node server.js`
2. Navigate between pages using the navigation bar
3. You should see the bubble popping animation during page transitions

## Troubleshooting

**Animation not showing?**
- Check that your frame files are in `FinUp/public/images/loading/`
- Verify file names match exactly: `bubble-frame-1.png`, `bubble-frame-2.png`, etc.
- Check browser console (F12) for any image loading errors

**Animation too fast/slow?**
- Adjust the `0.8s` duration in the CSS (see Step 3)

**Animation not looping?**
- Make sure you have `infinite` in the animation property
- Check that all frame files exist and are named correctly

**Loading screen not appearing?**
- Make sure `js/loading.js` is included in all HTML files
- Check browser console for JavaScript errors

