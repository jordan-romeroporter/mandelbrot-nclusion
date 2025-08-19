# Mandelbrot Set Visualizer

Original Assignment:
https://hexagonal-dragon-7e5.notion.site/Frontend-SWE-Take-Home-Interview-FE-001-MB-1a03b2afaa648017ab15c3eeaf52290d

An interactive visualization of the Mandelbrot set, built for a frontend engineering challenge. This project explores the beautiful mathematical patterns that emerge from the iterative equation z(n+1) = z(n)² + c.

## 🎯 Challenge Requirements Met

✅ **Grid Coverage**: Spans from (-2, -2) to (2, 2) in the complex plane  
✅ **Resolution**: 500×500 minimum grid (250,000+ points calculated)  
✅ **Color Scheme**: Light colors for bounded points (in the set), dark for unbounded  
✅ **Performance**: Non-blocking rendering using Web Workers  
✅ **Interactive**: Multiple viewport presets and quality settings

## 🚀 Live Demo

[View Live Demo](https://jordan-romeroporter.github.io/mandelbrot-nclusion/)

## 💡 Technical Approach

I had a lot of fun building this! Here's how I approached the challenge:

### Architecture Decisions

- **React + TypeScript**: Chose TypeScript for type safety when dealing with complex mathematical calculations and component props
- **Vite**: Lightning-fast dev server and optimized production builds
- **Web Workers**: Implemented parallel processing across multiple workers (2x CPU cores) to prevent UI blocking during calculations
- **Canvas API**: Direct pixel manipulation for optimal rendering performance

### Performance Optimizations

1. **Parallel Processing**: Distributes calculations across available CPU cores
2. **Progressive Rendering**: Shows results as they're calculated rather than waiting for completion
3. **Optimized Math**:

   - Cached squared values to avoid redundant calculations
   - Early escape detection for points outside the set
   - Smooth iteration counting for better gradients

4. **Responsive Design**: Canvas scales appropriately for mobile devices while maintaining aspect ratio

### Features

- **Random Viewports**: Each page refresh shows a different interesting area of the set
- **Preset Locations**: Quick jump to mathematically interesting regions (Seahorse Valley, Elephant Valley, etc.)
- **Adjustable Quality**: Trade-off between speed and detail with configurable grid sizes
- **Mobile Responsive**: Works smoothly on all devices

## 🛠️ Technical Stack

- React 18 with Hooks
- TypeScript
- Vite
- Canvas API
- Web Workers API
- CSS3 with responsive design

## 📊 Performance Metrics

- **500×500 grid**: ~1-2 seconds render time
- **Workers**: Utilizes 2x CPU cores for parallel processing
- **Memory**: Efficient memory usage with transferable objects
- **FPS**: Maintains 60fps UI during calculations

## 🏃‍♂️ Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```
