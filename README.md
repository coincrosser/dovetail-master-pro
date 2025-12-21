# Dovetail Master Pro 🪵📐

**Dovetail Master Pro** is a professional-grade woodworking CAD and calculation engine. It allows joiners to design, visualize, and calculate the perfect dovetail joints for any project, from utility tool chests to master-level "London Style" cabinetry.

## 🚀 Features

- **Interactive 2D Blueprints**: Real-time SVG generation with "Wood vs Waste" cross-hatching and precise slope annotations.
- **3D Piston-Fit Visualization**: Powered by Three.js, view your joints in a high-fidelity 3D environment with animated assembly.
- **AI Joinery Consultant**: Integrated Gemini 3.0 Flash logic to analyze your geometry and provide structural advice.
- **Curator Console**: A hidden power-tool for developers to update joint presets with custom Base64 imagery.
- **Master Export Suite**: One-click exports for `.svg` blueprints and `.glb` 3D models.
- **Slope Intelligence**: Built-in support for 1:5, 1:6, 1:7, 1:8, 1:9, and 1:10 ratios.

## 🛠 Tech Stack

- **Framework**: React 19 (ESM Mode)
- **Graphics**: Three.js (WebGL)
- **Intelligence**: Google Gemini API (@google/genai)
- **Styling**: Tailwind CSS
- **Icons**: FontAwesome 6

## 📦 Installation & Local Development

Since this project utilizes browser-native ESM and Import Maps, you can run it without a complex build step.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/dovetail-master-pro.git
   cd dovetail-master-pro
   ```

2. **Serve the project**:
   You can use any local server. If you have Node.js installed:
   ```bash
   npx serve .
   ```

3. **API Key Setup**:
   The application requires a valid `process.env.API_KEY` to function. Ensure your environment is configured to inject this key.

## 📐 Geometric Protocols

The engine adheres to standard joinery mathematics:
- **Tail Width**: `Total_Width / (Num_Tails + 0.5)`
- **Slope Run**: `Board_Thickness / Angle_Denominator`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built for the Modern Craftsman by Hookyard Engineering.*
